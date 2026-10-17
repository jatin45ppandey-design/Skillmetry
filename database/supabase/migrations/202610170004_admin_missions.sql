-- Admin Studio Phase 4. Staged: apply ONLY after admin migrations 001–003 in authorized staging.
-- Student-authenticated roles never read private mission drafts or write CMS tables.
create table if not exists public.admin_missions (
 id text primary key check(id ~ '^cms-[a-z][a-z0-9-]{2,55}$'),
 career_id text not null references public.careers(id) on delete restrict,
 skill_id text not null references public.skills(id) on delete restrict,
 draft jsonb,
 published jsonb,
 revision integer not null default 0 check(revision>=0),
 published_revision integer not null default 0 check(published_revision>=0),
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),
 published_at timestamptz,
 check (draft is null or (jsonb_typeof(draft)='object' and octet_length(draft::text)<=12000)),
 check (published is null or (jsonb_typeof(published)='object' and octet_length(published::text)<=12000))
);
create index if not exists admin_missions_by_career on public.admin_missions(career_id);
create table if not exists public.admin_mission_revisions (
 id bigint generated always as identity primary key,
 mission_id text not null references public.admin_missions(id) on delete restrict,
 revision integer not null check(revision>0),
 action text not null check(action in ('save','publish')),
 actor_id uuid references auth.users(id) on delete set null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 unique(mission_id,revision)
);
alter table public.admin_missions enable row level security;
alter table public.admin_missions force row level security;
alter table public.admin_mission_revisions enable row level security;
alter table public.admin_mission_revisions force row level security;
revoke all on public.admin_missions,public.admin_mission_revisions from public,anon,authenticated;
grant select,insert,update on public.admin_missions to service_role;
grant select,insert on public.admin_mission_revisions to service_role;
revoke all on sequence public.admin_mission_revisions_id_seq from public,anon,authenticated;
grant usage,select on sequence public.admin_mission_revisions_id_seq to service_role;

create or replace function public.save_admin_mission(
 p_actor uuid,p_id text,p_career_id text,p_skill_id text,
 p_draft jsonb,p_expected_revision integer,p_publish boolean default false
) returns jsonb
language plpgsql security definer
set search_path=''
as $mission$
declare
 v_role text;
 v_mission public.admin_missions%rowtype;
 v_next integer;
 v_hours integer;
begin
 if p_actor is null or p_id is null or p_career_id is null or p_skill_id is null or
    p_expected_revision is null or p_expected_revision<0 or
    p_id !~ '^cms-[a-z][a-z0-9-]{2,55}$' or
    p_draft is null or pg_catalog.jsonb_typeof(p_draft)<>'object' or
    pg_catalog.octet_length(p_draft::text)>12000 then
   raise exception using errcode='22023',message='Invalid mission payload';
 end if;
 select role into v_role from public.admin_members where user_id=p_actor;
 if v_role is null or v_role not in ('owner','editor') or (p_publish and v_role<>'owner') then
   raise exception using errcode='42501',message='Not permitted to edit or publish missions';
 end if;
 if not exists(select 1 from public.career_skills
    where career_id=p_career_id and skill_id=p_skill_id) then
   raise exception using errcode='22023',message='Unknown career and skill combination';
 end if;
 if pg_catalog.jsonb_typeof(p_draft->'title') is distinct from 'string' or
    pg_catalog.length(p_draft->>'title') not between 8 and 130 or
    pg_catalog.jsonb_typeof(p_draft->'description') is distinct from 'string' or
    pg_catalog.length(p_draft->>'description') not between 25 and 800 or
    pg_catalog.jsonb_typeof(p_draft->'deliverables') is distinct from 'array' then
   raise exception using errcode='22023',message='Invalid mission details';
 end if;
 if pg_catalog.jsonb_array_length(p_draft->'deliverables') not between 1 and 12 or
    pg_catalog.jsonb_typeof(p_draft->'estimatedHours') is distinct from 'number' or
    (p_draft->>'estimatedHours') !~ '^[0-9]{1,2}$' then
   raise exception using errcode='22023',message='Invalid mission checklist or time';
 end if;
 v_hours:=(p_draft->>'estimatedHours')::integer;
 if v_hours not between 1 and 80 then
   raise exception using errcode='22023',message='Invalid estimated hours';
 end if;
 if exists(select 1 from pg_catalog.jsonb_array_elements(p_draft->'deliverables') as item
    where pg_catalog.jsonb_typeof(item) <> 'string' or
    pg_catalog.length(pg_catalog.btrim(item #>> '{}')) not between 5 and 180) or
    (select pg_catalog.count(*) from
       (select pg_catalog.lower(pg_catalog.btrim(value)) as item
        from pg_catalog.jsonb_array_elements_text(p_draft->'deliverables')) entries)
      <>
    (select pg_catalog.count(distinct pg_catalog.lower(pg_catalog.btrim(value)))
       from pg_catalog.jsonb_array_elements_text(p_draft->'deliverables')) then
   raise exception using errcode='22023',message='Invalid or duplicate checklist entries';
 end if;
 -- A new CMS ID may not hijack an already existing canonical mission.
 if p_expected_revision=0 and exists(select 1 from public.missions where id=p_id) then
   raise exception using errcode='22023',message='Mission ID is already reserved';
 end if;
 insert into public.admin_missions(id,career_id,skill_id,revision)
  values(p_id,p_career_id,p_skill_id,0) on conflict(id) do nothing;
 select * into v_mission from public.admin_missions where id=p_id for update;
 if v_mission.career_id<>p_career_id or v_mission.skill_id<>p_skill_id then
   raise exception using errcode='22023',message='Mission career and skill identity is immutable';
 end if;
 if v_mission.revision<>p_expected_revision then
   raise exception using errcode='P0001',message='revision_conflict';
 end if;
 -- Student checklists use positional indices. After first publish the checklist
 -- cannot change; author a NEW CMS mission ID for a different structure.
 if v_mission.published is not null and
    v_mission.published->'deliverables' is distinct from p_draft->'deliverables' then
   raise exception using errcode='22023',message='published_checklist_immutable';
 end if;
 v_next:=v_mission.revision+1;
 update public.admin_missions set
   draft=p_draft,published=case when p_publish then p_draft else published end,
   revision=v_next,
   published_revision=case when p_publish then v_next else published_revision end,
   published_at=case when p_publish then now() else published_at end,
   updated_by=p_actor,updated_at=now()
 where id=p_id;
 if p_publish then
   insert into public.missions(id,career_id,skill_id,title,description,estimated_hours)
   values(p_id,p_career_id,p_skill_id,p_draft->>'title',
     p_draft->>'description',v_hours)
   on conflict(id) do update set
     title=excluded.title,description=excluded.description,estimated_hours=excluded.estimated_hours;
 end if;
 insert into public.admin_mission_revisions(mission_id,revision,action,actor_id,snapshot)
 values(p_id,v_next,case when p_publish then 'publish' else 'save' end,p_actor,p_draft);
 return pg_catalog.jsonb_build_object('id',p_id,'revision',v_next,
   'publishedRevision',case when p_publish then v_next else v_mission.published_revision end);
end;
$mission$;
revoke all on function public.save_admin_mission(uuid,text,text,text,jsonb,integer,boolean) from public,anon,authenticated;
grant execute on function public.save_admin_mission(uuid,text,text,text,jsonb,integer,boolean) to service_role;
