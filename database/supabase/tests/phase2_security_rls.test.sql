begin;
select * from no_plan();

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
 ('55555555-5555-4555-8555-555555555555','00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase2-alice@example.test','',now(),now()),
 ('66666666-6666-4666-8666-666666666666','00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase2-bob@example.test','',now(),now());

insert into public.passport_shares (user_id, token_hash, snapshot, expires_at)
values ('55555555-5555-4555-8555-555555555555', repeat('a',64),
'{"schema":"skillmetry-passport-v1","career":"Backend Developer","title":"Learning snapshot"}'::jsonb,
now()+interval '2 days');

set local role anon;
select throws_ok('select mission_id from public.mission_submissions','42501',null,'Anonymous cannot read mission evidence');
select throws_ok('select user_id from public.ai_usage_daily','42501',null,'Anonymous cannot read private AI quota');
select throws_ok('select token_hash from public.passport_shares','42501',null,'Anonymous cannot read private passport tokens');
select throws_ok('select rating from public.pilot_feedback','42501',null,'Anonymous cannot read pilot feedback');
select is(
 (select public.read_public_passport(repeat('a',64))->>'career'),
 'Backend Developer'::text,
 'Only explicitly published snapshot can be read using an opaque token hash'
);
select is(
 (select public.read_public_passport(repeat('b',64)) is null),
 true,
 'Unknown passport tokens disclose nothing'
);

set local role authenticated;
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select set_config('request.jwt.claims','{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',true);

select throws_ok(
 $$insert into public.passport_shares (user_id,token_hash,snapshot,expires_at)
 values ('66666666-6666-4666-8666-666666666666',repeat('b',64),'{"score":100}',now()+interval '1 day')$$,
 '42501',null,'Student cannot forge publicly shared quiz evidence'
);
select throws_ok(
 $$update public.passport_shares set snapshot='{"fake":true}'::jsonb
 where user_id='55555555-5555-4555-8555-555555555555'$$,
 '42501',null,'Even owner cannot bypass server-generated public score snapshots'
);

insert into public.mission_submissions(user_id,mission_id,status)
values ('55555555-5555-4555-8555-555555555555','dockerize','draft');
select is(
 (select count(*)::integer from public.mission_submissions),1,
 'Student can read own private mission draft'
);
select throws_ok(
 $$insert into public.mission_submissions(user_id,mission_id,status)
 values ('66666666-6666-4666-8666-666666666666','dockerize','draft')$$,
 '42501',null,'Student cannot write mission evidence for another user'
);

select is(public.consume_ai_usage('mission'),true,'First AI usage allowed');
select is(public.consume_ai_usage('mission'),true,'Second AI usage allowed');
select is(public.consume_ai_usage('mission'),true,'Third AI usage allowed');
select is(public.consume_ai_usage('mission'),false,'Fourth AI usage denied per UTC day');

insert into public.pilot_feedback(user_id,area,rating,comment)
values ('55555555-5555-4555-8555-555555555555','projects',4,'Clear workflow');
select throws_ok(
 $$insert into public.pilot_feedback(user_id,area,rating,comment)
 values ('55555555-5555-4555-8555-555555555555','projects',5,'Another rating')$$,
 '23505',null,'Only one pilot response per learner per UTC day'
);

set local role authenticated;
select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
select set_config('request.jwt.claims','{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',true);
select is_empty('select mission_id from public.mission_submissions','Bob cannot see Alice mission drafts');
select is_empty('select rating from public.pilot_feedback','Bob cannot see Alice feedback');
select is_empty('select token_hash from public.passport_shares','Bob cannot enumerate Alice share token hashes');
select * from finish();
rollback;
