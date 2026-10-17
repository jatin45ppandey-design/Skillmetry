begin;
select plan(12);
select has_table('public','admin_courses','Protected course drafts');
select has_table('public','admin_course_revisions','Private course history');
select ok(not has_table_privilege('anon','public.admin_courses','SELECT'),'Anonymous cannot read courses');
select ok(not has_table_privilege('authenticated','public.admin_courses','SELECT'),'Students cannot inspect unpublished course content');
select ok(not has_function_privilege('authenticated','public.save_admin_course(uuid,text,text,jsonb,integer,boolean)','EXECUTE'),'Students cannot invoke admin course writer');
select ok(has_function_privilege('service_role','public.save_admin_course(uuid,text,text,jsonb,integer,boolean)','EXECUTE'),'Backend service may write vetted courses');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('b1919191-9191-4919-8919-919191919191','00000000-0000-0000-0000-000000000000','authenticated','authenticated','course-owner@example.test','',now(),now()),
('b2929292-9292-4929-8929-929292929292','00000000-0000-0000-0000-000000000000','authenticated','authenticated','course-editor@example.test','',now(),now());
insert into public.admin_members(user_id,role) values
('b1919191-9191-4919-8919-919191919191','owner'),
('b2929292-9292-4929-8929-929292929292','editor');
set local role service_role;
create temp table course_test_payload(data jsonb);
insert into course_test_payload values
('{"title":"React Foundations Course","summary":"A hands-on beginner learning path with notes, exercises and examples.",
"modules":[{"id":"module-one","title":"Getting started",
"lessons":[{"id":"react-intro","title":"React introduction",
"summary":"Understand component structure and application state in practice.",
"kind":"reading","notes":["Components describe parts of a web interface.","State drives updates."],
"task":"Implement a simple React component with interactive state.", "estimatedMinutes":20}]}]}'::jsonb);
select is((public.save_admin_course('b1919191-9191-4919-8919-919191919191',
 'react-foundations','react',(select data from course_test_payload),0,false)->>'revision')::integer,
 1,'Owner saved a private course draft');
select is((select published from public.admin_courses where slug='react-foundations')::text,null,
 'Private draft is not published');
select is((public.save_admin_course('b1919191-9191-4919-8919-919191919191',
 'react-foundations','react',(select data from course_test_payload),1,true)->>'publishedRevision')::integer,
 2,'Owner published course content');
select is((select count(*)::integer from public.admin_course_revisions where slug='react-foundations'),
 2,'Course changes are audit-logged');
select throws_ok($$select public.save_admin_course('b2929292-9292-4929-8929-929292929292',
 'react-foundations','react',(select data from course_test_payload),2,true)$$,
 '42501',null,'Editor cannot publish courses');
select throws_ok($$select public.save_admin_course('b1919191-9191-4919-8919-919191919191',
 'react-foundations','react',(select data from course_test_payload),0,false)$$,
 'P0001',null,'Stale course version cannot overwrite publication');
select * from finish();
rollback;
