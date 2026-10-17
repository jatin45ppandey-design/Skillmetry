# Skillmetry Admin Studio — Phase 4: Mission & Project Builder

Tracking: https://github.com/jatin45ppandey-design/Skillmetry/issues/20

**Development-only, not deployed.** Phases 1–3 are merged. This Phase 4 branch starts the safe mission-authoring contract; the editor, SQL migration, publishing API and student integration are still to be implemented.

## Intent

Allow authorized owners/editors to draft practical missions for the four canonical careers without a source-code edit. Owner alone may publish. Reviewers can view but not write. Students should see only published missions plus the existing curated fallback, and must never see admin drafts.

## Known architecture and constraints

- Current curated missions are defined in `shared/data/catalog.ts`, with 10 existing IDs.
- Student `/missions` filters curated missions by career and manages checklists using positional indices.
- Server-side `normalizeMissionWork` checks against the current static catalog; currently, a dynamically authored mission would fail submission.
- `mission_work.mission_id` references `public.missions(id)`. A Phase 4 publish action must therefore transactionally add a published mission to this canonical database table before student work can be saved.
- Missions are *learner-reported work*; submissions must not write graded assessment results, verified streak events or proficiency scores.
- Admin Studio's role verification, revision history and optimistic concurrency are established in the merged 001–003 admin migrations.

## Delivery milestones

### P4.1 — Contract & compatibility (started on feature branch)
- Strict `adminMissionIdSchema` with a reserved `cms-` namespace, rejecting collision with curated mission IDs.
- Zod validation for canonical career-to-skill mapping, mission description, title, estimated time and no more than 12 distinct deliverables.
- Strict payload shape: no trusted scores, simulated gains, browser-supplied editor identity or arbitrary HTML.

### P4.2 — Editor
- Add tab `Missions & Projects` and authoring form with draft preview, validation, unsaved warning and role-appropriate controls.
- Preview should not leak into student routes before publication.

### P4.3 — Publishing
- Add `202610170004_admin_missions.sql` with service-role-only tables, revisions and transactional RPC.
- Existing career and skill identities must remain immutable for a published mission.
- Once students may have saved positional checklist indices, a published checklist must stay frozen; structural edits create a new mission ID instead of silently invalidating prior work.
- Owner-only publication and revision conflict checks both in SQL and server API; same-origin enforcement on write API.
- Public content route selects only published content and sends no draft/revision fields.
- Publishing adds the mission metadata to `public.missions` transactionally to satisfy existing foreign keys.

### P4.4 — Learner flow
- Fetch only published missions; preserve existing curated missions as a fallback and avoid duplicates.
- Normalize dynamic published mission submissions server-side, including checklist length and evidence URL validation; do not trust a browser-supplied checklist.
- Student submissions remain owner-scoped and learner-reported, not verified.
- Stable ID and checklist semantics must preserve old `mission_work`.

### P4.5 — Verification & release
- Zod/unit tests, pgTAP permissions/RPC, authenticated two-user E2E and public-route smoke.
- Typecheck, lint, unit tests, Next production build and both existing GitHub workflows green on the final PR head.
- Manual owner/editor/reviewer/student flows, mobile/keyboard/network/accessibility QA.
- No hosted migration, account configuration, Vercel deployment, AI keys or feature flag activation without separate approval.

## Intentionally deferred

PDF/media uploads, rich text, mission grading, AI evidence verification, question-bank authoring, progress analytics, automated approval flows and production activation.
