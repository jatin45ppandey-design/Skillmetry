# P2 assessment expansion — code handoff (2026-10-16)

This is **code only**, committed to `main`. No hosted Supabase migration, feature flag change or deployment is performed.

## Added
- New 2026.2 ten-question server-only assessment banks: CSS, TypeScript, React, Node.js, REST APIs.
- Browser metadata gated by `NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED=false` by default.
- Version-aware guard: original four skills support 2026.3 diagnostics; new five remain 2026.2-only.
- Additive `202610160002_expand_foundational_assessments.sql` updating the trusted service-only start/submit RPC allowlists and skill mappings.
- Unit tests for question count, unique IDs, answer boundary, grading and version handling.

## Required rollout
1. Obtain explicit owner approval for migrations; check pending 202610160001 Phase D first.
2. Apply migrations to disposable staging in filename order. Never reset hosted data.
3. Run typecheck, lint, unit tests, build and pgTAP RLS tests.
4. Run authenticated start/submit/retake across all five new IDs; verify 0% remains measured, duplicate writes are idempotent, and cross-user writes are rejected.
5. Review every new question and distractor with subject-matter editors before publishing.
6. Obtain separate approval before applying hosted SQL and enabling NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED=true.

## Still pending
- Educator-reviewed 2026.3 diagnostic question sets and practice for new domains.
- Assessments for remaining canonical skills; reviewed authoring console.
- Account/IP distributed rate limiting, monitoring, privacy controls, E2E browser QA and independent security review.
- Production functionality remains unchanged with the flag off.
