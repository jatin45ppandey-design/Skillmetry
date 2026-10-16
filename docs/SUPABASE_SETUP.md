# Supabase setup for the quiz-driven MVP

Skillmetry runs in an anonymous illustrative demo without Supabase. Real accounts, trusted quizzes, and cross-session history require Supabase Auth, PostgreSQL migrations, and one server-only credential.

## Password recovery

The sign-in screen provides a **Forgot password?** link. Set a trusted server-only `SKILLMETRY_APP_ORIGIN` for this environment (e.g. `http://localhost:3000` or an approved HTTPS staging URL); the recovery endpoint deliberately rejects an unset origin rather than constructing reset links from HTTP Host headers. A password-recovery request sends a Supabase recovery email without revealing whether the address exists. Supabase verifies the link through `/auth/callback?next=/auth/reset-password`, establishes a recovery session, and the student can set a new password through an owner-authenticated server route. The old password and recovery tokens are never sent to Skillmetry's browser-safe metadata.

In Supabase Auth email templates, keep the recovery confirmation URL or use a verified `token_hash` recovery link. Allowlist `http://localhost:3000/auth/callback**` and the trusted production callback URL. The reset-password page requires a valid Supabase session; no service-role credential is used.

## 1. Configure a project

1. Create or select a Supabase project.
2. In Authentication → URL Configuration, set the Site URL to the application origin.
3. Add `http://localhost:3000/auth/callback` and the deployed `/auth/callback` URL.
4. Enable email/password Auth and choose the email-confirmation policy for the environment.
5. In Authentication → Email Templates → **Confirm signup**, send a visible `{{ .Token }}` six-digit code, or configure an SSR-safe confirmation link. The signup API passes `emailRedirectTo` as `/auth/callback?next=...`. To preserve that return path, use `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirm email</a>` in the template. Allow `http://localhost:3000/auth/callback**` and the corresponding production callback under Authentication → URL Configuration → Redirect URLs. A code cannot be entered unless the email actually supplies `{{ .Token }}`; for link-only emails, click the link.
6. Copy `.env.example` to `frontend/.env.local` and supply:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# Optional. Leave both unset for immediate serial retakes.
ASSESSMENT_MAX_COMPLETIONS=
ASSESSMENT_WINDOW_MINUTES=
```

Google and GitHub sign-in is optional and configured separately. See [Social login setup](SOCIAL_LOGIN_SETUP.md) for OAuth provider Client IDs/Secrets, redirect allowlists and the two non-secret enable flags.\n\nLegacy projects may use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of the publishable key and `SUPABASE_SERVICE_ROLE_KEY` instead of the secret key. Never put an elevated key in a `NEXT_PUBLIC_*` variable. It belongs only in the trusted Next.js server environment.

### Email confirmation and returning to assessments

From signed-out `/assessments`, **Create account** preserves `next=/assessments` through signup, OTP entry, resend, and successful email callbacks. The six-digit code is verified by Supabase Auth on the server, which establishes an SSR cookie session. Link callbacks accept either a PKCE `code` or a `token_hash&type=email`; arbitrary type parameters are not accepted.

Default Supabase confirmation emails may contain only a link, not a visible code. The user should click that link, while the UI offers code entry only for mail templates containing the code. A standard PKCE link opened in a different browser can lack the original verifier; a token-hash link avoids that client-state requirement.

**Acceptance test:** Create a disposable account from the assessment page, complete the actual confirmation email, confirm the session and return to `/assessments`, and start a server-graded quiz. Also test expired OTP, resend cooldown, existing verified accounts, and mobile. Never modify hosted auth settings or apply database migrations without owner approval.

### Phase D diagnostic rollout (NOT YET APPLIED TO HOSTED SUPABASE)

The application supports a new 2026.3 bank of 30 questions per skill, sampling 15 balanced across five topics and three difficulties. It remains **off by default**. Version 2026.2 attempts and trusted scoring stay fully usable.

Rollout requires (1) review the additive `database/supabase/migrations/202610160001_phase_d_diagnostics.sql`; (2) run staging/local migration and `database/supabase/tests/diagnostics_rls.test.sql`; (3) get the owner's explicit approval to apply to hosted Supabase; (4) only after success set `NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=true` in the deployment's build environment or `frontend/.env.local` for local; (5) rebuild/restart the frontend and test private review/retake/practice endpoints. **Do not enable the flag before installing the migration.**

For local-only development with a separately migrated database:

```dotenv
NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=true
```

This is a public feature gate, not an access-control mechanism; all grades and evidence are server-authoritative. To roll back application behavior without modifying data, set it to `false` and rebuild. Do not drop the evidence table or rewrite historical attempts.

See [Phase D Implementation and Validation](PHASE_D_IMPLEMENTATION.md).

## 2. Review and apply migrations

Migrations run in order:

- `0001_skillmetry_core.sql`: original relational scaffold.
- `0002_auth_profile_security.sql`: least-privilege owner policies and trusted-field locks.
- `0003_seed_career_catalog.sql`: three supported careers and canonical catalog.
- `20261011143435_secure_assessment_engine.sql`: additive sessions, trusted attempt metadata, legacy classification, narrower grants, and atomic completion.
- `20261011180657_assessment_concurrency_hardening.sql`: atomic start/resume, one-active-session uniqueness, explicit versioned pass thresholds, deterministic history ordering, and stronger database invariants.
- `20261012000000_add_full_stack_career.sql`: adds the fourth career and its canonical skill relationships.
- `20261012000001_enforce_trusted_attempt_metadata.sql`: closes nullable metadata gaps for trusted quiz results.
- `202610160001_phase_d_diagnostics.sql`: **pending owner approval**; adds immutable per-question diagnostic review evidence, owner-scoped RLS, and atomic version-2026.3 completion RPC.

The assessment migration chain preserves profiles, claimed skill rows, and old attempts. It does not convert any legacy value into a trusted score.

> Hosted status (2026-10-15): all seven migrations were applied to the linked Skillmetry project after a restore-tested backup and approved dry-run. The commands below are for a NEW local database or a different project; do not reapply migrations blindly to the existing hosted project.

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
