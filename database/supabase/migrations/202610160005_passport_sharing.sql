-- P9 staged: revocable, short-lived, consent-based portfolio links.
-- Apply only after explicit hosted rollout approval and staging isolation tests.
create table if not exists public.passport_share_links (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object' and octet_length(snapshot::text) <= 12000),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 created_at timestamptz not null default now(),
 check(expires_at <= created_at + interval '8 days')
);
create index if not exists passport_share_owner_idx on public.passport_share_links(user_id,created_at desc);
alter table public.passport_share_links enable row level security;
alter table public.passport_share_links force row level security;
revoke all on public.passport_share_links from public,anon,authenticated;
grant select,insert,update on public.passport_share_links to authenticated;
grant select,insert,update on public.passport_share_links to service_role;
create policy "Passport owners inspect private link metadata"
 on public.passport_share_links for select to authenticated
 using(user_id=(select auth.uid()));
create policy "Passport owners revoke their links"
 on public.passport_share_links for update to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
-- No anonymous grants or policies: the server validates random tokens and
-- returns only deliberately selected display fields.
