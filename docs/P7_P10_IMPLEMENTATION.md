# Skillmetry P7–P10 source implementation and release gates

**Code date:** 2026-10-16. Source committed on `main`; production deployment and hosted migrations are not performed.

## P7 — Job and career intelligence

- `/jobs` now accepts a public job description, validates 50–12,000 characters, extracts curated canonical skill mentions and gives actionable links.
- `/api/jobs/analyze` optionally compares with the authenticated user's latest supported server-graded quiz evidence.
- The input is **not stored** by default. Authenticated students may explicitly save a compact private requirement summary (`GET/POST/DELETE /api/jobs/saved`) containing only the chosen role title and recognized canonical skills, never the raw pasted description or any quiz-derived grade. Anonymous analysis never uses illustrative sample scores.
- This is deterministic phrase matching, not a comprehensive ATS, company database or placement probability engine.
- Saved job comparisons, opportunity data and deeper experience requirements remain pending.

## P8 — AI tutor and career copilot MVP

- `/tutor` and `POST /api/ai/tutor` provide always-available, curated reference guidance without a model.
- Sending a question to Google Gemini requires explicit per-message consent, authenticated session, `SKILLMETRY_AI_TUTOR_ENABLED=true`, server-only `GEMINI_API_KEY`, and active DB-backed atomic rate limiting.
- The provider receives only the chosen canonical skill, the typed question and curated learning context. No account email, user ID, entire history, trusted grade or session token is transmitted.
- Paid AI calls use a fixed provider endpoint, maximum input/output sizes, timeout and request limit. No AI answer creates or changes scores.
- Production AI is **off**, has not been exercised against live credentials and needs independent privacy, safety and evaluation review.
- Multiturn personalization, diagnostic topic integration, quotas and provider-cost observability remain pending.

## P9 — Career Passport and selective public sharing

- Private passport now displays measured evidence and supports **Print / Save as PDF** with a separate print layout.
- A student can choose 1–8 measured skills and explicitly consent to display name, target career and selected quiz scores.
- The backend issues a 256-bit random URL token, persists only its SHA-256 hash and a limited snapshot, expires after seven days and supports owner-side revocation.
- The public route checks token, expiry, revocation and secure configuration server-side; returns generic not-found for invalid links. No anonymous database grant.
- `202610160005_passport_sharing.sql` is staged; sharing requires both `SKILLMETRY_PASSPORT_SHARING_ENABLED=true` and `NEXT_PUBLIC_PASSPORT_SHARING_ENABLED=true` after explicit owner approval.
- Advanced portfolio customization, project evidence selection, independent PDF generation, and revocation/browser tests on staged Supabase remain pending.

## P10 — product and release hardening

- Preserves existing Learning Chapters identity while extending workspace UI.
- Adds referrer suppression, framing denial, content-type protection, browser capability restrictions, and private URL search-index exclusions.
- Adds static source/release checks in CI (in addition to TypeScript, ESLint, Vitest and production Next.js build).
- Print layout respects privacy, focus outlines and reduced-motion behavior.
- **Not a substitute** for real desktop/mobile keyboard, screen-reader, browser, load and authenticated end-to-end testing.
- A deployment-approved CSP needs dynamic nonces and should be configured only after QA; no brittle CSP header has been guessed.

## Hard deployment gates

1. Get explicit owner approval for **each** pending migration in order: `202610160001`, `...002`, `...003`, `...004`, `...005`; never reset user data.
2. Rehearse all migrations and `npm run test:rls` against a disposable staging DB, including tenant isolation and anonymous table access.
3. Verify authenticated job comparisons, AI opt-in/limits/provider errors, privacy export, password recovery, share creation/expiration/revocation and cross-user prevention with real browser sessions.
4. Perform manual responsive/keyboard/screen-reader/performance QA; configure production monitoring, backup/restore, incident response and vulnerability review.
5. Configure canonical HTTPS `SKILLMETRY_SITE_URL`, provider credentials and rate-limit cleanup before enabling P8/P9; enable only reviewed flags.
6. Confirm public privacy/terms/contact support and licensing decisions before collecting real student data.

**No hosted Supabase changes, external deployment, provider key creation or enablement action has been carried out by these source commits.**

## RLS deployment verification

Run the **RLS** isolation suite `database/supabase/tests/passport_sharing_rls.test.sql` after staging migration 005. Confirm browser roles can read only their own records, cannot create share links by direct insert or mutate snapshot data, and cannot restore a revoked link. The public route uses a narrowly scoped, token-validated server lookup only.
