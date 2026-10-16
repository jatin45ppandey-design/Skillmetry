# Skillmetry — FINAL COMPLETION CONTRACT (single remaining bucket)

Status: **NOT RELEASE-COMPLETE**. This document is the one authoritative, frozen remaining-scope checklist for Skillmetry's original idea. Do not create Phase 3 / Phase 4 or silently expand the product scope. New ideas, visual experiments, or speculative scoring features are POST-LAUNCH and require a separate owner decision.

Last grounded against GitHub main \`bf95124\`, Phase 1 draft PR #9 and Phase 2 draft PR #10 on 2026-10-16.
Integrated candidate: \`feature/final-skillmetry-acceptance\`, which includes the actual Phase 1 password recovery files and Phase 2 feature branch code. It is NOT merged to main, hosted, or declared complete.

## Frozen user journey (the acceptance target)

A real student can **create/verify account → choose one or more learning goals → assess any of the 18 catalog skills with trusted, versioned scoring → see evidence-grounded topic weaknesses and next actions → learn/practice without changing official scores → reassess → see authentic progress in Roadmap/Twin → complete a mission and submit evidence → inspect a connected GitHub project with honest provenance → optionally request AI mission/job guidance → export/share/revoke a privacy-controlled Passport → control/delete personal data**. Anonymous demo remains demonstrative and never earns a score.

### Non-negotiable constraints
- Approved Learning Chapters V1 layout remains intact. No unexplained redesign.
- Only secure server-graded quizzes can create numeric skill performance. Unknown ≠ measured 0%; practice, AI, GitHub stars, and self-reported project evidence NEVER modify scores.
- No answer keys or privileged Supabase credentials in the browser.
- Existing \`2026.1\`, \`2026.2\` and \`2026.3\` history, RLS, retake/concurrency and email/password accounts preserved.
- No destructive Git operations, production resets, automatic hosted migrations, deployments or real-user account deletion.
- Never call an unreviewed question set "educator reviewed" or an unverified GitHub project "verified student work".
- Complete means **implemented + passing source/DB tests + authenticated real-user E2E in isolated staging + owner-approved production acceptance**. "UI exists" is not enough.

## THE ONE REMAINING BUCKET

- [ ] **C01 — One release candidate and clean integration.** Phase 1 and Phase 2 changes combined and CI validated; review no conflicts with main, regenerate lockfiles only if required, resolve security findings, then merge via explicit owner approval. No duplicate PR features / missing password-reset routes. Acceptance: main has one integrated, regression-tested implementation with green tests/build and no unrelated UI regressions.
- [ ] **C02 — Full, reviewed 18-skill assessment coverage.** Currently just 4 assessable (Python, SQL, JavaScript, HTML), although 18 canonical skills exist. Add **Math & Statistics, CSS, Data Processing, ML Fundamentals, TypeScript, React, Node.js, Model Evaluation, REST APIs, Docker, Deployment, Accessibility, Testing, Authentication**. Each needs a versioned topic/difficulty blueprint, technically correct server-only questions and explanations, separate unscored practice, browser-safe metadata, trusted selection and grading, additive schema compatibility, content validation and qualified **human editorial review**. Acceptance: 18/18 available in the selected version, full start/submit/review/practice/retake for each in staged Auth/RLS environments, immutable historical attempts readable and no answer-key leaks. Do not generate repetitive/ambiguous filler questions merely to reach a count. Ideally follow 2026.3 format (30-question bank / 15-question balanced attempts) and define content-review ownership.
- [ ] **C03 — Phase D diagnostic and learning loop activated.** Review/apply \`202610160001_phase_d_diagnostics.sql\` to disposable staging, then approved isolated hosted staging; verify topic evidence, explanation quality, unscored practice, reset/resume, RLS, 0% vs unknown, Roadmap / Digital Twin update. Retain legacy default until migration & tests pass. Acceptance: all 18 skills have functional diagnostic and practice-to-reassessment loops, with browser/mobile evidence and documented version fallback.
- [ ] **C04 — Complete practical mission/evidence and GitHub authenticity.** Phase 2 already has private drafts, immutable self-reported submissions, evidence journal and public GitHub metadata read-only inspector. Finish the opted-in GitHub account connection / ownership consent, project evidence provenance and reviewer workflow, with review state distinctly separated from scores. Explicitly identify what is merely self-reported or cannot be verified. Acceptance: project draft→submit→review→record status→revoke connected access works with two users; no false proficiency; user can disconnect GitHub.
- [ ] **C05 — Make AI features real and bounded.** Existing Gemini mission/job endpoints and deterministic fallback are code-complete but disabled. Validate quote grounding, prompt-injection resistance, schema, quotas, privacy disclosures, refusal/error/loading states and provider cost/abuse limits. Owner provides authorized Gemini credentials/billing and approves staging activation; do not make live calls before authorization. Acceptance: mission and job requests work with real consented staging accounts, deterministic fallback works without AI, and no fake grades, hiring predictions or training-use claims.
- [ ] **C06 — Complete authentication, Passport and privacy.** Finish real-email recovery and OAuth provider callback testing, revocable 30-day public Passport links, scoped private learning export, project/AI data consent and retention, account-deletion cascade including OAuth-only / Storage cases, CSRF/abuse review, monitoring, and accessible feedback states. Account deletion currently default-off. Acceptance: tested own-data export, link rotation/revocation/expiry, cross-user isolation, real email callback, assisted/self-service deletion paths as supported; no unauthorized exposure or irreversible actions during testing except disposable accounts.
- [ ] **C07 — Real isolated staging and release engineering.** Existing Vercel connection had ZERO linked Skillmetry projects at last check; no authenticated separate hosted Supabase staging project available. Owner must identify or explicitly authorize creation of isolated Vercel + Supabase staging targets and provider billing/credentials. Run migration review in order: \`202610160001\` (Phase D), \`202610160002\` (missions), \`202610160003\` (AI usage), \`202610160004\` (Passport), \`202610160005\` (feedback), plus new assessment migrations. GitHub Actions disposable pgTAP already passes; that is NOT hosted staging. Acceptance: HTTPS staging URL, correct Supabase Auth redirect/email setup, safe environment variables and secrets, DB backup/recovery plan, observability, rate limits, dependency/security triage, and explicit production rollout/rollback checklist.
- [ ] **C08 — Final product acceptance and launch.** Full mobile/desktop/keyboard/screen-reader QA, real authenticated A/B user journey, anonymous/demo boundaries, resource URL reviews, content QA, performance, load/abuse and accessibility, pilot with consented actual learners, bug triage, owner acceptance; then controlled production deployment with monitoring. Acceptance: no open P0/P1 launch defects, release checklist signed, \`main\` deployed and all original journey steps verifiably functional for real users. Pilot recruitment and user findings cannot be fabricated.

## Execution contract — do not reset or re-plan

Order: **C01 → C02 → C03 → C04/C05/C06 → C07 → C08**. Source implementation and disposable verification can proceed without account changes; hosted migrations, credentials/billing, external OAuth, production deployment and deletion of even a disposable hosted user require their specific owner authorization and isolated target. Keep going with independent code work if one external gate is blocked. Do not call any checkbox done until it meets its stated acceptance.

Every development report must state only:
1. Completion IDs newly satisfied with evidence links.
2. Test results and actual target environment.
3. Precise blockers requiring owner actions.
4. What remains from **this same list**, not a new phase list.

## Final go/no-go

\`npm run verify:completion\` is an **intentionally strict source-level precheck**. It reports current canonical/assessable coverage and existing required files; it does not prove hosted staging or human content review. It must NOT be treated as a replacement for the C01–C08 acceptance criteria.

Release status = **DONE** only if all eight checkboxes are verified and the end-to-end journey is confirmed in production. Until then write **NOT COMPLETE**.