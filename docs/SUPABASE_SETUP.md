# Supabase setup for the quiz-driven MVP

Skillmetry runs in an anonymous illustrative demo without Supabase. Real accounts, trusted quizzes, and cross-session history require Supabase Auth, PostgreSQL migrations, and one server-only credential.

## 1. Configure a project

1. Create or select a Supabase project.
2. In Authentication → URL Configuration, set the Site URL to the application origin.
3. Add `http://localhost:3000/auth/callback` and the deployed `/auth/callback` URL.
4. Enable email/password Auth and choose the email-confirmation policy for the environment.
5. Copy `.env.example` to `frontend/.env.local` and supply:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# Optional. Leave both unset for immediate serial retakes.
ASSESSMENT_MAX_COMPLETIONS=
ASSESSMENT_WINDOW_MINUTES=
```

Legacy projects may use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of the publishable key and `SUPABASE_SERVICE_ROLE_KEY` instead of the secret key. Never put an elevated key in a `NEXT_PUBLIC_*` variable. It belongs only in the trusted Next.js server environment.

## 2. Review and apply migrations

Migrations run in order:

- `0001_skillmetry_core.sql`: original relational scaffold.
- `0002_auth_profile_security.sql`: least-privilege owner policies and trusted-field locks.
- `0003_seed_career_catalog.sql`: three supported careers and canonical catalog.
- `20261011143435_secure_assessment_engine.sql`: additive sessions, trusted attempt metadata, legacy classification, narrower grants, and atomic completion.
- `20261011180657_assessment_concurrency_hardening.sql`: atomic start/resume, one-active-session uniqueness, explicit versioned pass thresholds, deterministic history ordering, and stronger database invariants.

The latest migration preserves profiles, claimed skill rows, and old attempts. It does not convert any legacy value into a trusted score.

For local development:

```powershell
npx supabase start --workdir database
npx supabase migration up --local --workdir database
```

Do not use a reset command on a database whose data must be preserved. Do not run `supabase db push` against a hosted project until the SQL diff and security tests are reviewed and the owner explicitly approves the apply.

## 3. Run local database tests

With Docker and local Supabase running:

```powershell
npm run test:rls
```

The profile and assessment pgTAP suites cover cross-account privacy, trusted-column restrictions, session uniqueness, optional atomic completion limits, result invariants, replay prevention, direct result forgery, session privacy, RPC denial, and legacy compatibility.

## 4. Run the authenticated route flow locally

Start the app in one PowerShell window with the local Supabase values and service-role key available to the process. Then set the same variables in a second window, set the app URL, and run:

```powershell
$env:SKILLMETRY_APP_URL = "http://127.0.0.1:3000"
npm run verify:assessment
```

The script creates two unique confirmed users in local Supabase, verifies the real application routes, and deletes only those disposable users in `finally`. It checks anonymous rejection, profile persistence, simultaneous start reuse, ten key-free public questions, cross-user isolation, simultaneous idempotent submission, six immediate serial retakes, ordered history, sign-out protection, and sign-in restoration.

## 5. Application checks

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

## Hosted rollout checklist

1. Review the complete migration chain and run it on staging first.
2. Run both pgTAP files against the intended schema state.
3. Verify sign-up confirmation, callback allowlist, sign-in, sign-out, recovery, profile restoration, and two-account isolation.
4. Verify start, submit, replay rejection, retake, and history in the deployed app.
5. Confirm the service-role value is server-only and absent from browser assets/logs.
6. Add platform rate limiting/monitoring and complete a security review before public use.
