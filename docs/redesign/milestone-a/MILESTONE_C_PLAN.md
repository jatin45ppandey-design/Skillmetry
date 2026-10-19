# Milestone C Plan — Complete Product Surface

## Goal

Apply the approved Direction A system to the remaining product in dependency order, preserving trusted evidence, staged-feature, privacy, and owner-only boundaries.

Milestone C starts only after Milestone B is approved and stable.

## Workstreams and order

### C1. Onboarding, authentication, and account states

Routes: `/onboarding`, `/auth/*`, `/account`, `/settings`.

- Align onboarding with the five-area model.
- Explain local/illustrative versus private/synced data before sign-in.
- Preserve provider availability and server-side callback rules.
- Cover recovery, unavailable provider, expired link, offline, and sync-error states.

### C2. Assessment and result experience

Routes: `/assessments` and related result/review flows.

- Focused reading surface and one-question navigation.
- Clear start/resume/expired/submitting/replayed states.
- Result provenance and measured-zero treatment.
- Diagnostic/topic review appears only when enabled.
- Preserve all server-only grading and immutable-history contracts.

### C3. My Path

Routes: `/careers`, `/roadmap`.

- Merge the mental model without removing routes.
- Use a readable staged path as default.
- Keep React Flow only as optional relationship exploration if it continues to add value.
- Expose prerequisites, assessment availability, and honest unknown states.

### C4. Progress

Routes: `/twin` and assessment history.

- Create Overview, Skills, and History subviews.
- Reduce nested panels and place evidence provenance first.
- Keep learning activity and scenarios separate.
- Verify anonymous illustrative, signed-in empty, measured zero, multiple attempts, and legacy-untrusted data.

### C5. Learn

Routes: `/resources`, `/courses`.

- Unify resource/course discovery under Learn.
- Retain published-content and staged progress behavior.
- Improve loading, empty, error, pagination, search, and deep-link states.
- Keep “learning activity is not scored” visible but non-repetitive.

### C6. Practice and projects

Routes: `/practice`, `/lab`, `/missions`.

- Group challenges by skill/topic and surface one continuation.
- Correct answer-control association and keyboard behavior.
- Distinguish unscored practice from assessments.
- Present mission outcome, difficulty, expected evidence, and save availability.
- Do not add arbitrary code execution.

### C7. Planning and advanced guidance

Routes: `/planner`, `/tutor`, `/jobs`, `/simulator`.

- Planner: group by day/priority and distinguish preview from saved plan.
- Tutor: curated guidance first; explicit consent and availability before any external AI request.
- Jobs: one authoritative pending state; retain canonical deterministic parsing and “not a hiring prediction” language.
- Simulator: preserve hypothetical/non-persistent framing and exit/reset.

### C8. Passport and sharing

Routes: `/passport`, `/passport/share/[token]`.

- Prioritize private preview/export.
- Render public sharing controls only when both client/server gates are enabled.
- Explain selected skills, snapshot, expiry, revocation, and unavailable state.
- Test token privacy and cross-user boundaries only in an approved environment.

### C9. Admin Studio

Route: `/admin` and admin APIs.

- Apply visual tokens without changing fixed page structure or editorial workflows.
- Keep owner-only server authorization and default-off feature gates.
- Preserve revisions, approvals, history, and safe unavailable states.
- Never expose admin membership or controls through student UI.

### C10. System cleanup and release verification

- Remove superseded CSS one owned surface at a time.
- Consolidate duplicate selectors and media queries.
- Confirm dead files before deletion.
- Add per-route metadata where missing.
- Run full typecheck, lint, tests, build, local browser matrix, and applicable security checks.
- Run authenticated, two-user, and staged-feature tests only with approved credentials/environment.
- Produce a release handoff that distinguishes source validation, local browser validation, staging validation, and hosted verification.

## Cross-cutting test matrix

For each route family, verify:

- desktop, tablet, and 320/390 px mobile;
- keyboard and visible focus;
- reduced motion and 200% zoom;
- loading, empty, error, retry, offline, and long-content states;
- anonymous illustrative, unauthenticated, authenticated/no-data, and authenticated/data states;
- default-off and enabled feature flags where an approved test environment exists;
- not assessed versus measured zero;
- no horizontal overflow or fixed-navigation overlap;
- no console errors or hydration warnings.

## Non-negotiable invariants

- No client-supplied score, owner ID, pass state, or assessment version becomes trusted.
- No learning activity changes assessed proficiency.
- No scenario persists as actual progress.
- No unassessed skill is rendered as zero.
- No demo data syncs into an account.
- No server secret is exposed to browser code.
- No admin access is authorized by a client-only username check.
- No staged feature is described as hosted/active without verified evidence.

## Definition of complete

- All route families use the approved Direction A system without becoming visually identical.
- The five-area IA is consistent across desktop and mobile.
- Primary flows can be completed without encountering unexplained preview/disabled states.
- Every product claim is traceable to an existing capability or explicitly illustrative content.
- Verification results name the environment and evidence level.
- Owner approval is obtained before migration, hosted flag, deployment, commit, push, or merge actions.
