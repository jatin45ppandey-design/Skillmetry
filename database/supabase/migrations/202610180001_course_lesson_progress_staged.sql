-- Product phase 2/3: private per-lesson study activity, NOT a grade or certification.
-- STAGED ONLY. Do not apply to hosted Supabase until separately authorized and RLS-tested.
create table if not exists public.course_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null references public.admin_courses(slug) on delete cascade,
  lesson_id text not null check (length(lesson_id) between 1 and 96),
  published_revision integer not null check (published_revision > 0),
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_id),
  check ((completed and completed_at is not null) or (not completed and completed_at is null))
);
create index if not exists course_lesson_progress_user_course
  on public.course_lesson_progress(user_id, course_slug, published_revision);
alter table public.course_lesson_progress enable row level security;
alter table public.course_lesson_progress force row level security;
revoke all on public.course_lesson_progress from public, anon, authenticated;
grant select,insert,update(completed,completed_at,updated_at,published_revision)
  on public.course_lesson_progress to authenticated;
grant all on public.course_lesson_progress to service_role;
drop policy if exists "course progress read owner" on public.course_lesson_progress;
create policy "course progress read owner" on public.course_lesson_progress
 for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "course progress insert owner" on public.course_lesson_progress;
create policy "course progress insert owner" on public.course_lesson_progress
 for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists "course progress update owner" on public.course_lesson_progress;
create policy "course progress update owner" on public.course_lesson_progress
 for update to authenticated using (user_id=(select auth.uid()))
 with check (user_id=(select auth.uid()));
-- Do not grant DELETE; unchecking a lesson updates its status.
-- Backend must validate the lesson belongs to the CURRENT published revision.
-- No assessment_attempts or student profile data is touched by this migration.
