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

- [x] Review and explicitly approve the assessment migration chain for hosted Supabase (completed 2026-10-15).
- [x] Rehearse all migrations and security tests in disposable staging and verify hosted authenticated assessment flows (completed 2026-10-15).
- [ ] Confirm production Auth redirects, email confirmation, recovery, and rate limits.
- [ ] Perform desktop, tablet, and mobile visual QA in the supported browser matrix.
- [ ] Add distributed request/IP/account burst controls and monitoring around assessment routes before public release.
- [ ] Complete a compatibility-aware dependency vulnerability review.
- [ ] Document retention, account export/deletion, privacy notice, and incident response before real student data.

## Phase B3 — external learning resources enhancement (implemented 2026-10-15)

- [x] Preserve the initial 50 catalog resources and curate eleven `awesome-roadmaps` discoveries.
- [x] Distinguish roadmaps from tutorials, documentation, practice, and structured courses.
- [x] Respect career/skill/tool relevance, trustworthy score evidence, and NOW/NEXT/LATER priorities.
- [x] Prevent mismatched-career and unavailable resource recommendations; balance broad paths with actionable learning material.
- [x] Provide career roadmap deep links, URL-driven filters, attribution, and filter reset.
- [x] Add catalog/navigation/selection regression coverage and document curation decisions.
- [ ] Manual browser/device walkthrough and live external-link revalidation before public launch.

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

The hosted assessment loop was verified on 2026-10-15. Future resource and advanced-assessment phases may proceed independently of the remaining public-launch security and privacy gates.

## Phase D — diagnostic improvements (code implemented; cloud rollout pending)

- [x] D1: versioned 2026.3 question bank (30 questions each for Python, SQL, JavaScript, HTML) with five tagged topics and per-question difficulty metadata.
- [x] D1: random 15-item blueprint with topic/tier coverage, score precision, old version compatibility, and tests.
- [x] D2: atomic additive owner-scoped question-level evidence migration and deterministic diagnostic insights with insufficient-evidence states.
- [x] D2: per-topic targeted resource matching and independently authored unscored practice set.
- [x] D3: one-question assessment navigation, flag/review palette, optional local answer draft restoration and timer.
- [x] D3: topic breakdown, post-submission answer review, practice/assessment navigation and Digital Twin diagnostic insight surface.
- [x] D2: expand practice to five independently authored exercises per topic; add question-specific explanation coverage.
- [x] D2: directional topic-level comparison between current and previous version-2026.3 diagnostic attempts; missing comparison remains unknown.
- [ ] Hosted/staging: owner-approved migration; run pgTAP and authenticated end-to-end review test.
- [ ] D3: manual desktop/mobile/accessibility/browser QA and logged-in multi-user isolation walkthrough.

**Default-off until migration approval:** `NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED`. See `docs/PHASE_D_IMPLEMENTATION.md`.

## P3–P6 core MVP implementation (2026-10-16, staged)

- [x] P3: separate learning activity from immutable quiz scores; show in Roadmap and Digital Twin.
- [x] P4: deterministic weekly study plan, authenticated task API and labeled preview.
- [x] P5: guided coding/SQL practice with server-only answers and optional private attempt history.
- [x] P6: curated mission checklists, notes, HTTPS evidence links and self-reported submission flow.
- [x] Add migration for private owner-scoped workflow tables, contract/unit tests and pgTAP isolation cases.
- [ ] Obtain explicit approval, rehearse and apply workflow migration in staging/hosted projects.
- [ ] Test two-user, cross-browser and mobile E2E for all workflow routes; enable production feature flag.
- [ ] Finish advanced P3 analytics, P4 reminders/rescheduling, P5 isolated code runner, P6 external evidence verification.
- [ ] Expand catalog missions and content editorial coverage, preserving scoring trust boundaries.

## P7–P10 core implementation (2026-10-16)

- [x] P7: deterministic canonical job requirement extraction with measured-vs-unassessed score evidence and private opt-in saved role summaries.
- [x] P8: guided tutor page with existing curated resources, authenticated opt-in AI endpoint, strict limits and external provider disabled by default.
- [x] P9: printable private Career Passport; stage 7-day expiring, revocable, chosen-skill public shares with 256-bit opaque tokens and server-side hash lookup.
- [x] P9: add immutable share snapshot controls and multi-user pgTAP RLS test cases for staging.
- [x] P10: browser security headers, private route robots rules, CI static release checks, token-gated database readiness probe and incident runbook.
- [ ] P7: save full job comparisons with explicit retention controls, external opportunity verification and wider semantic requirement coverage.
- [ ] P8: production provider/account enablement, topic-diagnostic context, human AI evaluation, cost and observability controls.
- [ ] P9: approval and staged/hosted application of migration `202610160005_passport_sharing.sql`; manual consent, link expiry and cross-user E2E.
- [ ] P10: full production browser/device/accessibility/performance QA; security and dependency review; incident alerting/backup/restore; account deletion and legally reviewed notices.
- [ ] All: staged migrations 001–005 remain pending explicit owner approval; no hosted writes or deployment were performed.

## Backend-first UX rebuild preparation: streaks and release safety (staged)

- [x] Define trusted streak sources: server-graded quizzes and coding lab attempts only.
- [x] Add owner-scoped SQL streak calculation, API contract, IANA local-day grouping, yesterday grace, tests, and default-off flag.
- [x] Correct malformed dollar-quote delimiters in un-applied Passport migration 005.
- [ ] Complete local PostgreSQL migration rehearsal and executable pgTAP test of streaks and all existing RLS policies.
- [ ] Audit plan/mission integrity, API authorization, exports, auth recovery and production rate limits.
- [ ] Obtain explicit approval before hosted migrations, enabling feature flags or changing production secrets.
- [ ] Build streak UI as part of subsequent frontend redesign, after backend staging approval.
