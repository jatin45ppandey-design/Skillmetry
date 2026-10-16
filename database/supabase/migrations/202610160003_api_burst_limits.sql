-- P1 staged atomic request throttling.
-- Must be separately approved and migrated before turning on the server flag.
create table if not exists public.api_burst_limit_windows (
  key_hash text not null check (length(key_hash) = 64),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 1),
  primary key (key_hash, window_started_at)
);
create index if not exists api_burst_limit_old_windows_idx
  on public.api_burst_limit_windows (window_started_at);
alter table public.api_burst_limit_windows enable row level security;
alter table public.api_burst_limit_windows force row level security;
revoke all on table public.api_burst_limit_windows from public, anon, authenticated;
grant select, insert, update, delete on table public.api_burst_limit_windows to service_role;

create or replace function public.try_consume_api_burst(
  p_key_hash text,
  p_window_seconds integer,
  p_limit integer
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  if p_key_hash !~ '^[0-9a-f]{64}$'
     or p_window_seconds not between 60 and 86400
     or p_limit not between 1 and 1000
  then
    raise exception using errcode = '22023', message = 'invalid rate limit input';
  end if;

  v_start := pg_catalog.to_timestamp(
    pg_catalog.floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.api_burst_limit_windows (key_hash, window_started_at, request_count)
  values (p_key_hash, v_start, 1)
  on conflict (key_hash, window_started_at)
  do update set request_count = public.api_burst_limit_windows.request_count + 1
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;
revoke execute on function public.try_consume_api_burst(text,integer,integer)
  from public, anon, authenticated;
grant execute on function public.try_consume_api_burst(text,integer,integer)
  to service_role;
