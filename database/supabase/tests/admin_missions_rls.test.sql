begin;
select plan(16);
select has_table('public','admin_missions','Private CMS mission table exists');
select has_table('public','admin_mission_revisions','Mission audit history exists');
select ok(not has_table_privilege('anon','public.admin_missions','SELECT'),'Anonymous cannot read mission drafts');
select ok(not has_table_privilege('authenticated','public.admin_missions','SELECT'),'Students cannot read mission drafts');
select ok(not has_function_privilege('authenticated','public.save_admin_mission(uuid,text,text,text,jsonb,integer,boolean)','EXECUTE'),'Students cannot invoke mission writer');
select ok(has_function_privilege('service_role','public.save_admin_mission(uuid,text,text,text,jsonb,integer,boolean)','EXECUTE'),'Trusted service role can invoke mission writer');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('b3939393-9393-4939-8939-939393939393','00000000-0000-0000-0000-000000000000','authenticated','authenticated','mission-owner@example.test','',now(),now()),
       ('b4949494-9494-4949-8949-949494949494','00000000-0000-0000-0000-000000000000','authenticated','authenticated','mission-editor@example.test','',now(),now());
insert into public.admin_members(user_id,role) values
('b3939393-9393-4939-8939-939393939393','owner'),
('b4949494-9494-4949-8949-949494949494','editor');
set local role service_role;
create temp table mission_payload(data jsonb);
insert into mission_payload values
('{"title":"Build a tested React dashboard",
  "description":"Create a fully responsive dashboard and document your accessibility and verification work.",
  "estimatedHours":7,"deliverables":["Responsive project interface","Documented keyboard navigation","Automated component tests"]}'::jsonb);
select is((public.save_admin_mission('b3939393-9393-4939-8939-939393939393',
 'cms-tested-react-dashboard','frontend-developer','react',
 (select data from mission_payload),0,false)->>'revision')::integer,
 1,'Owner creates private mission draft');
select is((select published from public.admin_missions where id='cms-tested-react-dashboard')::text,
 null,'Saved draft stays unpublished');
select is((select count(*)::integer from public.missions where id='cms-tested-react-dashboard'),
 0,'Private draft is absent from canonical mission catalog');
select throws_ok($$select public.save_admin_mission('b4949494-9494-4949-8949-949494949494',
 'cms-tested-react-dashboard','frontend-developer','react',
 (select data from mission_payload),1,true)$$,'42501',null,'Editor cannot publish mission');
select is((public.save_admin_mission('b3939393-9393-4939-8939-939393939393',
 'cms-tested-react-dashboard','frontend-developer','react',
 (select data from mission_payload),1,true)->>'publishedRevision')::integer,
 2,'Owner publishes mission');
select is((select count(*)::integer from public.missions where id='cms-tested-react-dashboard'),
 1,'Publication synchronizes canonical mission foreign key');
select throws_ok($$select public.save_admin_mission('b3939393-9393-4939-8939-939393939393',
 'cms-tested-react-dashboard','frontend-developer','react',
 jsonb_set((select data from mission_payload),'{deliverables,0}','"Different task"'::jsonb),2,false)$$,
 '22023',null,'Published checklist cannot change under existing mission ID');
select throws_ok($$select public.save_admin_mission('b3939393-9393-4939-8939-939393939393',
 'cms-tested-react-dashboard','frontend-developer','react',
 (select data from mission_payload),0,false)$$,
 'P0001',null,'Stale writes cannot overwrite mission');
select throws_ok($$select public.save_admin_mission('b3939393-9393-4939-8939-939393939393',
 'cms-invalid-skill','frontend-developer','python',
 (select data from mission_payload),0,false)$$,
 '22023',null,'Career mismatch is rejected in database');
select is((select count(*)::integer from public.admin_mission_revisions
 where mission_id='cms-tested-react-dashboard'),2,'Both changes are audited');
select * from finish();
rollback;
