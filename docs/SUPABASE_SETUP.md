# Supabase setup for Phase 2A

Skillmetry runs without Supabase in anonymous demo mode. Configure Supabase only when you want real accounts and cross-device persistence.

## 1. Create and configure the project

1. Create a Supabase project.
2. In **Authentication → URL Configuration**, set the Site URL to your application origin.
3. Add redirect URLs for `http://localhost:3000/auth/callback` and the deployed `/auth/callback` URL.
4. Keep email/password authentication enabled. Decide whether email confirmation is required for your environment.
5. Copy `.env.example` to `.env.local` and fill in only the public project values:

```powershell
Copy-Item .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Legacy projects may use an anon key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`; the runtime accepts it as a fallback. Never put a secret key or legacy service-role key in a `NEXT_PUBLIC_*` variable. This web application does not require an elevated key.

## 2. Apply versioned migrations

Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), then run:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Migrations apply in order:

- `0001_skillmetry_core.sql`: original relational scaffold.
- `0002_auth_profile_security.sql`: least-privilege grants, owner RLS, trusted-field write locks, and profile preferences.
- `0003_seed_career_catalog.sql`: three supported careers, canonical skills, prerequisites, weights, and curated missions.

Do not deploy `0001` alone. Its original broad `FOR ALL` policies are intentionally removed by `0002` because they permit students to write trusted results.

## 3. Run database security tests

Docker must be running for the local Supabase stack.

```powershell
supabase start
supabase db reset
npm run test:rls
```

`supabase/tests/profile_rls.test.sql` proves that separate Alice and Bob sessions cannot read or mutate each other's rows and that a student cannot write demonstrated proficiency, verified status, assessment grades, or evidence approval.

## 4. Run application checks

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Then test this flow with email confirmation configured as it will be in production:

1. Complete onboarding anonymously and create an account.
2. Confirm the email if required, then sign in.
3. Wait for **Cloud synced** in `/account`.
4. Sign out. The browser returns to labeled demo data.
5. Sign in again. The claimed profile is restored from PostgreSQL.

## Trusted assessment and review processes

Phase 2A deliberately does not implement elevated grading or evidence approval. Student sessions receive SELECT-only access to trusted result tables. A future worker must authenticate and authorize its caller independently, use a server-only secret managed by the deployment platform, and write auditable grading/review events. Never reuse the browser Supabase client for that process.
