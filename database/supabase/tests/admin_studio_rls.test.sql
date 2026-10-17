begin;
select plan(13);
select has_table('public','admin_members','Explicit admin members');
select has_table('public','admin_skill_guides','Private editorial guides');
select has_table('public','admin_guide_revisions','Editorial history');
select ok(not has_table_privilege('anon','public.admin_members','SELECT'),'Anon cannot read admin list');
select ok(not has_table_privilege('authenticated','public.admin_skill_guides','SELECT'),'Student cannot read private guides');
select ok(not has_function_privilege('authenticated','public.save_admin_skill_guide(uuid,text,jsonb,integer,boolean)','EXECUTE'),'Student cannot run edit RPC');
select ok(has_function_privilege('service_role','public.save_admin_skill_guide(uuid,text,jsonb,integer,boolean)','EXECUTE'),'Backend service can use edit RPC');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('91919191-9191-4919-8919-919191919191','00000000-0000-0000-0000-000000000000','authenticated','authenticated','guide-owner@example.test','',now(),now()),
('92929292-9292-4929-8929-929292929292','00000000-0000-0000-0000-000000000000','authenticated','authenticated','guide-editor@example.test','',now(),now());
insert into public.admin_members(user_id,role) values
('91919191-9191-4919-8919-919191919191','owner'),('92929292-9292-4929-8929-929292929292','editor');
set local role service_role;
create temp table test_editor_payload(data jsonb);
insert into test_editor_payload values
('{"documentation":{"title":"JavaScript documentation","url":"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"},"lecture":{"title":"Full JavaScript video course","url":"https://www.youtube.com/watch?v=Zi-Q0t4gMC8","format":"video"},"notes":["Variables store local state.","Closures retain lexical scope.","Promises handle asynchronous tasks."],"challenge":"Build a basic searchable JavaScript list application."}'::jsonb);
select is((public.save_admin_skill_guide('91919191-9191-4919-8919-919191919191','javascript',
 (select data from test_editor_payload),0,false)->>'revision')::integer,1,'Owner saves a private draft');
select is((select published from public.admin_skill_guides where skill_id='javascript')::text,
 null,'Draft save does not publish');
select is((public.save_admin_skill_guide('91919191-9191-4919-8919-919191919191','javascript',
 (select data from test_editor_payload),1,true)->>'publishedRevision')::integer,2,'Owner publishes version 2');
select is((select count(*)::integer from public.admin_guide_revisions where skill_id='javascript'),2,
 'Both changes are audit logged');
select throws_ok($$select public.save_admin_skill_guide('92929292-9292-4929-8929-929292929292',
 'javascript',(select data from test_editor_payload),2,true)$$,'42501',null,
 'Editor cannot publish a public guide');
select throws_ok($$select public.save_admin_skill_guide('91919191-9191-4919-8919-919191919191',
 'javascript',(select data from test_editor_payload),0,false)$$,'P0001',null,
 'Stale version cannot overwrite changes');
select * from finish();
rollback;
