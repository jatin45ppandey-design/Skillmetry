-- Phase 2 opt-in AI quota: server-side, authenticated and atomic.
-- DO NOT apply to hosted projects without owner approval and staging pgTAP.
create table public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature in ('mission', 'job')),
  usage_day date not null,
  requests int not null check (requests between 1 and 3),
  primary key (user_id, feature, usage_day)
);
alter table public.ai_usage_daily enable row level security;
alter table public.ai_usage_daily force row level security;
revoke all on public.ai_usage_daily from public, anon, authenticated;
grant select, insert, update on public.ai_usage_daily to service_role;

create function public.consume_ai_usage(p_feature text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := (select auth.uid());
  current_used int;
begin
  if owner_id is null or (select auth.role()) <> 'authenticated'
    or p_feature not in ('mission', 'job') then
    return false;
  end if;
  insert into public.ai_usage_daily (user_id, feature, usage_day, requests)
  values (owner_id, p_feature, (now() at time zone 'UTC')::date, 1)
  on conflict (user_id, feature, usage_day) do update
    set requests = public.ai_usage_daily.requests + 1
    where public.ai_usage_daily.requests < 3
  returning requests into current_used;
  return current_used is not null;
end;
$$;
revoke execute on function public.consume_ai_usage(text) from public, anon;
grant execute on function public.consume_ai_usage(text) to authenticated;
comment on function public.consume_ai_usage(text) is
  'Consumes one authenticated user AI request, max 3 per feature per UTC day.';
