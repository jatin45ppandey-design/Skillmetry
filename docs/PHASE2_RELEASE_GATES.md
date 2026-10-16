# Phase 2: staging and production acceptance gates

Phase 2 code is integrated in draft PR #10 only. Production deployment and hosted migrations are **not authorized** by merging code alone.

## Exact additive migration order

1. `202610160001_phase_d_diagnostics.sql` — Phase D (if not applied in the target).
2. `202610160002_mission_submissions.sql` — private mission evidence.
3. `202610160003_ai_usage_daily.sql` — atomic Gemini usage quotas.
4. `202610160004_private_passport_sharing.sql` — hash-only, revocable public snapshots; direct authenticated writes disallowed.
5. `202610160005_pilot_feedback.sql` — private student pilot feedback.

Do NOT reset production or force-apply migrations. First use a **disposable local Supabase** stack in GitHub Actions, then explicit owner-approved hosted staging with `supabase migration list --workdir database` review.

The new `phase2-disposable-rls.yml` workflow uses GitHub Actions runner Docker and runs `npm run test:rls` against disposable local PostgreSQL only. It has **no production Supabase credentials or environment variables**. Passing typecheck alone is not enough for RLS correctness.

## Privacy / provider gates

- `SKILLMETRY_AI_ENABLED=false` and no provider traffic until Gemini account keys, billing, terms and quota migration are approved. Requests are bounded, JSON-validated and quota-limited to 3 per feature per student per UTC day. Optional job AI calls send user-entered text to Gemini only after a direct click. Private keyword matching remains browser-only.
- `ACCOUNT_DELETION_ENABLED=false` until the owner verifies the full Auth cascade, cloud Storage ownership, browser sign-out and recovery behavior using disposable users. Only verified email/password reauthentication is implemented; OAuth-only users need additional account-deletion support.
- Mission submissions are **unverified self-reported work**; GitHub inspection reads *public repository metadata* only and makes no authorship claim.
- Passport public snapshots must be explicitly consented, exclude email and raw attempts, expire in 30 days, and be revoked by link rotation/revoke. Server-created quiz scores cannot be forged through direct PostgREST user writes.
- Pilot feedback is opt-in, isolated by RLS and limited to one response per student UTC day. No student participant is automatically enrolled.

## Acceptance before production

- GitHub CI: install, typecheck, lint, tests, production build.
- Disposable pgTAP: all existing + new migration RLS cases, multiple users, anon, concurrency.
- Hosted staging: run migrations with owner approval and verify authenticated Missions, Twin, Passport revoke/expiry, Jobs/Gemini fallback, user feedback and account deletion (throwaway users only).
- Browser QA: desktop and narrow mobile, keyboard/screenreader, loading/error/empty states.
- Security: dependency triage, secret scanning, request quotas, provider cost limits, stale session handling, and cache headers.
- Operational: staging & production domain redirects, backups, telemetry/privacy notice, recovery plan, data retention and right-to-delete playbook.
- User pilot: recruit consented students, test real workflows and record outcomes/bugs. An intake form is not evidence of a completed user pilot.

No production deployment, secret rotation, hosted migration or real-account deletion was performed in this branch.

## GitHub owner-identity connection (C04 addition)
Students can optionally use Supabase Auth identity linking to connect GitHub through an explicit redirect/consent flow in Settings, and can disconnect when at least one alternate sign-in identity exists. Public repository inspection compares GitHub's numeric repository owner ID to the **authenticated linked GitHub provider ID**. This supports individual-owned public repositories only and never claims commits/authorship/skill mastery. OAuth provider enablement and callback QA still require an authorized isolated staging Auth project; no provider credentials, private-repo scopes or tokens are stored by this source change.
