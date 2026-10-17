-- Skillmetry Admin Studio foundation. Never apply to hosted Supabase without approval.
-- All editorial drafts, publish state, membership and revisions are server-only.
create table if not exists public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check(role in ('owner','editor','reviewer')),
  created_at timestamptz not null default now()
);
create table if not exists public.admin_skill_guides (
  skill_id text primary key references public.skills(id) on delete restrict,
  draft jsonb,
  published jsonb,
  revision integer not null default 0 check(revision >= 0),
  published_revision integer not null default 0 check(published_revision >= 0),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  check (draft is null or (jsonb_typeof(draft)='object' and octet_length(draft::text)<=20000)),
  check (published is null or (jsonb_typeof(published)='object' and octet_length(published::text)<=20000))
);
create table if not exists public.admin_guide_revisions (
  id bigint generated always as identity primary key,
  skill_id text not null references public.skills(id) on delete restrict,
  revision integer not null check(revision > 0),
  action text not null check(action in ('save','publish')),
  actor_id uuid references auth.users(id) on delete set null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique(skill_id,revision)
);
create index if not exists admin_guide_revision_skill_time
  on public.admin_guide_revisions(skill_id,created_at desc);

alter table public.admin_members enable row level security;
alter table public.admin_members force row level security;
alter table public.admin_skill_guides enable row level security;
alter table public.admin_skill_guides force row level security;
alter table public.admin_guide_revisions enable row level security;
alter table public.admin_guide_revisions force row level security;

revoke all on public.admin_members,public.admin_skill_guides,public.admin_guide_revisions
  from public,anon,authenticated;
grant select,insert,update,delete on public.admin_members to service_role;
grant select,insert,update,delete on public.admin_skill_guides to service_role;
grant select,insert on public.admin_guide_revisions to service_role;
-- No policies for anon/authenticated: browser Data API cannot see draft/revisions.
revoke all on sequence public.admin_guide_revisions_id_seq from public,anon,authenticated;
grant usage,select on sequence public.admin_guide_revisions_id_seq to service_role;

create or replace function public.save_admin_skill_guide(
  p_actor uuid, p_skill_id text, p_draft jsonb, p_expected_revision integer,
  p_publish boolean default false
) returns jsonb
language plpgsql security definer
set search_path = ''
as $admin$
declare
  v_role text;
  v_guide public.admin_skill_guides%rowtype;
  v_next integer;
begin
  -- Only a backend service client can invoke. The actor is verified against
  -- server-managed membership, never a browser-selected role.
  if p_actor is null or p_skill_id is null or p_expected_revision is null or
     p_expected_revision < 0 or p_draft is null or
     pg_catalog.jsonb_typeof(p_draft) <> 'object' or
     pg_catalog.octet_length(p_draft::text)>20000 then
    raise exception using errcode='22023', message='Invalid guide update';
  end if;
  select role into v_role from public.admin_members where user_id=p_actor;
  if v_role not in ('owner','editor') or v_role is null or
     (p_publish and v_role <> 'owner') then
    raise exception using errcode='42501', message='Not authorized to edit or publish guides';
  end if;
  if not exists(select 1 from public.skills where id=p_skill_id) then
    raise exception using errcode='22023', message='Unknown skill ID';
  end if;
  if pg_catalog.jsonb_typeof(p_draft->'notes')<>'array' or
     pg_catalog.jsonb_array_length(p_draft->'notes')<3 or
     pg_catalog.jsonb_array_length(p_draft->'notes')>12 or
     not (p_draft->'documentation'->>'url' like 'https://%' and
          p_draft->'lecture'->>'url' like 'https://%') then
    raise exception using errcode='22023', message='Invalid guide structure';
  end if;

  insert into public.admin_skill_guides(skill_id,revision)
    values(p_skill_id,0) on conflict(skill_id) do nothing;
  select * into v_guide from public.admin_skill_guides
    where skill_id=p_skill_id for update;
  if v_guide.revision <> p_expected_revision then
    raise exception using errcode='P0001', message='revision_conflict';
  end if;
  v_next:=v_guide.revision+1;
  update public.admin_skill_guides set
    draft=p_draft,
    published=case when p_publish then p_draft else published end,
    revision=v_next,
    published_revision=case when p_publish then v_next else published_revision end,
    published_at=case when p_publish then now() else published_at end,
    updated_by=p_actor,updated_at=now()
    where skill_id=p_skill_id;
  insert into public.admin_guide_revisions(skill_id,revision,action,actor_id,snapshot)
    values(p_skill_id,v_next,case when p_publish then 'publish' else 'save' end,p_actor,p_draft);
  return pg_catalog.jsonb_build_object('skillId',p_skill_id,'revision',v_next,
    'publishedRevision',case when p_publish then v_next else v_guide.published_revision end,
    'published',p_publish);
end;
$admin$;
revoke all on function public.save_admin_skill_guide(uuid,text,jsonb,integer,boolean)
  from public,anon,authenticated;
grant execute on function public.save_admin_skill_guide(uuid,text,jsonb,integer,boolean)
  to service_role;
comment on function public.save_admin_skill_guide(uuid,text,jsonb,integer,boolean)
  is 'Service-only transactional guide save with membership check, optimistic revision, and atomic audit.';

-- Bootstrapping: authorized database operator must explicitly insert an actual
-- authenticated owner user UUID into public.admin_members (role=owner).
-- Do not select the first user, infer admin from email, or auto-promote signups.
