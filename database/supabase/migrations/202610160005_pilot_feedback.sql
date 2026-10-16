-- Opt-in pilot feedback. One entry per student per UTC day; no identity in public results.
-- Requires disposable staging pgTAP + owner migration approval before hosted rollout.
create table public.pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feedback_day date not null default ((now() at time zone 'UTC')::date),
  area text not null check (area in ('onboarding','assessment','roadmap','projects','accessibility','other')),
  rating int not null check (rating between 1 and 5),
  comment text not null default '' check (length(comment) <= 1200),
  created_at timestamptz not null default now(),
  unique (user_id, feedback_day)
);
alter table public.pilot_feedback enable row level security;
alter table public.pilot_feedback force row level security;
revoke all on public.pilot_feedback from public, anon, authenticated;
grant select, insert on public.pilot_feedback to authenticated;
grant select, insert on public.pilot_feedback to service_role;
create policy "Owners read own pilot feedback" on public.pilot_feedback
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owners submit own pilot feedback" on public.pilot_feedback
  for insert to authenticated with check (user_id = (select auth.uid()));
-- A user cannot write/alter another student's rating or retroactively edit a submitted response.
-- The default date must always be server-controlled; prevent forged days.
create function public.force_pilot_feedback_day()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  new.feedback_day := (now() at time zone 'UTC')::date;
  new.created_at := now();
  return new;
end;
$$;
create trigger pilot_feedback_day_guard before insert on public.pilot_feedback
  for each row execute function public.force_pilot_feedback_day();
revoke execute on function public.force_pilot_feedback_day() from public, anon, authenticated;
