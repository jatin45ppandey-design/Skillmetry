begin;
select plan(18);
select has_table('public','admin_assessment_banks','Assessment draft table exists');
select has_table('public','admin_assessment_versions','Immutable version table exists');
select has_table('public','admin_assessment_revisions','Private audit table exists');
select ok(not has_table_privilege('anon','public.admin_assessment_banks','SELECT'),'Anonymous cannot read answers');
select ok(not has_table_privilege('authenticated','public.admin_assessment_banks','SELECT'),'Students cannot read draft answers');
select ok(not has_table_privilege('authenticated','public.admin_assessment_versions','SELECT'),'Students cannot read published answer snapshots');
select ok(not has_table_privilege('authenticated','public.admin_assessment_revisions','SELECT'),'Students cannot access audit snapshots');
select ok(not has_function_privilege('authenticated','public.save_admin_assessment_bank(uuid,text,jsonb,integer,boolean)','EXECUTE'),'Students cannot call publish RPC');
select ok(has_function_privilege('service_role','public.save_admin_assessment_bank(uuid,text,jsonb,integer,boolean)','EXECUTE'),'Trusted server can call publish RPC');
select ok(exists(select 1 from pg_catalog.pg_trigger
 where tgrelid='public.admin_assessment_versions'::regclass
   and tgname='admin_assessment_snapshot_immutable' and not tgisinternal),
 'Published snapshots have a database immutability trigger');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('b5959595-9595-4959-8959-959595959595','00000000-0000-0000-0000-000000000000','authenticated','authenticated','question-owner@example.test','',now(),now()),
       ('b6969696-9696-4969-8969-969696969696','00000000-0000-0000-0000-000000000000','authenticated','authenticated','question-editor@example.test','',now(),now());
insert into public.admin_members(user_id,role) values
 ('b5959595-9595-4959-8959-959595959595','owner'),
 ('b6969696-9696-4969-8969-969696969696','editor');
create temp table sample_bank(payload jsonb);
insert into sample_bank
select jsonb_build_object('questions',jsonb_agg(jsonb_build_object(
 'id','aq-unit-'||pg_catalog.lpad(i::text,3,'0'),
 'prompt','Which choice correctly answers original question number '||i::text||'?',
 'choices',jsonb_build_array('First answer','Second answer','Third answer','Fourth answer'),
 'correctIndex',0,'explanation','This is the corresponding original question explanation.'
))) from generate_series(1,10) i;
grant select on sample_bank to service_role;
set local role service_role;
select is((public.save_admin_assessment_bank('b5959595-9595-4959-8959-959595959595',
 'html-foundations',(select payload from sample_bank),0,false)->>'revision')::integer,1,
 'Owner saves a private draft');
select is((select published_version from public.admin_assessment_banks where assessment_id='html-foundations')::text,
 null,'Draft does not become a student version');
select throws_ok($$select public.save_admin_assessment_bank(
 'b6969696-9696-4969-8969-969696969696','html-foundations',
 (select payload from sample_bank),1,true)$$,'42501',null,'Editor cannot publish answer keys');
select is((public.save_admin_assessment_bank('b5959595-9595-4959-8959-959595959595',
 'html-foundations',(select payload from sample_bank),1,true)->>'publishedVersion')::text,
 'cms.2','Owner publishes a numbered immutable version');
select is((select count(*)::integer from public.admin_assessment_versions
 where assessment_id='html-foundations' and version='cms.2'),1,'Published snapshot is stored');
select throws_ok($$select public.save_admin_assessment_bank(
 'b5959595-9595-4959-8959-959595959595','html-foundations',
 (select payload from sample_bank),0,false)$$,'P0001',null,'Stale draft cannot overwrite publication');
select throws_ok($$select public.save_admin_assessment_bank(
 'b5959595-9595-4959-8959-959595959595','html-foundations',
 jsonb_set((select payload from sample_bank),'{questions,0,correctIndex}','8'::jsonb),2,true)$$,
 '22023',null,'Invalid answer index is denied by SQL');
select is((select count(*)::integer from public.admin_assessment_revisions
 where assessment_id='html-foundations'),2,'Private audit holds both revisions');
select * from finish();
rollback;
