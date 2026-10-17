-- Versioned editorial roadmap descriptions and study sequence only.
-- Canonical skill prerequisites, career weights and trusted scores are immutable here.
create table if not exists public.admin_career_roadmaps (
 career_id text primary key references public.careers(id) on delete restrict,
 draft jsonb,
 published jsonb,
 revision integer not null default 0 check(revision>=0),
 published_revision integer not null default 0 check(published_revision>=0),
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),
 published_at timestamptz,
 check(draft is null or (jsonb_typeof(draft)='object' and octet_length(draft::text)<=16000)),
 check(published is null or (jsonb_typeof(published)='object' and octet_length(published::text)<=16000))
);
create table if not exists public.admin_career_roadmap_revisions(
 id bigint generated always as identity primary key,
 career_id text not null references public.careers(id) on delete restrict,
 revision integer not null check(revision>0),
 action text not null check(action in ('save','publish')),
 actor_id uuid references auth.users(id) on delete set null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 unique(career_id,revision)
);
create index if not exists admin_roadmap_revision_recent on public.admin_career_roadmap_revisions(career_id,created_at desc);
alter table public.admin_career_roadmaps enable row level security;
alter table public.admin_career_roadmaps force row level security;
alter table public.admin_career_roadmap_revisions enable row level security;
alter table public.admin_career_roadmap_revisions force row level security;
revoke all on public.admin_career_roadmaps, public.admin_career_roadmap_revisions from public,anon,authenticated;
grant select,insert,update on public.admin_career_roadmaps to service_role;
grant select,insert on public.admin_career_roadmap_revisions to service_role;
revoke all on sequence public.admin_career_roadmap_revisions_id_seq from public,anon,authenticated;
grant usage,select on sequence public.admin_career_roadmap_revisions_id_seq to service_role;

create or replace function public.save_admin_career_roadmap(
 p_actor uuid,p_career_id text,p_draft jsonb,p_expected_revision integer,
 p_publish boolean default false
) returns jsonb
language plpgsql security definer
set search_path=''
as $adminroadmap$
declare
 v_role text;
 v_current public.admin_career_roadmaps%rowtype;
 v_steps jsonb;
 v_count integer;
 v_next integer;
begin
 if p_actor is null or p_career_id is null or p_draft is null or
    pg_catalog.jsonb_typeof(p_draft)<>'object' or
    p_expected_revision is null or p_expected_revision<0 or
    pg_catalog.octet_length(p_draft::text)>16000 then
    raise exception using errcode='22023',message='Invalid roadmap payload';
 end if;
 select role into v_role from public.admin_members where user_id=p_actor;
 if v_role is null or v_role not in ('owner','editor') or (p_publish and v_role<>'owner') then
   raise exception using errcode='42501',message='Not permitted to update a career roadmap';
 end if;
 if not exists(select 1 from public.careers where id=p_career_id) then
   raise exception using errcode='22023',message='Unknown career';
 end if;
 v_steps:=p_draft->'steps';
 if pg_catalog.jsonb_typeof(v_steps)<>'array' or
    pg_catalog.jsonb_array_length(v_steps)<1 or
    pg_catalog.jsonb_array_length(v_steps)>20 then
   raise exception using errcode='22023',message='Invalid skill sequence';
 end if;
 -- Every canonical career skill must appear exactly once, and nothing else.
 select count(*) into v_count from public.career_skills where career_id=p_career_id;
 if v_count<>pg_catalog.jsonb_array_length(v_steps) or
    (select count(distinct s->>'skillId') from pg_catalog.jsonb_array_elements(v_steps) as s)<>v_count or
    exists(select 1 from pg_catalog.jsonb_array_elements(v_steps) as s
      where not exists(select 1 from public.career_skills cs
       where cs.career_id=p_career_id and cs.skill_id=s->>'skillId')) then
   raise exception using errcode='22023',message='Roadmap skills do not match this career';
 end if;
 insert into public.admin_career_roadmaps(career_id,revision)
   values(p_career_id,0) on conflict(career_id) do nothing;
 select * into v_current from public.admin_career_roadmaps
   where career_id=p_career_id for update;
 if v_current.revision<>p_expected_revision then
    raise exception using errcode='P0001',message='revision_conflict';
 end if;
 v_next:=v_current.revision+1;
 update public.admin_career_roadmaps set
   draft=p_draft,published=case when p_publish then p_draft else published end,
   revision=v_next,
   published_revision=case when p_publish then v_next else published_revision end,
   published_at=case when p_publish then now() else published_at end,
   updated_by=p_actor,updated_at=now()
 where career_id=p_career_id;
 insert into public.admin_career_roadmap_revisions(career_id,revision,action,actor_id,snapshot)
 values(p_career_id,v_next,case when p_publish then 'publish' else 'save' end,p_actor,p_draft);
 return pg_catalog.jsonb_build_object('careerId',p_career_id,'revision',v_next,
   'publishedRevision',case when p_publish then v_next else v_current.published_revision end);
end;
$adminroadmap$;
revoke all on function public.save_admin_career_roadmap(uuid,text,jsonb,integer,boolean) from public,anon,authenticated;
grant execute on function public.save_admin_career_roadmap(uuid,text,jsonb,integer,boolean) to service_role;
