-- Product phase 4 staged opt-in editorial approval workflow.
-- DO NOT apply to hosted Supabase without a separate authorization and RLS/role rehearsal.
-- This table never contains draft bodies, quiz answer keys or student records.
create table if not exists public.admin_editorial_reviews (
 id uuid primary key default gen_random_uuid(),
 module text not null check (module in ('guides','roadmaps','courses','missions','assessments')),
 content_id text not null check (length(content_id) between 1 and 120),
 requested_revision integer not null check (requested_revision > 0),
 draft_digest text not null check (draft_digest ~ '^[0-9a-f]{64}$'),
 status text not null default 'pending' check (status in ('pending','approved','changes_requested')),
 requested_by uuid not null references auth.users(id) on delete restrict,
 reviewed_by uuid references auth.users(id) on delete set null,
 review_note text check (review_note is null or length(review_note) <= 600),
 requested_at timestamptz not null default now(),
 reviewed_at timestamptz,
 unique(module,content_id,requested_revision),
 check ((status='pending' and reviewed_by is null and reviewed_at is null)
   or (status<>'pending' and reviewed_by is not null and reviewed_at is not null))
);
create index if not exists admin_editorial_reviews_queue
 on public.admin_editorial_reviews(status,requested_at desc);
alter table public.admin_editorial_reviews enable row level security;
alter table public.admin_editorial_reviews force row level security;
revoke all on public.admin_editorial_reviews from public, anon, authenticated;
grant select,insert,update on public.admin_editorial_reviews to service_role;
-- Application API gates requests with admin_members role checks, same-origin validation
-- and a saved draft hash. Publisher must match approved revision + hash.
-- Existing owner-only publishing behavior stays unchanged unless server flag enabled.
