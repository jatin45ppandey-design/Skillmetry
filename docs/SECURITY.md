# Security, data minimization and trust

## Present starter state
- Demo stores name, selected role, self-ratings and assessment attempts **locally in the browser** via Zustand localStorage.
- No real account login, Supabase sync, AI provider requests or external job parsing is active.
- Demo assessment answers are included in client JavaScript. The tests therefore provide **no production-grade attestation**.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is an intended public client configuration only; NEVER expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` to browser code.
- The current local browser data is not encrypted by the application. Do not put sensitive information into the prototype.

## Production requirements before real users
1. Sign-in/session and server-side ownership checks on every user API.
2. Supabase RLS tested with two authenticated users (including edge cases for inserts, updates, joins and public passports).
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
