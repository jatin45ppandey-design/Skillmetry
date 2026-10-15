# Skillmetry — Build Backlog

Priority: P0 is the secure quiz-driven vertical slice. Later work must preserve the rule that only server-graded quizzes produce numerical skill scores.

## P0 — completed in the current milestone

### P0-01: Secure assessment engine

- [x] Remove onboarding skill ratings and locally editable score state.
- [x] Add browser-safe assessment metadata and a server-only versioned question bank.
- [x] Implement authenticated start, submit, and history endpoints with strict Zod schemas.
- [x] Bind sessions to owner, version, ordered question IDs, expiry, and one-time consumption.
- [x] Allow immediate serial retakes while atomically maintaining one active session per owner/assessment/version.
- [x] Support an optional server-only completion-window cap that is disabled by default and enforced atomically when configured.
- [x] Store immutable server-graded attempts through an atomic trusted database function.
- [x] Keep owner ID, score, result counts, pass state, and version out of client-submitted fields.

### P0-02: Assessment-derived Digital Twin

- [x] Use the latest valid completed quiz as each skill's current score.
- [x] Preserve full retake history and show improvement or decline.
- [x] Distinguish `Not Assessed` from a genuine 0% result.
- [x] Show assessment coverage separately from measured performance.
- [x] Update dashboard, twin, roadmap, career explorer, simulator, and supporting workspace copy.
- [x] Keep hypothetical scenario values separate from trusted progress.
- [x] Preserve an explicitly illustrative, isolated anonymous demo.

### P0-03: Security and verification

- [x] Add an additive migration; preserve legacy user data without trusting it.
- [x] Restrict students to read-only access to their own graded results.
- [x] Block direct student session access, score writes, result updates/deletes, and trusted RPC execution.
- [x] Add grading, answer-boundary, missing-vs-zero, latest-result, replay, ownership, and RLS tests.
- [x] Add a disposable-user authenticated end-to-end verification script.
- [x] Pass typecheck, lint, unit tests, local pgTAP tests, and production build.

## Release gates — pending environment or manual confirmation

- [ ] Review and explicitly approve the assessment migration for hosted Supabase.
- [ ] Apply migrations to staging, then rerun cross-account and authenticated flow checks.
- [ ] Confirm production Auth redirects, email confirmation, recovery, and rate limits.
- [ ] Perform desktop, tablet, and mobile visual QA in the supported browser matrix.
- [ ] Add distributed request/IP/account burst controls and monitoring around assessment routes before public release.
- [ ] Complete a compatibility-aware dependency vulnerability review.
- [ ] Document retention, account export/deletion, privacy notice, and incident response before real student data.

## Next product candidates — not part of this milestone

- More assessment domains and a controlled question authoring/review workflow.
- Accessible longitudinal score charts and downloadable private history.
- Saved planning scenarios that remain explicitly hypothetical.
- Consent-based, revocable career passport sharing.

## Explicitly deferred

- Human reviewer portal or evidence approval
- Project, GitHub, resume, or repository scoring
- AI chatbot, AI grading, generated missions, or job parsing
- Placement or hiring probability
- External roadmap resources

Do not expand these areas until the hosted assessment loop is reviewed and operated safely.
