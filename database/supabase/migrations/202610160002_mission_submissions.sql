-- Phase 2: student-submitted project evidence. This is UNVERIFIED work, never a grade.
-- Additive migration. Apply to staging and run pgTAP before any hosted deployment.
create table public.mission_submissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null check (length(mission_id) between 1 and 64),
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  checked_deliverables integer[] not null default '{}'
    check (cardinality(checked_deliverables) between 0 and 20 and 0 <= all(checked_deliverables)),
  reflection text not null default '' check (length(reflection) <= 1600),
  evidence_url text check (
    evidence_url is null or (length(evidence_url) <= 2048 and evidence_url ~ '^https://[^[:space:]]+$')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  primary key (user_id, mission_id),
  constraint mission_submissions_state_check check (
    (status = 'draft' and submitted_at is null)
    or (status = 'submitted' and submitted_at is not null
        and evidence_url is not null and cardinality(checked_deliverables) > 0)
  )
);
create index mission_submissions_owner_status_idx
  on public.mission_submissions (user_id, status, updated_at desc);

-- Server timestamps cannot be forged via the public data API. Submission is immutable.
create function public.guard_mission_submission()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if old.status = 'submitted' then
      raise exception using errcode = '22023', message = 'submitted mission evidence is immutable';
    end if;
    if new.user_id <> old.user_id or new.mission_id <> old.mission_id then
      raise exception using errcode = '22023', message = 'mission ownership is immutable';
    end if;
    new.created_at := old.created_at;
  else
    new.created_at := now();
  end if;
  new.updated_at := now();
  if new.status = 'submitted' then
    new.submitted_at := now();
  else
    new.submitted_at := null;
  end if;
  return new;
end;
$$;
create trigger mission_submission_guard_trigger
  before insert or update on public.mission_submissions
  for each row execute function public.guard_mission_submission();

alter table public.mission_submissions enable row level security;
alter table public.mission_submissions force row level security;
revoke all on public.mission_submissions from public, anon, authenticated;
grant select, insert, update on public.mission_submissions to authenticated;
grant select, insert, update on public.mission_submissions to service_role;
create policy "Students read own mission submissions"
  on public.mission_submissions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Students insert own mission submissions"
  on public.mission_submissions for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Students edit own draft missions"
  on public.mission_submissions for update to authenticated
  using (user_id = (select auth.uid()) and status = 'draft')
  with check (user_id = (select auth.uid()));
revoke execute on function public.guard_mission_submission()
  from public, anon, authenticated;

comment on table public.mission_submissions is
  'Private self-reported project work; never human verified, never a trusted assessment score.';
