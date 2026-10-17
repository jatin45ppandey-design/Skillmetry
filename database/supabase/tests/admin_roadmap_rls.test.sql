begin;
select plan(12);
select has_table('public','admin_career_roadmaps','Protected roadmap drafts table exists');
select has_table('public','admin_career_roadmap_revisions','Immutable roadmap audit table exists');
select ok(not has_table_privilege('anon','public.admin_career_roadmaps','SELECT'),'Anon cannot read roadmap drafts');
select ok(not has_table_privilege('authenticated','public.admin_career_roadmaps','SELECT'),'Learner cannot read roadmap drafts');
select ok(not has_function_privilege('authenticated','public.save_admin_career_roadmap(uuid,text,jsonb,integer,boolean)','EXECUTE'),'Learners cannot call service edit RPC');
select ok(has_function_privilege('service_role','public.save_admin_career_roadmap(uuid,text,jsonb,integer,boolean)','EXECUTE'),'Backend service can call edit RPC');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('a1919191-9191-4919-8919-919191919191','00000000-0000-0000-0000-000000000000','authenticated','authenticated','roadmap-owner@example.test','',now(),now()),
('a2929292-9292-4929-8929-929292929292','00000000-0000-0000-0000-000000000000','authenticated','authenticated','roadmap-editor@example.test','',now(),now());
insert into public.admin_members(user_id,role) values
('a1919191-9191-4919-8919-919191919191','owner'),
('a2929292-9292-4929-8929-929292929292','editor');
set local role service_role;
create temp table roadmap_test_payload(data jsonb);
insert into roadmap_test_payload
select pg_catalog.jsonb_build_object('headline','Frontend developer learning roadmap',
 'introduction','Learn core frontend technologies in a safe guided sequence.',
 'steps',(select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
   'skillId',skill_id,'explanation','Learn the real-world foundations of this skill.',
   'task','Complete a focused learning exercise for this skill.'))
 from public.career_skills where career_id='frontend-developer'));
select is((public.save_admin_career_roadmap('a1919191-9191-4919-8919-919191919191',
 'frontend-developer',(select data from roadmap_test_payload),0,false)->>'revision')::integer,
 1,'Owner saved roadmap draft');
select is((select published from public.admin_career_roadmaps where career_id='frontend-developer')::text,
 null,'Draft stays unpublished');
select is((public.save_admin_career_roadmap('a1919191-9191-4919-8919-919191919191',
 'frontend-developer',(select data from roadmap_test_payload),1,true)->>'publishedRevision')::integer,
 2,'Owner published roadmap version two');
select is((select count(*)::integer from public.admin_career_roadmap_revisions where career_id='frontend-developer'),
 2,'Both updates recorded in immutable audit');
select throws_ok($$select public.save_admin_career_roadmap(
 'a2929292-9292-4929-8929-929292929292','frontend-developer',
 (select data from roadmap_test_payload),2,true)$$,'42501',null,
 'Editor cannot publish roadmap');
select throws_ok($$select public.save_admin_career_roadmap(
 'a1919191-9191-4919-8919-919191919191','frontend-developer',
 (select data from roadmap_test_payload),0,false)$$,'P0001',null,
 'Outdated editor cannot overwrite published roadmap');
select * from finish();
rollback;
