begin;

select plan(12);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@example.test', '', now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@example.test', '', now(), now());

insert into public.profiles (id, display_name, target_career_id, onboarding_completed)
values
  ('11111111-1111-4111-8111-111111111111', 'Alice', 'ml-engineer', true),
  ('22222222-2222-4222-8222-222222222222', 'Bob', 'backend-developer', true);

insert into public.user_skills (user_id, skill_id, claimed_proficiency)
values
  ('11111111-1111-4111-8111-111111111111', 'python', 55),
  ('22222222-2222-4222-8222-222222222222', 'python', 75);

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

select results_eq(
  $$select display_name from public.profiles order by display_name$$,
  array['Alice'::text],
  'Alice can read only her profile'
);

select results_eq(
  $$select claimed_proficiency from public.user_skills$$,
  array[55],
  'Alice can read only her claimed skills'
);

select is_empty(
  $$update public.profiles set display_name = 'Compromised' where id = '22222222-2222-4222-8222-222222222222' returning id$$,
  'Alice cannot update Bob profile'
);

select throws_ok(
  $$delete from public.user_skills where user_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null,
  'Alice cannot delete a skill row that may contain trusted signals'
);

select lives_ok(
  $$update public.user_skills set claimed_proficiency = 60 where user_id = '11111111-1111-4111-8111-111111111111' and skill_id = 'python'$$,
  'Alice can update her claimed proficiency'
);

select throws_ok(
  $$update public.user_skills set demonstrated_proficiency = 100 where user_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null,
  'Alice cannot write demonstrated proficiency'
);

select throws_ok(
  $$update public.user_skills set verified_status = true where user_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null,
  'Alice cannot self-verify a skill'
);

select throws_ok(
  $$insert into public.assessment_attempts (user_id, assessment_id, skill_id, score, passed) values ('11111111-1111-4111-8111-111111111111', 'forged', 'python', 100, true)$$,
  '42501', null,
  'Alice cannot forge an assessment result'
);

select throws_ok(
  $$insert into public.evidence (user_id, skill_id, evidence_type, review_status) values ('11111111-1111-4111-8111-111111111111', 'python', 'manual', 'accepted')$$,
  '42501', null,
  'Alice cannot self-approve evidence'
);

set local role anon;
-- Private tables intentionally have no SELECT grant for anonymous sessions.
-- Denied access raises SQLSTATE 42501 rather than returning an empty result.
select throws_ok(
  $select id from public.profiles$,
  '42501', null,
  'Anonymous visitors cannot read profiles'
);
select throws_ok(
  $select user_id from public.user_skills$,
  '42501', null,
  'Anonymous visitors cannot read skill claims'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select results_eq(
  $$select display_name from public.profiles$$,
  array['Bob'::text],
  'Bob can read only his profile'
);

select * from finish();
rollback;
