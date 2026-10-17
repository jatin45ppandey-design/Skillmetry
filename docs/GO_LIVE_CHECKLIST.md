# Skillmetry production launch checklist

**Target:** Vercel Next.js monorepo + dedicated Supabase Postgres/Auth.

## Automated source validation (run in GitHub)
- [x] Full Next.js production build, typecheck, lint, Vitest and static release/security gates configured in CI.
- [x] Disposable Supabase migration, pgTAP tenant isolation and existing quiz/streak two-user E2E gates in GitHub.
- [x] Vercel config lives in `frontend/vercel.json`; monorepo deployment settings documented.
- [x] Production configuration preflight + read-only remote schema checks added.
- [x] Protected readiness endpoint checks enabled-feature table presence without leaking secrets.
- [x] Auth session / profile / quiz / learning data / public sharing E2E runner is automated against a disposable database.
- [ ] Confirm the **latest commit** passes both Validate starter and Isolated Supabase database tests (including a Next.js production build).

## Required account-specific setup (not possible to safely commit to GitHub)
- [ ] Import Vercel project, select `frontend` root, ensure monorepo source outside root included.
- [ ] Link a Supabase staging project; reconcile existing migration history without destroying any user data. Test the full baseline through 202610160006 migration on that staging project.
- [ ] Back up the production database, approve production migration application and confirm recovery strategy.
- [ ] Set deploy target's private Vercel env vars (`SUPABASE_SECRET_KEY`/service role key and health token), publishable URL/key, canonical HTTPS `SKILLMETRY_SITE_URL`; **never** commit secrets.
- [ ] Set the Supabase Auth site URL and `/auth/callback` redirect allowlist and test real confirmation/reset emails.
- [ ] Run `npm run release:preflight` and `npm run release:preflight:readonly` with deploy environment; neither modifies remote data.
- [ ] Enable DB limiter, learning, diagnostic, extra-quiz and streak flags only after approved migrations; rebuild to pick up `NEXT_PUBLIC_*` toggles.
- [ ] Verify real staging sign-up, sign-out, password reset, mobile and browser UX with two users.
- [ ] Configure email deliverability, uptime/readiness monitoring, error reporting and incident/backup contacts.
- [ ] Finalize legal privacy notice, retention/account deletion process and user support contact before general public launch.
- [ ] Import production Vercel project/deploy from `main`, use monitoring token to verify `/api/health/ready`, and exercise a fresh real learner flow.

## Deliberately not enabled by default
- External Gemini AI requires explicit user-provider authorization, rate-limits, cost budget and provider-key testing.
- Public Passport sharing requires staged privacy review before flags become true.
- Unavailable feature states should be shown honestly; students' quiz evidence is never fabricated.

**Release authority:** A GitHub Actions PASS demonstrates repository code and disposable test readiness. It does *not* prove hosted Supabase schema, email/OAuth redirects, domain configuration, live billing, customer data privacy or final deployment. Those gates require the operator's own accounts and explicit approval.
