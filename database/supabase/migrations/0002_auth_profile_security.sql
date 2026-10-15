-- Phase 2A: authenticated profile persistence and least-privilege access.
-- This migration intentionally hardens the permissive Phase 1 scaffold in 0001.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_preferences jsonb not null default '{}'::jsonb;

alter table public.profiles
  drop constraint if exists profiles_onboarding_preferences_object;
alter table public.profiles
  add constraint profiles_onboarding_preferences_object
  check (jsonb_typeof(onboarding_preferences) = 'object' and octet_length(onboarding_preferences::text) <= 2048);

update public.profiles set display_name = 'Student' where btrim(display_name) = '';
alter table public.profiles
  drop constraint if exists profiles_display_name_length;
alter table public.profiles
  add constraint profiles_display_name_length
  check (char_length(btrim(display_name)) between 1 and 64);

update public.user_skills set claimed_proficiency = 0 where claimed_proficiency is null;
alter table public.user_skills
  alter column claimed_proficiency set default 0,
  alter column claimed_proficiency set not null,
  add column if not exists verified_status boolean not null default false,
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id);

alter table public.user_skills
  drop constraint if exists user_skills_verified_audit;
alter table public.user_skills
  add constraint user_skills_verified_audit check (
    (verified_status = false and verified_at is null and verified_by is null)
    or
    (verified_status = true and verified_at is not null and verified_by is not null)
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_skills_set_updated_at on public.user_skills;
create trigger user_skills_set_updated_at
before update on public.user_skills
for each row execute function public.set_updated_at();

-- Remove every broad owner policy from the scaffold before adding explicit policies.
drop policy if exists "Profile owner" on public.profiles;
drop policy if exists "Skill owner" on public.user_skills;
drop policy if exists "Mission owner" on public.user_missions;
drop policy if exists "Assessment owner" on public.assessment_attempts;
drop policy if exists "Evidence owner" on public.evidence;
drop policy if exists "Scenario owner" on public.scenario_runs;
drop policy if exists "Job analysis owner" on public.job_analyses;
drop policy if exists "Passport settings owner" on public.passport_settings;

-- Grants are a separate security boundary from RLS. Start closed, then grant only
-- the operations and columns that Phase 2A exposes to browser-authenticated users.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_skills from anon, authenticated;
revoke all on table public.user_missions from anon, authenticated;
revoke all on table public.assessment_attempts from anon, authenticated;
revoke all on table public.evidence from anon, authenticated;
revoke all on table public.scenario_runs from anon, authenticated;
revoke all on table public.job_analyses from anon, authenticated;
revoke all on table public.passport_settings from anon, authenticated;
revoke all on table public.careers from anon, authenticated;
revoke all on table public.skills from anon, authenticated;
revoke all on table public.skill_prerequisites from anon, authenticated;
revoke all on table public.career_skills from anon, authenticated;
revoke all on table public.missions from anon, authenticated;

grant select on table public.careers to anon, authenticated;
grant select on table public.skills to anon, authenticated;
grant select on table public.skill_prerequisites to anon, authenticated;
grant select on table public.career_skills to anon, authenticated;
grant select on table public.missions to anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert (id, display_name, target_career_id, hours_per_week, onboarding_completed, onboarding_preferences)
  on table public.profiles to authenticated;
grant update (display_name, target_career_id, hours_per_week, onboarding_completed, onboarding_preferences)
  on table public.profiles to authenticated;

grant select on table public.user_skills to authenticated;
grant insert (user_id, skill_id, claimed_proficiency)
  on table public.user_skills to authenticated;
grant update (claimed_proficiency)
  on table public.user_skills to authenticated;

-- Trusted result/review tables are read-only to students. A later server process
-- may write them with a private elevated credential after its own authorization.
grant select on table public.user_missions to authenticated;
grant select on table public.assessment_attempts to authenticated;
grant select on table public.evidence to authenticated;
grant select on table public.scenario_runs to authenticated;
grant select on table public.job_analyses to authenticated;
grant select on table public.passport_settings to authenticated;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) is not null and id = (select auth.uid()));
create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check ((select auth.uid()) is not null and id = (select auth.uid()));
create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) is not null and id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "user_skills_select_own"
on public.user_skills for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "user_skills_insert_claimed_own"
on public.user_skills for insert to authenticated
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "user_skills_update_claimed_own"
on public.user_skills for update to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "user_missions_select_own"
on public.user_missions for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "assessment_attempts_select_own"
on public.assessment_attempts for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "evidence_select_own"
on public.evidence for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "scenario_runs_select_own"
on public.scenario_runs for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "job_analyses_select_own"
on public.job_analyses for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "passport_settings_select_own"
on public.passport_settings for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

alter table public.profiles force row level security;
alter table public.user_skills force row level security;
alter table public.user_missions force row level security;
alter table public.assessment_attempts force row level security;
alter table public.evidence force row level security;
alter table public.scenario_runs force row level security;
alter table public.job_analyses force row level security;
alter table public.passport_settings force row level security;

comment on column public.user_skills.claimed_proficiency is
  'Student self-report. Authenticated owners may write this column.';
comment on column public.user_skills.demonstrated_proficiency is
  'Trusted reviewed evidence only. Students have no INSERT or UPDATE grant.';
comment on column public.user_skills.verified_status is
  'Trusted verification decision only. Students have no INSERT or UPDATE grant.';
comment on table public.assessment_attempts is
  'Trusted server-graded attempts. Students have SELECT-only access to their own rows.';
comment on table public.evidence is
  'Trusted evidence review records. Students cannot write review status or notes.';
