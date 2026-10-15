-- Assessment concurrency and grading hardening.
-- This migration is additive and is safe to apply after
-- 20261011143435_secure_assessment_engine.sql. It preserves every attempt.

alter table public.assessment_attempts
  add column if not exists pass_threshold numeric(5,2);

-- Results produced by the first server-graded assessment version used a 70%
-- pass threshold. Preserve that historical meaning instead of rewriting it.
update public.assessment_attempts
set pass_threshold = case
  when assessment_version = '2026.1' then 70
  else 75
end
where grading_method = 'server_quiz'
  and pass_threshold is null;

alter table public.assessment_attempts
  drop constraint if exists assessment_attempts_server_result_check;

alter table public.assessment_attempts
  add constraint assessment_attempts_server_result_check check (
    grading_method = 'legacy_untrusted'
    or (
      session_id is not null
      and correct_count between 0 and total_questions
      and total_questions between 1 and 50
      and score = round((correct_count::numeric * 100) / total_questions, 2)
      and pass_threshold between 1 and 100
      and passed = (score >= pass_threshold)
    )
  );

-- Normalize stale and duplicate active sessions before enforcing uniqueness.
update public.assessment_sessions
set status = 'expired', completed_at = null
where status = 'active'
  and expires_at <= now();

with ranked_active as (
  select
    id,
    row_number() over (
      partition by user_id, assessment_id, assessment_version
      order by started_at desc, id desc
    ) as active_rank
  from public.assessment_sessions
  where status = 'active'
)
update public.assessment_sessions as sessions
set status = 'expired', completed_at = null
from ranked_active
where sessions.id = ranked_active.id
  and ranked_active.active_rank > 1;

alter table public.assessment_sessions
  drop constraint if exists assessment_sessions_completion;

alter table public.assessment_sessions
  add constraint assessment_sessions_completion check (
    (status = 'active' and completed_at is null)
    or (status = 'completed' and completed_at is not null)
    or (status = 'expired' and completed_at is null)
  );

drop index if exists public.assessment_sessions_active_idx;
create unique index assessment_sessions_active_idx
  on public.assessment_sessions (user_id, assessment_id, assessment_version)
  where status = 'active';

drop index if exists public.assessment_attempts_latest_trusted_idx;
create index assessment_attempts_latest_trusted_idx
  on public.assessment_attempts (user_id, skill_id, completed_at desc, id desc)
  where grading_method = 'server_quiz';

create or replace function public.start_or_resume_assessment_session(
  p_user_id uuid,
  p_assessment_id text,
  p_assessment_version text,
  p_question_ids text[],
  p_expires_at timestamptz,
  p_max_completions int default null,
  p_window_minutes int default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_session_id uuid;
  v_completion_count bigint;
begin
  if p_assessment_id not in (
      'python-foundations',
      'sql-foundations',
      'javascript-foundations',
      'html-foundations'
    )
    or pg_catalog.btrim(p_assessment_version) = ''
    or pg_catalog.cardinality(p_question_ids) not between 1 and 50
    or pg_catalog.array_position(p_question_ids, null) is not null
    or p_expires_at <= now()
  then
    raise exception using errcode = '22023', message = 'invalid assessment session input';
  end if;

  if (p_max_completions is null) <> (p_window_minutes is null)
    or (p_max_completions is not null and p_max_completions < 1)
    or (p_window_minutes is not null and p_window_minutes < 1)
  then
    raise exception using errcode = '22023', message = 'invalid assessment retake policy';
  end if;

  -- Serialize starts for one student and assessment. This makes both session
  -- reuse and an optional completion-window policy atomic across app instances.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text || ':' || p_assessment_id, 0)
  );

  update public.assessment_sessions
  set status = 'expired', completed_at = null
  where user_id = p_user_id
    and assessment_id = p_assessment_id
    and assessment_version = p_assessment_version
    and status = 'active'
    and expires_at <= now();

  select id
  into v_session_id
  from public.assessment_sessions
  where user_id = p_user_id
    and assessment_id = p_assessment_id
    and assessment_version = p_assessment_version
    and status = 'active'
    and expires_at > now()
  order by started_at desc, id desc
  limit 1
  for update;

  if found then
    return v_session_id;
  end if;

  if p_max_completions is not null then
    select count(*)
    into v_completion_count
    from public.assessment_attempts
    where user_id = p_user_id
      and assessment_id = p_assessment_id
      and grading_method = 'server_quiz'
      and completed_at >= now() - pg_catalog.make_interval(mins => p_window_minutes);

    if v_completion_count >= p_max_completions then
      raise exception using errcode = 'P0001', message = 'assessment completion limit reached';
    end if;
  end if;

  insert into public.assessment_sessions (
    user_id,
    assessment_id,
    assessment_version,
    question_ids,
    expires_at
  ) values (
    p_user_id,
    p_assessment_id,
    p_assessment_version,
    p_question_ids,
    p_expires_at
  )
  on conflict (user_id, assessment_id, assessment_version)
    where status = 'active'
    do nothing
  returning id into v_session_id;

  if v_session_id is null then
    select id
    into v_session_id
    from public.assessment_sessions
    where user_id = p_user_id
      and assessment_id = p_assessment_id
      and assessment_version = p_assessment_version
      and status = 'active'
      and expires_at > now()
    order by started_at desc, id desc
    limit 1;
  end if;

  if v_session_id is null then
    raise exception 'assessment session could not be created';
  end if;

  return v_session_id;
end;
$$;

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
  v_pass_threshold numeric(5,2);
begin
  if p_total_questions < 1
    or p_correct_count < 0
    or p_correct_count > p_total_questions
    or p_score <> round((p_correct_count::numeric * 100) / p_total_questions, 2)
  then
    raise exception using errcode = '22023', message = 'invalid assessment result';
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

  if p_total_questions <> pg_catalog.cardinality(v_session.question_ids) then
    raise exception using errcode = '22023', message = 'assessment question count mismatch';
  end if;

  -- Version 2026.1 used the original 70% pass threshold. All current and
  -- future versions use the approved 75% Strong Quiz Performance threshold.
  v_pass_threshold := case
    when v_session.assessment_version = '2026.1' then 70
    else 75
  end;

  if p_passed is distinct from (p_score >= v_pass_threshold) then
    raise exception using errcode = '22023', message = 'assessment pass result mismatch';
  end if;

  insert into public.assessment_attempts (
    session_id,
    user_id,
    assessment_id,
    assessment_version,
    skill_id,
    score,
    passed,
    pass_threshold,
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
    v_pass_threshold,
    p_correct_count,
    p_total_questions,
    now(),
    'server_quiz'
  ) returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;

revoke execute on function public.start_or_resume_assessment_session(uuid, text, text, text[], timestamptz, int, int)
  from public, anon, authenticated;
grant execute on function public.start_or_resume_assessment_session(uuid, text, text, text[], timestamptz, int, int)
  to service_role;

revoke execute on function public.complete_assessment_session(uuid, uuid, numeric, int, int, boolean)
  from public, anon, authenticated;
grant execute on function public.complete_assessment_session(uuid, uuid, numeric, int, int, boolean)
  to service_role;

comment on column public.assessment_attempts.pass_threshold is
  'Versioned pass threshold used to derive the immutable passed flag for a server-graded result.';
comment on column public.user_skills.claimed_proficiency is
  'Legacy self-report retained for compatibility. Student writes are disabled and this value never contributes to a trusted score.';
comment on function public.start_or_resume_assessment_session(uuid, text, text, text[], timestamptz, int, int) is
  'Atomically expires stale sessions, resumes one active owner session, or creates exactly one new session. Service role only.';
