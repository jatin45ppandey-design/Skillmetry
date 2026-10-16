# P1/P2 release status — 2026-10-16

**Source changes are on `main`. P1 and P2 are partially implemented; NOT closed.**

## Implemented in code

### P1
- Fix prerequisite-state logic so an unavailable/unattempted quiz no longer automatically blocks downstream learning; keep observed below-threshold prerequisites separate from missing evidence.
- Add strict email/password recovery request and authenticated update flow. No user-enumeration success response; require fixed `SKILLMETRY_SITE_URL` and Supabase redirect/email configuration.
- Add authenticated, RLS-scoped JSON export for application-owned account records, explicit missing-table warning, bounded deterministic pagination, and no-store responses.
- Stage distributed PostgreSQL burst limiting for sign-up, sign-in, password reset, quiz starts and submissions. New SQL migration and code guard exist, but the enable flag is OFF.

### P2
- Add five developer-authored server-only 2026.2 ten-question foundational quizzes: CSS, TypeScript, React, Node.js and REST APIs.
- Add browser-safe metadata behind `NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED` (OFF).
- Preserve all original 2026.2 and four original 2026.3 diagnostic quiz banks; new domains do not falsely advertise diagnostic reviews.
- Add service-role-only RPC expansion migration `202610160002_expand_foundational_assessments.sql`, version guards and unit tests.

## Release blockers and incomplete tasks

- Phase D `202610160001_phase_d_diagnostics.sql` remains unapproved/unapplied to hosted Supabase.
- P2 expanded SQL `202610160002_expand_foundational_assessments.sql` and P1 rate-limit SQL `202610160003_api_burst_limits.sql` remain unapproved/unapplied to hosted Supabase.
- No owner action was taken in hosted database, Supabase Auth settings, deployment environment or provider secrets.
- Editor/educator review needed for five new question banks before public release; build 2026.3 diagnostic pools and topic practice for those tracks.
- Remaining canonical skills, reviewed question authoring console, richer explanations and browser QA are not yet implemented.
- P1 must still complete trusted ingress IP protections, operational dashboards and alerts, account deletion and retention policy, independent security audit, compatibility-aware dependency review, staging auth/password recovery QA, device accessibility QA, and CI integration/E2E suites.
- Production setting `SKILLMETRY_SITE_URL` must be configured for password reset; verify provider email flows and redirect allowlist.
- The staged rate-limit flag remains OFF until the SQL, cross-instance concurrency and fail-closed behavior have been verified in staging. Perform scheduled cleanup of expired buckets and edge-IP throttling separately.
- Avoid changing historical quiz scores, user IDs, score provenance or sample demo isolation. No guessed employability percentage.

## Required QA and hosted approval flow

1. Verify CI checks for final `main` commit: typecheck, lint, Vitest and Next.js build.
2. Stage migrations in order using a disposable test project; run multi-user RLS and authenticated E2E tests for all nine quiz types and email recovery flows.
3. Obtain an explicit owner approval before any hosted migration, external Auth/dashboard setting or flag enablement.
4. Perform live desktop/mobile/browser QA, test login/retake/export, and review dependency risks.
5. Release only the validated and enabled features; don't label staged items production-ready.

## Feature flag defaults
```
NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=false
NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED=false
SKILLMETRY_DB_RATE_LIMITING_ENABLED=false
SKILLMETRY_SITE_URL=
```

Historical P0 production assessment flow remains the default until migrations are deliberately promoted.
