-- P3–P6: additive learning activity; deliberately separate from immutable quiz scores.
-- Full Stack mission additions complete the existing four-career learning catalog.
insert into public.missions(id,career_id,skill_id,title,description,estimated_hours) values
 ('fullstack-task-hub','full-stack-developer','react','Build a full-stack task hub','Ship an end-to-end task manager with persistent data and accessible controls.',8),
 ('fullstack-auth-portal','full-stack-developer','authentication','Implement a private account portal','Build login and owner-scoped profile access with defensive error handling.',8),
 ('fullstack-release','full-stack-developer','deployment','Prepare a safe full-stack release','Configure deployment, health reporting and a reproducible setup guide.',6)
on conflict (id) do nothing;

-- Do not apply to a hosted project without staging RLS/E2E and explicit approval.
create table if not exists public.learning_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_key text not null check (length(task_key) between 4 and 128),
  skill_id text not null references public.skills(id),
  title text not null check (length(title) between 5 and 180),
  kind text not null check (kind in ('learn','practice','reassess')),
  status text not null default 'todo' check (status in ('todo','in_progress','completed','skipped')),
  estimated_minutes integer not null check (estimated_minutes between 15 and 180),
  planned_date date not null,
  position integer not null check (position between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,task_key)
);
create index if not exists learning_plan_user_date on public.learning_plan_tasks(user_id,planned_date,position);

create table if not exists public.practice_lab_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null references public.skills(id),
  exercise_id text not null check (length(exercise_id) between 3 and 100),
  is_correct boolean not null,
  completed_at timestamptz not null default now()
);
create index if not exists practice_lab_user_time on public.practice_lab_attempts(user_id,completed_at desc);

create table if not exists public.mission_work (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null references public.missions(id),
  status text not null default 'in_progress' check (status in ('in_progress','submitted','self_completed')),
  completed_indices integer[] not null default '{}',
  repository_url text check (repository_url is null or length(repository_url) <= 500),
  demo_url text check (demo_url is null or length(demo_url) <= 500),
  notes text not null default '' check (length(notes) <= 3000),
  updated_at timestamptz not null default now(),
  unique(user_id,mission_id),
  check (cardinality(completed_indices) <= 16)
);
create index if not exists mission_work_user_status on public.mission_work(user_id,status);

alter table public.learning_plan_tasks enable row level security;
alter table public.learning_plan_tasks force row level security;
alter table public.practice_lab_attempts enable row level security;
alter table public.practice_lab_attempts force row level security;
alter table public.mission_work enable row level security;
alter table public.mission_work force row level security;

revoke all on public.learning_plan_tasks, public.practice_lab_attempts, public.mission_work from public,anon,authenticated;
grant select,insert,update on public.learning_plan_tasks to authenticated;
grant select on public.practice_lab_attempts to authenticated;
grant insert, select on public.practice_lab_attempts to service_role;
grant select,insert,update on public.mission_work to authenticated;

create policy "Learners read their study tasks" on public.learning_plan_tasks
  for select to authenticated using (user_id=(select auth.uid()));
create policy "Learners create their study tasks" on public.learning_plan_tasks
  for insert to authenticated with check (user_id=(select auth.uid()));
create policy "Learners update their study tasks" on public.learning_plan_tasks
  for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "Learners read their practice events" on public.practice_lab_attempts
  for select to authenticated using (user_id=(select auth.uid()));
create policy "Learners read their mission evidence" on public.mission_work
  for select to authenticated using (user_id=(select auth.uid()));
create policy "Learners create their mission evidence" on public.mission_work
  for insert to authenticated with check (user_id=(select auth.uid()));
create policy "Learners update their mission evidence" on public.mission_work
  for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

comment on table public.practice_lab_attempts is 'Unscored learning exercise activity only; never a trusted assessment.';
comment on table public.mission_work is 'Learner self-reported project evidence; no automated or human verification implied.';
