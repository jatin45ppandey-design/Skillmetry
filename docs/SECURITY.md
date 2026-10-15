# Security, data minimization, and trust

## Current trust boundary

- Supabase email/password Auth uses SSR cookies and server-side `getClaims()` validation.
- The client can submit profile presentation fields, an assessment ID, a session ID, and option indexes. It cannot submit trusted identity or grading fields.
- Answer keys live in a `server-only` module and are omitted from public metadata, start responses, and client bundles.
- `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) is required only by trusted assessment route handlers. It must never use a `NEXT_PUBLIC_` name, be returned in logs, or be included in browser code.
- Anonymous demo data lives in browser storage, is labeled illustrative, and is never promoted into authenticated history.
- Legacy claimed proficiency is retained for compatibility but excluded from numerical scoring.

## Authorization model

- The application derives the owner from a validated JWT claim.
- Students may insert/update their own profile fields; they cannot submit numerical skill values.
- Students may select only their own `server_quiz` assessment rows.
- Authenticated and anonymous database roles cannot insert, update, or delete assessment attempts and cannot read/write assessment sessions.
- The security-invoker start and completion functions are executable only by `service_role`. Start/resume serializes concurrent requests per owner/assessment, while completion validates owner, arithmetic, question count, threshold-derived pass state, and completion metadata in one transaction.
- `FORCE ROW LEVEL SECURITY` is enabled for assessment sessions and attempts; explicit grants accompany policies.

## Assessment abuse controls

- Strict Zod schemas reject unknown fields and invalid option indexes.
- Every presented question must be answered exactly once; missing and extra IDs fail.
- Sessions expire after 30 minutes. A retry after completion can only read the original owner-bound result; it cannot regrade or create a duplicate.
- A partial unique index and atomic start function prevent parallel active sessions for the same owner, assessment, and version.
- Immediate serial retakes are allowed by default. An optional completion-window cap uses server-only configuration and transaction-level locking when enabled.

Session uniqueness, expiry, strict payload bounds, and one-result-per-session protection are the current basic abuse safeguards. Add distributed request/IP/account burst controls and observability before a public release.

## Executable security evidence

`database/supabase/tests/profile_rls.test.sql` and `database/supabase/tests/assessment_rls.test.sql` prove locally that:

- Alice cannot read Bob's profile or graded results.
- Alice cannot modify Bob's records.
- A student cannot create, alter, delete, or duplicate a graded attempt.
- A student cannot inspect sessions or invoke either trusted assessment RPC.
- Legacy claimed-proficiency writes are denied.

Unit tests also enforce answer-key isolation and reject forged/malformed submission shapes. `scripts/verify-assessment-flow.mjs` exercises the real app routes with a disposable local user and removes that user afterward.

## Remaining production requirements

1. Review and explicitly approve the additive migration before hosted apply.
2. Store the service-role key in the deployment provider's server-only secret store and rotate it if exposure is suspected.
3. Run the full suite against staging and independently review SQL grants/RLS.
4. Add distributed request rate limiting, security monitoring, and safe audit events.
5. Configure trusted Auth redirect URLs, outbound email, recovery, MFA policy if required, and abuse thresholds.
6. Provide privacy, retention, export, and deletion controls before real student data.
7. Conduct an independent application and database security review.

## Required failure behavior

If Supabase, authentication, or secure grading configuration is unavailable, the UI reports that state and does not fabricate a score. Demo data remains clearly identified as illustrative.
