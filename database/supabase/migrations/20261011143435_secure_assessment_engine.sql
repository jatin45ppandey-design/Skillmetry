-- Quiz-driven Digital Twin: persistent server-created sessions and immutable results.
-- This migration is additive and preserves all legacy profile, claimed-skill and
-- assessment data. Existing attempts are explicitly marked legacy_untrusted.

create table public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null,
  assessment_version text not null,
  question_ids text[] not null,
  status text not null default 'active' check (status in ('active', 'completed', 'expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  constraint assessment_sessions_question_count check (cardinality(question_ids) between 1 and 50),
  constraint assessment_sessions_expiry check (expires_at > started_at),
  constraint assessment_sessions_completion check (
    (status = 'active' and completed_at is null)
    or (status in ('completed', 'expired'))
  )
);

create index assessment_sessions_owner_history_idx
  on public.assessment_sessions (user_id, assessment_id, started_at desc);
create index assessment_sessions_active_idx
  on public.assessment_sessions (user_id, assessment_id, expires_at)
  where status = 'active';

alter table public.assessment_attempts
  add column if not exists session_id uuid references public.assessment_sessions(id),
  add column if not exists assessment_version text,
  add column if not exists correct_count int,
  add column if not exists total_questions int,
  add column if not exists completed_at timestamptz,
  add column if not exists grading_method text;

update public.assessment_attempts
set assessment_version = coalesce(assessment_version, 'legacy-client'),
    completed_at = coalesce(completed_at, created_at),
    grading_method = coalesce(grading_method, 'legacy_untrusted');

alter table public.assessment_attempts
  alter column assessment_version set default 'legacy-client',
  alter column assessment_version set not null,
  alter column completed_at set default now(),
  alter column completed_at set not null,
  alter column grading_method set default 'legacy_untrusted',
  alter column grading_method set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'assessment_attempts_session_unique'
      and conrelid = 'public.assessment_attempts'::regclass
  ) then
    alter table public.assessment_attempts
      add constraint assessment_attempts_session_unique unique (session_id);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'assessment_attempts_grading_method_check'
      and conrelid = 'public.assessment_attempts'::regclass
  ) then
    alter table public.assessment_attempts
      add constraint assessment_attempts_grading_method_check
      check (grading_method in ('legacy_untrusted', 'server_quiz'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'assessment_attempts_server_result_check'
      and conrelid = 'public.assessment_attempts'::regclass
  ) then
    alter table public.assessment_attempts
      add constraint assessment_attempts_server_result_check check (
        grading_method = 'legacy_untrusted'
        or (
          session_id is not null
          and correct_count between 0 and total_questions
          and total_questions between 1 and 50
          and score = round((correct_count::numeric * 100) / total_questions, 2)
        )
      );
  end if;
end $$;

create index assessment_attempts_latest_trusted_idx
  on public.assessment_attempts (user_id, skill_id, completed_at desc)
  where grading_method = 'server_quiz';

-- Manual ratings are obsolete. Preserve historical rows for compatibility, but
-- remove all student write paths so they cannot become an input to the new twin.
revoke insert (user_id, skill_id, claimed_proficiency)
  on table public.user_skills from authenticated;
revoke update (claimed_proficiency)
  on table public.user_skills from authenticated;
drop policy if exists "user_skills_insert_claimed_own" on public.user_skills;
drop policy if exists "user_skills_update_claimed_own" on public.user_skills;

-- Quiz sessions are an internal server resource. Students interact only through
-- authenticated route handlers and can read their own completed attempt rows.
alter table public.assessment_sessions enable row level security;
alter table public.assessment_sessions force row level security;
revoke all on table public.assessment_sessions from public, anon, authenticated;
grant select, insert, update on table public.assessment_sessions to service_role;
grant select, insert on table public.assessment_attempts to service_role;

create or replace function public.complete_assessment_session(
  p_session_id uuid,
  p_user_id uuid,
  p_score numeric,
  p_correct_count int,
  p_total_questions int,
  p_passed boolean
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_session public.assessment_sessions%rowtype;
  v_attempt_id uuid;
begin
  if p_total_questions < 1
    or p_correct_count < 0
    or p_correct_count > p_total_questions
    or p_score <> round((p_correct_count::numeric * 100) / p_total_questions, 2)
  then
    raise exception 'invalid assessment result';
  end if;

  update public.assessment_sessions
  set status = 'completed', completed_at = now()
  where id = p_session_id
    and user_id = p_user_id
    and status = 'active'
    and completed_at is null
    and expires_at > now()
  returning * into v_session;

  if not found then
    raise exception 'assessment session is invalid, expired, or already completed';
  end if;

  insert into public.assessment_attempts (
    session_id,
    user_id,
    assessment_id,
    assessment_version,
    skill_id,
    score,
    passed,
    correct_count,
    total_questions,
    completed_at,
    grading_method
  ) values (
    v_session.id,
    v_session.user_id,
    v_session.assessment_id,
    v_session.assessment_version,
    case v_session.assessment_id
      when 'python-foundations' then 'python'
      when 'sql-foundations' then 'sql'
      when 'javascript-foundations' then 'javascript'
      when 'html-foundations' then 'html'
      else null
    end,
    p_score,
    p_passed,
    p_correct_count,
    p_total_questions,
    now(),
    'server_quiz'
  ) returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;

revoke execute on function public.complete_assessment_session(uuid, uuid, numeric, int, int, boolean)
  from public, anon, authenticated;
grant execute on function public.complete_assessment_session(uuid, uuid, numeric, int, int, boolean)
  to service_role;

comment on table public.assessment_sessions is
  'Short-lived quiz sessions created and consumed only by trusted server routes.';
comment on column public.assessment_attempts.grading_method is
  'Only server_quiz rows contribute to the current Digital Twin; legacy rows are preserved but excluded.';
comment on function public.complete_assessment_session(uuid, uuid, numeric, int, int, boolean) is
  'Atomically consumes one active session and records one immutable trusted result. Service role only.';
