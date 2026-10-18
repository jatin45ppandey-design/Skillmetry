# Skillmetry product hardening and acceptance plan

This is a code-and-product validation checklist. It does not authorize deployment, hosted database changes, migrations, OAuth changes, or feature-flag activation.

## Core student journey

A first-time student should be able to complete this path without exploring every workspace:

1. Sign in or enter the anonymous demo.
2. Select a target career.
3. Take an assessment that is explicitly available for that career.
4. Read measured results and distinguish assessed skills from unknown skills.
5. Follow one recommended learning action.
6. Return to reassess and compare immutable attempts.

Keep advanced tools available, but make this sequence the primary path. Never imply that a quiz result represents complete real-world professional ability.

## Code-level release checks

- [ ] Source CI: lint, typecheck, unit tests, production build and static release checks.
- [ ] Isolated database workflow: migrations, pgTAP RLS checks, authenticated two-user API tests and cleanup.
- [ ] Readiness probe fails closed when an enabled feature's backing table is missing.
- [ ] Feature flags remain disabled until the matching migration and isolated authorization tests have passed.
- [ ] Rate limiting remains disabled until the burst-limit migration is applied to a reviewed environment; do not enable it just to make a check green.
- [ ] No client response exposes answer keys, trusted scores, secrets or another user's records.
- [ ] Unknown job-description requirements remain separate from canonical skill matches and measured evidence.

## Manual acceptance study (5–10 students)

Run only in an approved test environment with test accounts and synthetic profile data.

Ask each participant to:
- choose a career and explain what they expect to measure;
- find and complete an available assessment;
- explain the difference between an assessed skill and an unassessed skill;
- find the next recommended learning action;
- locate their prior attempt after reassessment;
- use the flow on a phone and on a desktop where possible.

Record task completion, time-to-first-assessment, wrong turns, confusing labels, keyboard/focus issues and participant feedback. Do not collect passwords, production account data or unnecessary personal information.

Suggested acceptance criteria:
- at least 8/10 participants can reach an assessment without facilitator help;
- at least 8/10 can correctly explain that quiz scores are evidence of assessed topics, not a complete employability rating;
- no participant can view another test account's profile, attempt or saved learning activity;
- keyboard-only navigation and narrow mobile layouts remain usable for the core journey.

Treat these as proposed targets, not results. Record actual outcomes before claiming user validation.

## Deliberately excluded from this work

- Vercel or production deployment changes;
- hosted Supabase migrations or data writes;
- production feature-flag activation;
- OAuth provider or secret changes;
- any claim of production readiness before browser, accessibility and user acceptance are complete.
