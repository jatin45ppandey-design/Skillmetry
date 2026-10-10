# Security, data minimization and trust

## Present Phase 2A state
- Demo stores name, selected role, self-ratings and assessment attempts **locally in the browser** via Zustand localStorage.
- Configured deployments use real Supabase email/password Auth, SSR cookies, middleware token refresh, server-side claim validation and owner-scoped PostgreSQL rows.
- Authenticated synchronization sends only display name, career, onboarding preferences and claimed proficiency. It never sends local demo assessment attempts as trusted results.
- Demo assessment answers are included in client JavaScript. The tests therefore provide **no production-grade attestation**.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or a legacy anon key) is public project configuration only. NEVER expose a Supabase secret/service-role key or `GEMINI_API_KEY` to browser code.
- The current local browser data is not encrypted by the application. Do not put sensitive information into the prototype.

## Production requirements before real users
1. Sign-in/session and server-side ownership checks are implemented for the Phase 2A profile API. Future private APIs must follow the same pattern.
2. Two-user RLS tests live in `supabase/tests`; they must pass against the local Supabase stack and target migration set before deployment.
3. Move assessment questions/keys and scoring to the server; set attempt controls and audit logging.
4. Implement event-sourced evidence and reviewer approvals, not client-adjustable verified proficiency.
5. Rate-limit AI endpoints, validate JSON schemas, cap text lengths, reject unnecessary personal information, minimize provider retention.
6. Treat pasted job descriptions and third-party repositories as untrusted input; never execute pasted code or follow arbitrary URLs on backend.
7. Consent controls for GitHub OAuth and linked evidence; revocation and deletion flows.
8. Public career passports should be **private by default**, opt-in, minimised, revocable and served through a carefully curated public data view.
9. Prepare clear privacy notice, data export/deletion, retention limits and access logs.
10. Independent security review before hosting real student data.

## Threat model summary
- Prompt injection in job descriptions and repository READMEs.
- Attempt to fabricate quiz results from client-side code.
- Accessing other students' records via guessed IDs.
- Malicious URLs from user-submitted projects.
- Abuse of an LLM endpoint causing excess costs.
- Public sharing of student data without explicit consent.

## Required behavior
If integration is unavailable or uncertain, show "not available" instead of manufacturing an answer, skill verification or placement percentage.

## Phase 2A privilege model

- Students may select, insert and update only their own profile and **claimed** skill rows. Deletion is reserved for a future server-managed account-deletion flow so a client cannot erase rows containing trusted signals.
- Column grants prevent student INSERT/UPDATE access to demonstrated proficiency, evidence confidence and verified status.
- Assessment attempts, mission review status, evidence review decisions, scenario records and job analyses are SELECT-only for their owner until trusted server writers are implemented.
- The application derives every database owner ID from a validated JWT claim. Profile request schemas are strict and reject submitted IDs, assessment scores, demonstrated proficiency, verification and review fields.
- No service-role or secret key is used by the web runtime.
