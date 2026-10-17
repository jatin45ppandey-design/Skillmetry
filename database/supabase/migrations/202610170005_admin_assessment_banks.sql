-- Phase 5: source-only assessment question authoring.
-- NEVER apply on hosted Supabase without separate approval, baseline migration review and backup.
-- Students cannot see drafts/answer keys; only trusted server may resolve immutable versions.
create table if not exists public.admin_assessment_banks (
 assessment_id text primary key check (assessment_id in (
  'python-foundations','sql-foundations','javascript-foundations','html-foundations',
  'css-foundations','typescript-foundations','react-foundations',
  'node-foundations','rest-api-foundations')),
 draft jsonb,
 revision integer not null default 0 check(revision>=0),
 published_version text,
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),
 published_at timestamptz,
 check(draft is null or (pg_catalog.jsonb_typeof(draft)='object' and pg_catalog.octet_length(draft::text)<=30000))
);
create table if not exists public.admin_assessment_versions(
 assessment_id text not null references public.admin_assessment_banks(assessment_id) on delete restrict,
 version text not null check(version ~ '^cms\.[1-9][0-9]{0,7}$'),
 snapshot jsonb not null check(pg_catalog.jsonb_typeof(snapshot)='object' and pg_catalog.octet_length(snapshot::text)<=30000),
 created_at timestamptz not null default now(),
 created_by uuid references auth.users(id) on delete set null,
 primary key(assessment_id,version)
);
create table if not exists public.admin_assessment_revisions(
 id bigint generated always as identity primary key,
 assessment_id text not null references public.admin_assessment_banks(assessment_id) on delete restrict,
 revision integer not null check(revision>0),
 action text not null check(action in ('save','publish')),
 actor_id uuid references auth.users(id) on delete set null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 unique(assessment_id,revision)
);
alter table public.admin_assessment_banks enable row level security;
alter table public.admin_assessment_banks force row level security;
alter table public.admin_assessment_versions enable row level security;
alter table public.admin_assessment_versions force row level security;
alter table public.admin_assessment_revisions enable row level security;
alter table public.admin_assessment_revisions force row level security;
revoke all on public.admin_assessment_banks,public.admin_assessment_versions,
 public.admin_assessment_revisions from public,anon,authenticated;
grant select,insert,update on public.admin_assessment_banks to service_role;
grant select,insert on public.admin_assessment_versions to service_role;
grant select,insert on public.admin_assessment_revisions to service_role;
revoke all on sequence public.admin_assessment_revisions_id_seq from public,anon,authenticated;
grant usage,select on sequence public.admin_assessment_revisions_id_seq to service_role;

create or replace function public.save_admin_assessment_bank(
 p_actor uuid,p_assessment_id text,p_draft jsonb,p_expected_revision integer,p_publish boolean default false
) returns jsonb
language plpgsql security definer set search_path=''
as $bank$
declare
 v_role text;
 v_bank public.admin_assessment_banks%rowtype;
 v_revision integer;
 v_version text;
 v_questions jsonb;
begin
 if p_actor is null or p_expected_revision is null or p_expected_revision<0 or
    p_assessment_id not in (
      'python-foundations','sql-foundations','javascript-foundations','html-foundations',
      'css-foundations','typescript-foundations','react-foundations','node-foundations','rest-api-foundations'
    ) or
    pg_catalog.jsonb_typeof(p_draft)<>'object' or
    pg_catalog.octet_length(p_draft::text)>30000 or
    pg_catalog.jsonb_typeof(p_draft->'questions')<>'array'
 then raise exception using errcode='22023',message='invalid_bank_payload';end if;
 select role into v_role from public.admin_members where user_id=p_actor;
 if v_role not in ('owner','editor') or (p_publish and v_role<>'owner') or v_role is null
 then raise exception using errcode='42501',message='editor_permission_required';end if;
 v_questions:=p_draft->'questions';
 if pg_catalog.jsonb_array_length(v_questions) not between 1 and 10 or
    (p_publish and pg_catalog.jsonb_array_length(v_questions)<>10)
 then raise exception using errcode='22023',message='invalid_question_count';end if;
 if exists(
   select 1 from pg_catalog.jsonb_array_elements(v_questions) q
   where pg_catalog.jsonb_typeof(q)<>'object'
      or coalesce(q->>'id','') !~ '^aq-[a-z][a-z0-9-]{2,38}$'
      or pg_catalog.length(coalesce(q->>'prompt','')) not between 12 and 500
      or pg_catalog.length(coalesce(q->>'explanation','')) not between 16 and 750
      or pg_catalog.jsonb_typeof(q->'choices')<>'array'
      or pg_catalog.jsonb_typeof(q->'correctIndex')<>'number'
      or coalesce(q->>'correctIndex','') !~ '^[0-3]$'
 ) then raise exception using errcode='22023',message='invalid_question_shape';end if;
 if exists(
   select 1 from pg_catalog.jsonb_array_elements(v_questions) q
   where pg_catalog.jsonb_array_length(q->'choices')<>4
      or exists(
        select 1 from pg_catalog.jsonb_array_elements(q->'choices') option
        where pg_catalog.jsonb_typeof(option)<>'string'
           or pg_catalog.length(option #>> '{}') not between 1 and 180
      )
      or (select count(distinct lower(pg_catalog.btrim(value))) from pg_catalog.jsonb_array_elements_text(q->'choices'))
         <>4
 ) then raise exception using errcode='22023',message='invalid_choices';end if;
 if (select count(distinct q->>'id') from pg_catalog.jsonb_array_elements(v_questions) q)
   <>pg_catalog.jsonb_array_length(v_questions)
 then raise exception using errcode='22023',message='duplicate_question_ids';end if;
 if p_publish and exists(
    select 1 from pg_catalog.jsonb_array_elements(v_questions) q
     where lower(q->>'prompt') like '%replace this draft question%'
        or lower(q->>'explanation') like '%replace this explanation%'
 ) then raise exception using errcode='22023',message='placeholder_question';end if;

 insert into public.admin_assessment_banks(assessment_id,revision)
 values(p_assessment_id,0) on conflict(assessment_id) do nothing;
 select * into v_bank from public.admin_assessment_banks
  where assessment_id=p_assessment_id for update;
 if v_bank.revision<>p_expected_revision
 then raise exception using errcode='P0001',message='revision_conflict';end if;
 v_revision:=v_bank.revision+1;
 update public.admin_assessment_banks
 set draft=p_draft,revision=v_revision,
     updated_by=p_actor,updated_at=now(),
     published_at=case when p_publish then now() else published_at end,
     published_version=case when p_publish then 'cms.'||v_revision::text else published_version end
 where assessment_id=p_assessment_id;
 if p_publish then
   v_version:='cms.'||v_revision::text;
   insert into public.admin_assessment_versions(assessment_id,version,snapshot,created_by)
   values(p_assessment_id,v_version,p_draft,p_actor);
 else
   v_version:=v_bank.published_version;
 end if;
 insert into public.admin_assessment_revisions(assessment_id,revision,action,actor_id,snapshot)
 values(p_assessment_id,v_revision,case when p_publish then 'publish' else 'save' end,p_actor,p_draft);
 return pg_catalog.jsonb_build_object('assessmentId',p_assessment_id,'revision',v_revision,
   'publishedVersion',v_version);
end;
$bank$;
revoke all on function public.save_admin_assessment_bank(uuid,text,jsonb,integer,boolean)
 from public,anon,authenticated;
grant execute on function public.save_admin_assessment_bank(uuid,text,jsonb,integer,boolean)
 to service_role;
