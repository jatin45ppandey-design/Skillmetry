# Skillmetry — one-time Vercel deployment configuration

**Recommended platform:** Vercel + Supabase (project uses Next.js SSR, authenticated API routes, Postgres and background-safe server-only handlers). Static hosting **cannot** run this application.

## Vercel project import
1. Import GitHub repository `jatin45ppandey-design/Skillmetry`.
2. Select **Root Directory: `frontend`**, Framework **Next.js**, and leave "Include source files outside of the Root Directory" enabled. This is essential for the `backend`, `shared` npm workspaces and repository lockfile. `frontend/vercel.json` fixes the framework preset.
3. Use default Build `npm run build`, default Install (npm workspaces), default output `.next`. Do NOT use `output: export` or choose the repository root as an "Other" static project.
4. Use Node.js 22 if prompted. Enable automatic deploys from `main`; preview deploys must NOT point at the live production database if they expose mutable APIs.
5. Add environment variables in Vercel's private settings. **Never commit private keys, screenshots, or environment dumps.**

## Environment variables — minimal functional deployment
- `NEXT_PUBLIC_SUPABASE_URL`: HTTPS project URL (public).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable/anon key (public).
- `SUPABASE_SECRET_KEY` OR `SUPABASE_SERVICE_ROLE_KEY`: elevated **server-only** project credential (never public).
- `SKILLMETRY_SITE_URL`: canonical HTTPS origin matching the deployed domain; no path.
- `SKILLMETRY_HEALTHCHECK_TOKEN`: long random, server-only token for protected readiness monitor.
- `SKILLMETRY_DB_RATE_LIMITING_ENABLED=true`: enable **only after** database migration 003 is applied and tested; on until then leaves throttling disabled.
- `SKILLMETRY_STREAKS_ENABLED=true` and `NEXT_PUBLIC_LEARNING_STREAK_ENABLED=true`: enable **only after** migration 006 and real authenticated streak tests.
- `NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED=true`: only after migration 004.
- `NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED=true`: only after migration 002.
- `NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=true`: only after migration 001.
- `SKILLMETRY_PASSPORT_SHARING_ENABLED` AND `NEXT_PUBLIC_PASSPORT_SHARING_ENABLED`: leave false until share-link privacy tests and migration 005 are approved.
- `SKILLMETRY_AI_TUTOR_ENABLED`: false unless external Gemini provider credentials, consent, rate limiting and billing controls are explicitly approved; `GEMINI_API_KEY` stays server only.
- `GOOGLE_OAUTH_ENABLED`, `GITHUB_OAUTH_ENABLED`: false until OAuth client IDs/secrets exist in Supabase.
- The build-time `NEXT_PUBLIC_*` flags require a fresh Vercel build after changing.

## Supabase one-time setup (cannot be completed by a GitHub source commit)
1. Use a dedicated **staging** project first. Verify database migrations sequentially, baseline through `202610160006_learning_streak.sql`, with no manual cherry-picking. Existing hosted projects may be partially migrated, so reconcile migration history and backing data before any production write.
2. Confirm cross-user RLS, quiz scoring, complete auth, owner-only learning data, streak timezone and session refresh against that staging environment.
3. Configure Supabase Auth > URL Configuration: **Site URL** is the actual Vercel production origin. Allow callback `https://YOUR_DOMAIN/auth/callback` (and explicitly chosen preview callback origins only when needed).
4. Configure confirmation/reset email delivery and SPF/DKIM as required by your email provider. Keep OAuth disabled unless separately configured.
5. Back up any existing production database, document rollback, inspect service status and then (only with owner approval) apply vetted migrations.
6. To enable Vercel production flags, approve the matching database migrations **first**. Deploy application only after those checks pass.

## Verification
- GitHub CI: typecheck, lint, Vitest, build, release/static-security gates and public URL smoke.
- Disposable CI: full migrations, pgTAP RLS suites, and authenticated two-user production-build API E2E (quiz/profile/streak, planner, practice, missions, saved jobs, share/revocation) (when workflow completes successfully).
- `npm run release:preflight`: verifies environment configuration safely, without printing secrets or contacting hosted services.
- Authenticated health: `GET /api/health/ready` with `Authorization: Bearer <monitor-token>`, otherwise 404. Returns only `ready` / `unavailable`.
- Production canary: signup → confirmation → onboarding → quiz → progress → planner/practice/streak → sign-out → sign-in, with separate test users; check email provider, password reset, accessibility/mobile viewport and errors.

## Not automatic
GitHub changes do NOT update hosted Supabase, Vercel project env vars, Auth redirect allowlists, email provider settings or perform production deployment. A brand-new Vercel project also requires a user-owned Vercel account. Legal/privacy notices and account deletion policy must be finalized before general public release.

Source-ready does **not** mean live-integrated until these account-specific checks pass.
