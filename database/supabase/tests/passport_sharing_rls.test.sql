begin;
select plan(9);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values
('55555555-5555-4555-8555-555555555555','00000000-0000-0000-0000-000000000000','authenticated','authenticated','share-alice@example.test','',now(),now()),
('66666666-6666-4666-8666-666666666666','00000000-0000-0000-0000-000000000000','authenticated','authenticated','share-bob@example.test','',now(),now());
insert into public.passport_share_links(user_id,token_hash,snapshot,expires_at)
values
('55555555-5555-4555-8555-555555555555',repeat('a',64),'{"name":"Alice","skills":[]}'::jsonb,now()+interval '7 days'),
('66666666-6666-4666-8666-666666666666',repeat('b',64),'{"name":"Bob","skills":[]}'::jsonb,now()+interval '7 days');
set local role authenticated;
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select set_config('request.jwt.claims','{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',true);
select results_eq($$select token_hash from public.passport_share_links$$,
 array[repeat('a',64)],'Alice can only inspect her share metadata');
select is_empty($$update public.passport_share_links set revoked_at=now()
 where user_id='66666666-6666-4666-8666-666666666666' returning id$$,
 'Alice cannot revoke a different owners share link');
select throws_ok($$insert into public.passport_share_links(user_id,token_hash,snapshot,expires_at)
 values('55555555-5555-4555-8555-555555555555',repeat('c',64),'{}',now()+interval '7 days')$$,
 '42501',null,'Browser user cannot directly forge a share token and snapshot');
select throws_ok($$update public.passport_share_links set snapshot='{"name":"Fake"}'::jsonb
 where user_id='55555555-5555-4555-8555-555555555555'$$,
 '42501',null,'Browser account cannot modify server-issued score snapshot');
select lives_ok($$update public.passport_share_links set revoked_at=now()
 where user_id='55555555-5555-4555-8555-555555555555'$$,
 'Alice may revoke her own link');
select throws_ok($$update public.passport_share_links set revoked_at=null
 where user_id='55555555-5555-4555-8555-555555555555'$$,
 'P0001',null,'Revoked link cannot be restored');
set local role anon;
select throws_ok('select id from public.passport_share_links','42501',null,'Anonymous cannot read share token hashes');
select throws_ok('update public.passport_share_links set revoked_at=now()','42501',null,
 'Anonymous cannot modify links');
set local role authenticated;
select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
select set_config('request.jwt.claims','{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',true);
select results_eq($$select token_hash from public.passport_share_links$$,
 array[repeat('b',64)],'Bob sees only Bob share links');
select * from finish();
rollback;
