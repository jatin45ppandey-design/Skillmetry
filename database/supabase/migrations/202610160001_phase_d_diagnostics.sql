-- Phase D: append-only per-question evidence attached to immutable server-graded attempts.
-- Apply ONLY after owner approval and staging pgTAP; deploy app flag afterwards.
create table if not exists public.assessment_question_reviews (
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null check (length(question_id) between 1 and 64),
  topic_id text not null check (length(topic_id) between 1 and 64),
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  selected_index integer not null check (selected_index between 0 and 3),
  correct_index integer not null check (correct_index between 0 and 3),
  explanation text not null check (length(explanation) between 1 and 1000),
  ordinal integer not null check (ordinal between 0 and 49),
  created_at timestamptz not null default now(),
  primary key (attempt_id, question_id),
  unique (attempt_id, ordinal)
);
create index if not exists assessment_reviews_owner_attempt_idx
  on public.assessment_question_reviews(user_id, attempt_id);
alter table public.assessment_question_reviews enable row level security;
alter table public.assessment_question_reviews force row level security;
revoke all on public.assessment_question_reviews from public, anon, authenticated;
grant select on public.assessment_question_reviews to authenticated;
grant select, insert on public.assessment_question_reviews to service_role;
drop policy if exists "Owners read their completed diagnostic reviews" on public.assessment_question_reviews;
create policy "Owners read their completed diagnostic reviews"
  on public.assessment_question_reviews for select to authenticated
  using (
    user_id = (select auth.uid()) and exists (
      select 1 from public.assessment_attempts a
      where a.id = attempt_id and a.user_id = (select auth.uid())
        and a.grading_method = 'server_quiz' and a.assessment_version = '2026.3'
    )
  );

-- Wrap the existing atomic grading RPC. The original function remains in place
-- for older versions and existing clients. This wrapper and its inserts are a
-- single PostgreSQL transaction; failure rolls back the graded attempt too.
create or replace function public.complete_diagnostic_assessment_session(
  p_session_id uuid,
  p_user_id uuid,
  p_score numeric,
  p_correct_count int,
  p_total_questions int,
  p_passed boolean,
  p_reviews jsonb
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_session public.assessment_sessions%rowtype;
  v_attempt_id uuid;
  v_review_count int;
  v_unique_count int;
  v_correct_count int;
begin
  select * into v_session
  from public.assessment_sessions
  where id = p_session_id and user_id = p_user_id
  for update;
  if not found or v_session.assessment_version <> '2026.3'
     or v_session.status <> 'active' or v_session.expires_at <= now() then
    raise exception using errcode = '22023', message = 'invalid diagnostic assessment session';
  end if;
  if p_reviews is null or pg_catalog.jsonb_typeof(p_reviews) <> 'array'
     or pg_catalog.jsonb_array_length(p_reviews) <> p_total_questions then
    raise exception using errcode = '22023', message = 'diagnostic review count mismatch';
  end if;
  select count(*), count(distinct r.question_id),
         coalesce(sum((r.selected_index = r.correct_index)::integer),0)
    into v_review_count,v_unique_count,v_correct_count
  from pg_catalog.jsonb_to_recordset(p_reviews)
    as r(question_id text,topic_id text,difficulty text,selected_index integer,
         correct_index integer,explanation text,ordinal integer);
  if v_review_count <> p_total_questions or v_unique_count <> p_total_questions
     or v_correct_count <> p_correct_count
     or p_total_questions <> pg_catalog.cardinality(v_session.question_ids) then
    raise exception using errcode = '22023', message = 'inconsistent diagnostic review';
  end if;
  if exists (
    select 1 from pg_catalog.jsonb_to_recordset(p_reviews)
      as r(question_id text,topic_id text,difficulty text,selected_index integer,
           correct_index integer,explanation text,ordinal integer)
    where r.question_id is null or not (r.question_id = any(v_session.question_ids))
       or r.ordinal is null or r.ordinal < 0 or r.ordinal >= p_total_questions
  ) then
    raise exception using errcode = '22023', message = 'diagnostic question mismatch';
  end if;

  v_attempt_id := public.complete_assessment_session(
    p_session_id,p_user_id,p_score,p_correct_count,p_total_questions,p_passed
  );

  insert into public.assessment_question_reviews (
    attempt_id,user_id,question_id,topic_id,difficulty,selected_index,
    correct_index,explanation,ordinal
  )
  select v_attempt_id,p_user_id,r.question_id,r.topic_id,r.difficulty,
         r.selected_index,r.correct_index,r.explanation,r.ordinal
  from pg_catalog.jsonb_to_recordset(p_reviews)
    as r(question_id text,topic_id text,difficulty text,selected_index integer,
         correct_index integer,explanation text,ordinal integer);
  return v_attempt_id;
end;
$$;
revoke execute on function public.complete_diagnostic_assessment_session(uuid,uuid,numeric,int,int,boolean,jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_diagnostic_assessment_session(uuid,uuid,numeric,int,int,boolean,jsonb)
  to service_role;
comment on table public.assessment_question_reviews is
  'Immutable per-question 2026.3 evidence; visible only to the owning student after completion.';
