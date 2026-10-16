begin;
select plan(9);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mission-alice@example.test', '', now(), now()),
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mission-bob@example.test', '', now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);

insert into public.mission_submissions (user_id, mission_id, status)
values ('33333333-3333-4333-8333-333333333333', 'dockerize', 'draft');

select results_eq(
  $$select status from public.mission_submissions where mission_id = 'dockerize'$$,
  array['draft'::text],
  'A student can save and read an own draft'
);
select throws_ok(
  $$insert into public.mission_submissions (user_id, mission_id)
    values ('44444444-4444-4444-8444-444444444444', 'dockerize')$$,
  '42501', null,
  'A student cannot forge another owner'
);
select is_empty(
  $$select mission_id from public.mission_submissions where user_id = '44444444-4444-4444-8444-444444444444'$$,
  'A student cannot read another owner'
);
update public.mission_submissions set checked_deliverables = array[0],
  evidence_url = 'https://github.com/example/project', status = 'submitted'
where mission_id = 'dockerize';

select results_eq(
  $$select status from public.mission_submissions where mission_id = 'dockerize'$$,
  array['submitted'::text],
  'Owner may submit a draft'
);
select results_eq(
  $$select submitted_at is not null from public.mission_submissions where mission_id = 'dockerize'$$,
  array[true],
  'Submission timestamps are server controlled'
);
select is_empty(
  $$update public.mission_submissions set reflection = 'forged update' where mission_id = 'dockerize'
    returning mission_id$$,
  'Submitted work cannot be modified'
);
select throws_ok(
  $$delete from public.mission_submissions where mission_id = 'dockerize'$$,
  '42501', null,
  'Owner cannot delete submitted evidence'
);

set local role anon;
select throws_ok(
  $$select mission_id from public.mission_submissions$$,
  '42501', null,
  'Anonymous readers cannot access private evidence'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}', true);
select is_empty(
  $$select mission_id from public.mission_submissions$$,
  'Another student sees no submitted evidence'
);

select * from finish();
rollback;
