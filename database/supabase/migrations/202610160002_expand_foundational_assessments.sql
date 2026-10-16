-- Expanded 2026.2 foundational assessments; preserves all prior rows and grants.
-- Staging-only until explicitly approved for the hosted environment.
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
      'html-foundations',
      'css-foundations',
      'typescript-foundations',
      'react-foundations',
      'node-foundations',
      'rest-api-foundations'
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
      when 'css-foundations' then 'css'
      when 'typescript-foundations' then 'typescript'
      when 'react-foundations' then 'react'
      when 'node-foundations' then 'node'
      when 'rest-api-foundations' then 'rest-api'
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

revoke execute on function public.start_or_resume_assessment_session(uuid,text,text,text[],timestamptz,int,int)
  from public, anon, authenticated;
grant execute on function public.start_or_resume_assessment_session(uuid,text,text,text[],timestamptz,int,int)
  to service_role;
revoke execute on function public.complete_assessment_session(uuid,uuid,numeric,int,int,boolean)
  from public, anon, authenticated;
grant execute on function public.complete_assessment_session(uuid,uuid,numeric,int,int,boolean)
  to service_role;
