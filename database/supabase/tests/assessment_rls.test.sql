begin;

select plan(30);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'quiz-alice@example.test', '', now(), now()),
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'quiz-bob@example.test', '', now(), now());

insert into public.user_skills (user_id, skill_id, claimed_proficiency)
values ('33333333-3333-4333-8333-333333333333', 'python', 99);

insert into public.assessment_sessions (id, user_id, assessment_id, assessment_version, question_ids, expires_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', 'python-foundations', '2026.2', array['py-01','py-02'], now() + interval '30 minutes'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '44444444-4444-4444-8444-444444444444', 'sql-foundations', '2026.2', array['sql-01','sql-02'], now() + interval '30 minutes'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'javascript-foundations', '2026.2', array['js-01','js-02'], now() + interval '30 minutes');

insert into public.assessment_sessions (
  id, user_id, assessment_id, assessment_version, question_ids, status, expires_at, completed_at
) values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '44444444-4444-4444-8444-444444444444', 'html-foundations', '2026.2', array['html-01','html-02','html-03','html-04'], 'completed', now() + interval '30 minutes', now()),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', array['py-01','py-02','py-03','py-04'], 'completed', now() + interval '30 minutes', now());

select lives_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'html-foundations', '2026.2', 'html', 75, true, 75,
      3, 4, now(), 'server_quiz', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    )$$,
  'complete trusted result metadata satisfies the database constraint'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 75, true, 75,
      3, 4, now(), 'server_quiz', null
    )$$,
  '23514', null,
  'trusted results require a session id'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 75, true, 75,
      null, 4, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results require a correct-answer count'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 75, true, 75,
      3, null, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results require a total-question count'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 75, true, null,
      3, 4, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results require a pass threshold'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 100, true, 75,
      5, 4, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results reject a correct count above the total count'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 0, false, 75,
      0, 0, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results require a positive total-question count'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 74, false, 75,
      3, 4, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results reject a score inconsistent with the answer count'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 75, true, 0,
      3, 4, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results reject an out-of-range pass threshold'
);

select throws_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'python-foundations', '2026.2', 'python', 75, false, 75,
      3, 4, now(), 'server_quiz', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    )$$,
  '23514', null,
  'trusted results reject a passed flag inconsistent with score and threshold'
);

select lives_ok(
  $$insert into public.assessment_attempts (
      user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
      correct_count, total_questions, completed_at, grading_method, session_id
    ) values (
      '44444444-4444-4444-8444-444444444444', 'legacy-import', 'legacy-client', 'python', 42, false, null,
      null, null, now(), 'legacy_untrusted', null
    )$$,
  'legacy untrusted results retain nullable historical metadata compatibility'
);

select results_eq(
  $$select public.start_or_resume_assessment_session(
    '33333333-3333-4333-8333-333333333333', 'python-foundations', '2026.2',
    array['py-02','py-01'], now() + interval '30 minutes', null, null
  )$$,
  array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid],
  'start resumes the one active owner session'
);

select throws_ok(
  $$insert into public.assessment_sessions (user_id, assessment_id, assessment_version, question_ids, expires_at)
    values ('33333333-3333-4333-8333-333333333333', 'python-foundations', '2026.2', array['py-01'], now() + interval '30 minutes')$$,
  '23505', null,
  'database uniqueness rejects a second active session'
);

select lives_ok(
  $$select public.complete_assessment_session('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', 50, 1, 2, false)$$,
  'trusted completion records one assessment result'
);

select throws_ok(
  $$select public.complete_assessment_session('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', 50, 1, 2, false)$$,
  'P0001', null,
  'a completed session cannot be replayed inside the database'
);

select results_eq(
  $$select count(*)::int from public.assessment_attempts where session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array[1],
  'one session creates exactly one immutable attempt'
);

select results_eq(
  $$select pass_threshold::int from public.assessment_attempts where session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array[75],
  'current attempts persist the explicit 75 percent pass threshold'
);

select results_eq(
  $$select passed from public.assessment_attempts where session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array[false],
  'the passed flag is derived consistently from score and threshold'
);

select throws_ok(
  $$select public.start_or_resume_assessment_session(
    '33333333-3333-4333-8333-333333333333', 'python-foundations', '2026.2',
    array['py-01','py-02'], now() + interval '30 minutes', 1, 1440
  )$$,
  'P0001', 'assessment completion limit reached',
  'an explicitly configured completion window is enforced atomically'
);

select throws_ok(
  $$select public.complete_assessment_session('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 50, 1, 2, true)$$,
  '22023', 'assessment pass result mismatch',
  'trusted completion rejects a forged pass flag'
);

select throws_ok(
  $$select public.complete_assessment_session('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 100, 1, 1, true)$$,
  '22023', 'assessment question count mismatch',
  'trusted completion rejects a result with the wrong question count'
);

select throws_ok(
  $$insert into public.assessment_sessions (user_id, assessment_id, assessment_version, question_ids, status, expires_at)
    values ('33333333-3333-4333-8333-333333333333', 'html-foundations', 'invalid', array['html-01'], 'completed', now() + interval '30 minutes')$$,
  '23514', null,
  'completed sessions require completion metadata'
);

insert into public.assessment_attempts (
  user_id, assessment_id, assessment_version, skill_id, score, passed, pass_threshold,
  correct_count, total_questions, completed_at, grading_method, session_id
) values (
  '44444444-4444-4444-8444-444444444444', 'sql-foundations', '2026.2', 'sql', 100, true, 75,
  2, 2, now(), 'server_quiz', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);

select results_eq(
  $$select score::int from public.assessment_attempts order by completed_at desc$$,
  array[50],
  'Alice reads only her own graded results'
);

select throws_ok(
  $$insert into public.assessment_attempts (user_id, assessment_id, skill_id, score, passed) values ('33333333-3333-4333-8333-333333333333', 'forged', 'python', 100, true)$$,
  '42501', null,
  'Alice cannot forge a graded result'
);

select throws_ok(
  $$update public.assessment_attempts set score = 100 where user_id = '33333333-3333-4333-8333-333333333333'$$,
  '42501', null,
  'Alice cannot edit a graded result'
);

select throws_ok(
  $$delete from public.assessment_attempts where user_id = '33333333-3333-4333-8333-333333333333'$$,
  '42501', null,
  'Alice cannot delete attempt history'
);

select throws_ok(
  $$select id from public.assessment_sessions$$,
  '42501', null,
  'Alice cannot read internal quiz sessions'
);

select throws_ok(
  $$select public.complete_assessment_session('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '44444444-4444-4444-8444-444444444444', 100, 2, 2, true)$$,
  '42501', null,
  'students cannot invoke trusted completion directly'
);

select throws_ok(
  $$select public.start_or_resume_assessment_session(
    '33333333-3333-4333-8333-333333333333', 'html-foundations', '2026.2',
    array['html-01'], now() + interval '30 minutes', null, null
  )$$,
  '42501', null,
  'students cannot invoke trusted session start directly'
);

select throws_ok(
  $$update public.user_skills set claimed_proficiency = 0 where user_id = '33333333-3333-4333-8333-333333333333'$$,
  '42501', null,
  'legacy claimed proficiency is read-only'
);

select * from finish();
rollback;
