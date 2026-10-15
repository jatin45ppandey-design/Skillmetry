-- Skillmetry Phase 1 data model. DO NOT deploy as a complete auth solution without review.
-- The local prototype operates in browser storage until cloud integration is explicitly enabled.
create extension if not exists pgcrypto;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  target_career_id text,
  hours_per_week int check (hours_per_week between 0 and 168),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.careers (
  id text primary key,
  title text not null,
  description text not null default '',
  version int not null default 1
);
create table public.skills (
  id text primary key,
  label text not null,
  category text not null,
  description text not null default ''
);
create table public.skill_prerequisites (
  skill_id text not null references public.skills(id) on delete cascade,
  prerequisite_skill_id text not null references public.skills(id) on delete cascade,
  primary key (skill_id, prerequisite_skill_id),
  check (skill_id <> prerequisite_skill_id)
);
create table public.career_skills (
  career_id text not null references public.careers(id) on delete cascade,
  skill_id text not null references public.skills(id) on delete cascade,
  weight numeric(6,3) not null check (weight >= 0 and weight <= 100),
  primary key (career_id, skill_id)
);
alter table public.profiles add constraint profiles_target_career_fk foreign key (target_career_id) references public.careers(id);
create table public.user_skills (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null references public.skills(id),
  claimed_proficiency int check (claimed_proficiency between 0 and 100),
  demonstrated_proficiency int check (demonstrated_proficiency between 0 and 100),
  evidence_confidence numeric(5,4) check (evidence_confidence between 0 and 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);
create table public.missions (
  id text primary key,
  career_id text references public.careers(id),
  skill_id text not null references public.skills(id),
  title text not null,
  description text not null default '',
  estimated_hours int check (estimated_hours > 0)
);
create table public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null references public.missions(id),
  status text not null default 'not_started' check (status in ('not_started','in_progress','submitted','reviewed')),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null,
  skill_id text not null references public.skills(id),
  score numeric(5,2) not null check (score between 0 and 100),
  passed boolean not null,
  created_at timestamptz not null default now()
);
create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null references public.skills(id),
  evidence_type text not null check (evidence_type in ('github','project','assessment','manual')),
  source_url text,
  review_status text not null default 'pending' check (review_status in ('pending','accepted','rejected')),
  review_notes text,
  created_at timestamptz not null default now()
);
create table public.scenario_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_id text not null references public.careers(id),
  payload jsonb not null default '{}'::jsonb,
  baseline_score numeric(5,2),
  projected_score numeric(5,2),
  created_at timestamptz not null default now()
);
create table public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  extracted_skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table public.passport_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  public_slug text unique,
  visible_evidence_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Career catalog content can be browsed; user-linked records are private.
alter table public.careers enable row level security;
alter table public.skills enable row level security;
alter table public.skill_prerequisites enable row level security;
alter table public.career_skills enable row level security;
alter table public.missions enable row level security;
create policy "Read career catalog" on public.careers for select to anon,authenticated using (true);
create policy "Read skill catalog" on public.skills for select to anon,authenticated using (true);
create policy "Read prerequisites" on public.skill_prerequisites for select to anon,authenticated using (true);
create policy "Read career weights" on public.career_skills for select to anon,authenticated using (true);
create policy "Read mission catalog" on public.missions for select to anon,authenticated using (true);

alter table public.profiles enable row level security;
create policy "Profile owner" on public.profiles for all to authenticated using (id=auth.uid()) with check (id=auth.uid());
alter table public.user_skills enable row level security;
create policy "Skill owner" on public.user_skills for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
alter table public.user_missions enable row level security;
create policy "Mission owner" on public.user_missions for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
alter table public.assessment_attempts enable row level security;
create policy "Assessment owner" on public.assessment_attempts for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
alter table public.evidence enable row level security;
create policy "Evidence owner" on public.evidence for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
alter table public.scenario_runs enable row level security;
create policy "Scenario owner" on public.scenario_runs for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
alter table public.job_analyses enable row level security;
create policy "Job analysis owner" on public.job_analyses for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
alter table public.passport_settings enable row level security;
create policy "Passport settings owner" on public.passport_settings for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

create index user_missions_by_user on public.user_missions(user_id,created_at desc);
create index assessment_attempts_by_user on public.assessment_attempts(user_id,created_at desc);
create index evidence_by_user on public.evidence(user_id,created_at desc);
create index scenario_runs_by_user on public.scenario_runs(user_id,created_at desc);
-- PUBLIC PASSPORT READ ACCESS: intentionally NOT enabled. Requires an opt-in safe public view.
-- SECURITY TODO: production scoring/assessment decisions must be server-authoritative.
