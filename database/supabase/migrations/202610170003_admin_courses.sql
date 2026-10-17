-- Admin course library: multiple courses per skill, structured lessons, staged.
create table if not exists public.admin_courses (
 slug text primary key check(slug ~ '^[a-z][a-z0-9-]{3,49}$'),
 skill_id text not null references public.skills(id) on delete restrict,
 draft jsonb,
 published jsonb,
 revision integer not null default 0 check(revision>=0),
 published_revision integer not null default 0 check(published_revision>=0),
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),
 published_at timestamptz,
 check (draft is null or (jsonb_typeof(draft)='object' and octet_length(draft::text)<=50000)),
 check (published is null or (jsonb_typeof(published)='object' and octet_length(published::text)<=50000))
);
create index if not exists admin_courses_by_skill on public.admin_courses(skill_id);
create table if not exists public.admin_course_revisions (
 id bigint generated always as identity primary key,
 slug text not null references public.admin_courses(slug) on delete restrict,
 revision integer not null check(revision>0),
 action text not null check(action in ('save','publish')),
 actor_id uuid references auth.users(id) on delete set null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 unique(slug,revision)
);
alter table public.admin_courses enable row level security;
alter table public.admin_courses force row level security;
alter table public.admin_course_revisions enable row level security;
alter table public.admin_course_revisions force row level security;
revoke all on public.admin_courses,public.admin_course_revisions from public,anon,authenticated;
grant select,insert,update on public.admin_courses to service_role;
grant select,insert on public.admin_course_revisions to service_role;
revoke all on sequence public.admin_course_revisions_id_seq from public,anon,authenticated;
grant usage,select on sequence public.admin_course_revisions_id_seq to service_role;

create or replace function public.save_admin_course(
 p_actor uuid,p_slug text,p_skill_id text,p_draft jsonb,
 p_expected_revision integer,p_publish boolean default false
) returns jsonb
language plpgsql security definer
set search_path=''
as $course$
declare
 v_role text;
 v_course public.admin_courses%rowtype;
 v_next integer;
begin
 if p_actor is null or p_slug is null or p_skill_id is null or
    p_expected_revision is null or p_expected_revision<0 or
    p_slug !~ '^[a-z][a-z0-9-]{3,49}$' or
    p_draft is null or pg_catalog.jsonb_typeof(p_draft)<>'object' or
    pg_catalog.octet_length(p_draft::text)>50000 then
    raise exception using errcode='22023',message='Invalid course payload';
 end if;
 select role into v_role from public.admin_members where user_id=p_actor;
 if v_role is null or v_role not in ('owner','editor') or(p_publish and v_role<>'owner') then
   raise exception using errcode='42501',message='Not permitted to edit or publish courses';
 end if;
 if not exists(select 1 from public.skills where id=p_skill_id) or
    pg_catalog.jsonb_typeof(p_draft->'modules')<>'array' or
    pg_catalog.jsonb_array_length(p_draft->'modules') not between 1 and 12 then
   raise exception using errcode='22023',message='Invalid course structure';
 end if;
 if exists(select 1 from pg_catalog.jsonb_array_elements(p_draft->'modules') as m
    where pg_catalog.jsonb_typeof(m->'lessons')<>'array' or
      pg_catalog.jsonb_array_length(m->'lessons') not between 1 and 16) then
   raise exception using errcode='22023',message='Invalid module lessons';
 end if;
 insert into public.admin_courses(slug,skill_id,revision)
  values(p_slug,p_skill_id,0) on conflict(slug) do nothing;
 select * into v_course from public.admin_courses where slug=p_slug for update;
 if v_course.skill_id<>p_skill_id then
   raise exception using errcode='22023',message='Course skill identity is immutable';
 end if;
 if v_course.revision<>p_expected_revision then
   raise exception using errcode='P0001',message='revision_conflict';
 end if;
 v_next:=v_course.revision+1;
 update public.admin_courses set
   draft=p_draft,published=case when p_publish then p_draft else published end,
   revision=v_next,published_revision=case when p_publish then v_next else published_revision end,
   published_at=case when p_publish then now() else published_at end,
   updated_by=p_actor,updated_at=now()
 where slug=p_slug;
 insert into public.admin_course_revisions(slug,revision,action,actor_id,snapshot)
 values(p_slug,v_next,case when p_publish then 'publish' else 'save' end,p_actor,p_draft);
 return pg_catalog.jsonb_build_object('slug',p_slug,'revision',v_next,
   'publishedRevision',case when p_publish then v_next else v_course.published_revision end);
end;
$course$;
revoke all on function public.save_admin_course(uuid,text,text,jsonb,integer,boolean) from public,anon,authenticated;
grant execute on function public.save_admin_course(uuid,text,text,jsonb,integer,boolean) to service_role;
