begin;
select plan(12);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values
 ('77777777-7777-4777-8777-777777777777','00000000-0000-0000-0000-000000000000','authenticated','authenticated','streak-alice@example.test','',now(),now()),
 ('88888888-8888-4888-8888-888888888888','00000000-0000-0000-0000-000000000000','authenticated','authenticated','streak-bob@example.test','',now(),now());

-- Three consecutive Asia/Kolkata calendar days for Alice (including today).
-- All timestamps are before transaction time, including around midnight.
insert into public.practice_lab_attempts(user_id,exercise_id,skill_id,is_correct,completed_at)
select '77777777-7777-4777-8777-777777777777'::uuid,
  'js-array', 'javascript', false,
  (((now() at time zone 'Asia/Kolkata')::date - n)::timestamp at time zone 'Asia/Kolkata')
from generate_series(0,2) n;

-- Duplicate practice today cannot increase the number of days.
insert into public.practice_lab_attempts(user_id,exercise_id,skill_id,is_correct,completed_at)
values ('77777777-7777-4777-8777-777777777777',
  'js-array','javascript',true,((now() at time zone 'Asia/Kolkata')::date::timestamp at time zone 'Asia/Kolkata'));

-- Bob last practiced yesterday; activity is still kept until local midnight tomorrow.
insert into public.practice_lab_attempts(user_id,exercise_id,skill_id,is_correct,completed_at)
values ('88888888-8888-4888-8888-888888888888',
  'py-slicing','python',true,(((now() at time zone 'Asia/Kolkata')::date - 1)::timestamp at time zone 'Asia/Kolkata'));

set local role authenticated;
select set_config('request.jwt.claim.sub','77777777-7777-4777-8777-777777777777',true);
select set_config('request.jwt.claims','{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',true);

select is((public.get_learning_streak()->>'currentStreak')::integer,3,'Alice has three-day current streak');
select is((public.get_learning_streak()->>'longestStreak')::integer,3,'Alice has three-day longest streak');
select is((public.get_learning_streak()->>'totalActiveDays')::integer,3,'Duplicate attempt does not add days');
select is((public.get_learning_streak()->>'activeToday')::boolean,true,'Alice is active today');
select is((public.get_learning_streak()->>'dueToday')::boolean,false,'Alice does not need another attempt today');
select is(pg_catalog.jsonb_array_length(public.get_learning_streak()->'last7Days'),7,'Exactly seven local calendar days returned');
select is(public.get_learning_streak()->>'lastActiveDate',
  (now() at time zone 'Asia/Kolkata')::date::text,'Last active date is the student day');

select set_config('request.jwt.claim.sub','88888888-8888-4888-8888-888888888888',true);
select set_config('request.jwt.claims','{"sub":"88888888-8888-4888-8888-888888888888","role":"authenticated"}',true);
select is((public.get_learning_streak()->>'currentStreak')::integer,1,'Bob has only his own streak');
select is((public.get_learning_streak()->>'activeToday')::boolean,false,'Bob is inactive today');
select is((public.get_learning_streak()->>'dueToday')::boolean,true,'Yesterday participation is not reset prematurely');
select throws_ok($$select public.get_learning_streak('Mars/Phobos')$$,
  '22023',null,'Invalid time zone is rejected');

set local role anon;
select throws_ok($$select public.get_learning_streak('Asia/Kolkata')$$,
 '42501',null,'Anonymous role cannot invoke private streak RPC');

select * from finish();
rollback;
