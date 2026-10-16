begin;
select plan(9);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
('55555555-5555-4555-8555-555555555555','00000000-0000-0000-0000-000000000000','authenticated','authenticated','diagnostic-alice@example.test','',now(),now()),
('66666666-6666-4666-8666-666666666666','00000000-0000-0000-0000-000000000000','authenticated','authenticated','diagnostic-bob@example.test','',now(),now());

insert into public.assessment_sessions
  (id,user_id,assessment_id,assessment_version,question_ids,expires_at)
values
('ffffffff-ffff-4fff-8fff-ffffffffffff','55555555-5555-4555-8555-555555555555',
'javascript-foundations','2026.3',array['demo-01','demo-02','demo-03'],now()+interval '30 minutes');

select throws_ok(
  $$select public.complete_diagnostic_assessment_session(
    'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid,
    '55555555-5555-4555-8555-555555555555'::uuid, 33.33,1,3,false,
    '[ {"question_id":"demo-01","topic_id":"scope","difficulty":"beginner","selected_index":0,"correct_index":0,"explanation":"First item","ordinal":0}, {"question_id":"demo-02","topic_id":"scope","difficulty":"intermediate","selected_index":1,"correct_index":1,"explanation":"Second item","ordinal":1}, {"question_id":"demo-03","topic_id":"scope","difficulty":"advanced","selected_index":0,"correct_index":1,"explanation":"Third item","ordinal":2}]'::jsonb
  )$$,
  '22023', 'inconsistent diagnostic review',
  'a forged count cannot produce a diagnostic attempt'
);

select results_eq(
  $$select count(*)::int from public.assessment_attempts
    where user_id='55555555-5555-4555-8555-555555555555'::uuid$$,
  array[0],
  'failed diagnostic transactions do not leave attempts'
);

select lives_ok(
  $$select public.complete_diagnostic_assessment_session(
    'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid,
    '55555555-5555-4555-8555-555555555555'::uuid, 66.67,2,3,false,
    '[ {"question_id":"demo-01","topic_id":"scope","difficulty":"beginner","selected_index":0,"correct_index":0,"explanation":"First item","ordinal":0}, {"question_id":"demo-02","topic_id":"scope","difficulty":"intermediate","selected_index":1,"correct_index":1,"explanation":"Second item","ordinal":1}, {"question_id":"demo-03","topic_id":"scope","difficulty":"advanced","selected_index":0,"correct_index":1,"explanation":"Third item","ordinal":2}]'::jsonb
  )$$,
  'server-trusted diagnostic completion stores its attempt and topic evidence atomically'
);

select results_eq(
  $$select count(*)::int from public.assessment_question_reviews
    where user_id='55555555-5555-4555-8555-555555555555'::uuid$$,
  array[3],
  'all three question reviews are persisted together'
);

select throws_ok(
  $$select public.complete_diagnostic_assessment_session(
    'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid,
    '55555555-5555-4555-8555-555555555555'::uuid, 66.67,2,3,false,
    '[ {"question_id":"demo-01","topic_id":"scope","difficulty":"beginner","selected_index":0,"correct_index":0,"explanation":"First item","ordinal":0}, {"question_id":"demo-02","topic_id":"scope","difficulty":"intermediate","selected_index":1,"correct_index":1,"explanation":"Second item","ordinal":1}, {"question_id":"demo-03","topic_id":"scope","difficulty":"advanced","selected_index":0,"correct_index":1,"explanation":"Third item","ordinal":2}]'::jsonb
  )$$,
  '22023', 'invalid diagnostic assessment session',
  'a completed diagnostic cannot be replayed as a new result'
);

set local role authenticated;
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select set_config('request.jwt.claims','{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',true);

select results_eq(
  $$select count(*)::int from public.assessment_question_reviews$$,
  array[3],
  'Alice can read only her own completed reviews'
);

select throws_ok(
  $$insert into public.assessment_question_reviews
    (attempt_id,user_id,question_id,topic_id,difficulty,selected_index,correct_index,explanation,ordinal)
    values ('ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid,
      '55555555-5555-4555-8555-555555555555'::uuid,'forged','scope','beginner',0,0,'fake',0)$$,
  '42501', null,
  'student cannot forge question-level trusted evidence'
);

select throws_ok(
  $$select public.complete_diagnostic_assessment_session(
    'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid,
    '55555555-5555-4555-8555-555555555555'::uuid, 66.67,2,3,false,'[]'::jsonb
  )$$,
  '42501', null,
  'student cannot execute the diagnostic completion RPC'
);

select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
select set_config('request.jwt.claims','{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',true);

select results_eq(
  $$select count(*)::int from public.assessment_question_reviews$$,
  array[0],
  'Bob cannot see Alice private question review'
);

select * from finish();
rollback;
