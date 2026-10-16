-- Backend-first milestone: optional owner-scoped learning consistency streak.
-- Depends on 202610160004_learning_workflows.sql (practice_lab_attempts).
-- Do not apply to hosted Supabase without staging pgTAP/E2E and explicit approval.
-- No self-reported tasks, missions, logins or client-supplied events count.
-- No numerical skill grade is created or modified by this function.
create or replace function public.get_learning_streak(
  p_timezone text default 'Asia/Kolkata'
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $streak$
declare
  v_user uuid;
  v_today date;
  v_result jsonb;
begin
  v_user := (select auth.uid());
  if v_user is null then
    raise exception using errcode='42501', message='Authentication required for learning streak';
  end if;
  if p_timezone is null or pg_catalog.char_length(p_timezone) > 64
    or not exists (
      select 1 from pg_catalog.pg_timezone_names where name = p_timezone
    )
  then
    raise exception using errcode='22023', message='Invalid IANA time zone';
  end if;
  v_today := (pg_catalog.now() at time zone p_timezone)::date;

  with active_days as (
    -- Completed, authenticated, server-graded assessments only. Legacy
    -- claimed or untrusted grades never count.
    select (a.completed_at at time zone p_timezone)::date as day
      from public.assessment_attempts a
      where a.user_id = v_user and a.grading_method = 'server_quiz'
        and a.completed_at <= pg_catalog.now()
    union
    -- A server-graded practice attempt counts as participation even when
    -- answered incorrectly. practice_lab_attempts is service-insert-only.
    select (p.completed_at at time zone p_timezone)::date as day
      from public.practice_lab_attempts p
      where p.user_id = v_user and p.completed_at <= pg_catalog.now()
  ),
  numbered as (
    select day, day - (pg_catalog.row_number() over(order by day))::integer as group_key
      from active_days
  ),
  streak_runs as (
    select pg_catalog.min(day) as start_day,
           pg_catalog.max(day) as end_day,
           pg_catalog.count(*)::integer as day_count
      from numbered group by group_key
  )
  select pg_catalog.jsonb_build_object(
    'timeZone', p_timezone,
    'asOfDate', v_today::text,
    'currentStreak', coalesce((
      select pg_catalog.max(day_count) from streak_runs
      where end_day = v_today or end_day = v_today - 1
    ), 0),
    'longestStreak', coalesce((select pg_catalog.max(day_count) from streak_runs),0),
    'totalActiveDays', (select pg_catalog.count(*)::integer from active_days),
    'lastActiveDate', (select pg_catalog.max(day)::text from active_days),
    'activeToday', (select exists(select 1 from active_days where day=v_today)),
    'dueToday', (select not exists(select 1 from active_days where day=v_today)
      and exists(select 1 from active_days where day=v_today-1)),
    'last7Days', (
      select coalesce(
        pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'date', recent.day::date::text,
          'active', exists(select 1 from active_days a where a.day=recent.day::date)
        ) order by recent.day),
        '[]'::jsonb)
      from pg_catalog.generate_series(
        (v_today-6)::timestamp, v_today::timestamp, interval '1 day'
      ) as recent(day)
    )
  ) into v_result;
  return v_result;
end;
$streak$;
revoke execute on function public.get_learning_streak(text) from public, anon;
grant execute on function public.get_learning_streak(text) to authenticated;
comment on function public.get_learning_streak(text) is
 'Read-only per-owner educational participation streak from trusted quizzes and server-graded lab attempts. No gamified numerical skill score.';
