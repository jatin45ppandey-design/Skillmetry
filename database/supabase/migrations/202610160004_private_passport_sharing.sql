-- Explicit, revocable, short-lived snapshots. No raw profile/attempt table is public.
-- Staging pgTAP and owner approval REQUIRED before any hosted migration.
create table public.passport_shares (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  snapshot jsonb not null check (pg_catalog.jsonb_typeof(snapshot) = 'object'
    and pg_catalog.octet_length(snapshot::text) <= 8192),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint passport_share_ttl_check check (expires_at > created_at
    and expires_at <= created_at + interval '31 days')
);
create index passport_shares_expiration_idx on public.passport_shares(expires_at);
alter table public.passport_shares enable row level security;
alter table public.passport_shares force row level security;
revoke all on public.passport_shares from public, anon, authenticated;
grant select, insert, update on public.passport_shares to authenticated;
grant select, insert, update on public.passport_shares to service_role;
create policy "Owners see own share settings" on public.passport_shares for select
  to authenticated using (user_id = (select auth.uid()));
create policy "Owners create own share" on public.passport_shares for insert
  to authenticated with check (user_id = (select auth.uid()));
create policy "Owners rotate or revoke own share" on public.passport_shares for update
  to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Public access is only to the pre-approved snapshot for an unexpired token.
-- Raw user profiles, private quiz attempts, projects, emails, and tokens are NOT exposed.
create function public.read_public_passport(p_token_hash text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select s.snapshot from public.passport_shares s
  where pg_catalog.length(p_token_hash) = 64
    and s.token_hash = p_token_hash
    and s.revoked_at is null
    and s.expires_at > now()
  limit 1;
$$;
revoke execute on function public.read_public_passport(text) from public;
grant execute on function public.read_public_passport(text) to anon, authenticated;
comment on function public.read_public_passport(text) is
  'Returns only an explicit learner-curated public snapshot, never raw private records.';
