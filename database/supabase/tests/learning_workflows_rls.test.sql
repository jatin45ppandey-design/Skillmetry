begin;
select plan(14);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('33333333-3333-4333-8333-333333333333','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','plan-alice@example.test','',now(),now()),
 ('44444444-4444-4444-8444-444444444444','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','plan-bob@example.test','',now(),now());

insert into public.learning_plan_tasks(user_id,task_key,skill_id,title,kind,planned_date,estimated_minutes,position)
values ('33333333-3333-4333-8333-333333333333','2026-10-12:python:learn','python','Study Python foundations',
 'learn','2026-10-12',45,0),
 ('44444444-4444-4444-8444-444444444444','2026-10-12:sql:learn','sql','Study SQL foundations',
 'learn','2026-10-12',45,0);
insert into public.mission_work(user_id,mission_id,status,notes)
values ('33333333-3333-4333-8333-333333333333','dockerize','in_progress','Working on my Dockerfile'),
 ('44444444-4444-4444-8444-444444444444','dockerize','in_progress','Bob work');
insert into public.practice_lab_attempts(user_id,exercise_id,skill_id,is_correct)
values ('33333333-3333-4333-8333-333333333333','js-array','javascript',true),
 ('44444444-4444-4444-8444-444444444444','py-slicing','python',true);

set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',true);

select results_eq($$select task_key from public.learning_plan_tasks$$,
  array['2026-10-12:python:learn'::text],'Alice can only read her tasks');
select is_empty($$update public.learning_plan_tasks set status='completed'
  where user_id='44444444-4444-4444-8444-444444444444' returning task_key$$,
  'Alice cannot update Bob tasks');
select throws_ok($$insert into public.learning_plan_tasks(user_id,task_key,skill_id,title,kind,planned_date,estimated_minutes,position)
  values ('44444444-4444-4444-8444-444444444444','2026-10-12:python:practice','python',
  'Practice Python concepts','practice','2026-10-12',30,1)$$,'42501',null,'Alice cannot create Bob tasks');

select results_eq($$select mission_id from public.mission_work$$,
  array['dockerize'::text],'Alice sees only her mission');
select throws_ok($sql$update public.mission_work set notes='tampered'
  where user_id='44444444-4444-4444-8444-444444444444' returning mission_id$sql$,
  '42501',null,'Browser accounts cannot directly edit mission submissions');
select throws_ok($$insert into public.mission_work(user_id,mission_id)
  values('44444444-4444-4444-8444-444444444444','react-dashboard')$$,
  '42501',null,'Alice cannot create Bob mission');
select throws_ok($sql$update public.learning_plan_tasks set title='Forged recommendation'
  where user_id='33333333-3333-4333-8333-333333333333'$sql$,
  '42501',null,'Browser cannot rewrite trusted generated plan task titles');
select throws_ok($sql$update public.mission_work set status='self_completed'
  where user_id='33333333-3333-4333-8333-333333333333'$sql$,
  '42501',null,'Browser cannot bypass server mission evidence validation');
select results_eq($sql$select exercise_id from public.practice_lab_attempts$sql$,
  array['js-array'::text],'Alice reads only her practice attempt');
select throws_ok($$insert into public.practice_lab_attempts(user_id,exercise_id,skill_id,is_correct)
  values('33333333-3333-4333-8333-333333333333','forged','python',true)$$,
  '42501',null,'Browser account cannot forge practice attempts');
select is_empty($$update public.learning_plan_tasks set status='completed' where task_key='nonexistent' returning id$$,
  'Unknown task updates do not affect other records');

set local role anon;
select throws_ok('select id from public.learning_plan_tasks','42501',null,'Anonymous cannot read learning plan');
select throws_ok('select id from public.mission_work','42501',null,'Anonymous cannot read private mission');
select throws_ok('select id from public.practice_lab_attempts','42501',null,'Anonymous cannot read private practice');

select * from finish();
rollback;
