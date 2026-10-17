# Product Phases 1–5: staged implementation and acceptance gates

This work is based on the unmerged Phase 0 UI/UX branch. **Do not merge it into main or enable the two feature gates until the owner has visually approved Phase 0 and independently approved any hosted migration/role/test changes.** The new source branch is `feat/product-phases-1-5-staged` and review PR #28 targets the Phase 0 branch, not main.

## Delivered source implementations

| Original product phase | Added this pass | Existing supporting systems | Still gated / unresolved |
|---|---|---|---|
| 1. End-to-end reliability | Origin-protected, user-scoped lesson API with immutable course/owner keys and current published-revision validation. New forced-RLS migration staged. CI guard tests. | Server-graded assessments, OAuth, status/loading, account export and saved plan/lab APIs. | Hosted migration, flag, RLS rehearsal, rate/burst checks, authenticated browser E2E, backup/restore evidence. |
| 2. Personalized learning experience | Dashboard prefers real authenticated `/api/learning/overview` next action; course shows own saved lesson activity only when actually enabled and lets users resume. | Career goals, trusted Digital Twin, personalized resources, planner. | Verified cross-account course activity, saved state and course version migration; broader long-term planner feature rollout. |
| 3. Learn → Practice → Reassess | Published course lessons link to `/lab` practice and relevant canonical /assessments; progress stays self-reported and revision-aware. | Diagnostics, server-side quiz grade/history, curated resources. | Hosted progress rollout, version-specific visual E2E and actual students' progress records. |
| 4. Mature Admin CMS | Private metadata-only inventory across 5 modules, staged review requests/independent reviewer decisions, digest-bound approvals and optional fail-closed publish guards on all five API routes. Editors show review status. | Owner/editor/reviewer RBAC, draft revision history, strict authoring schemas. | Enable and rehearse new approval migration; review roles/permissions, rollback tooling, analytics and advanced media authoring have not been proven production-ready. |
| 5. Real student feedback | Voluntary seven-task study form, no telemetry, local participant-controlled JSON export; manual study protocol. | Existing UI QA checklist and test infrastructure. | Recruit **5–10 consenting real students**, observe tasks, analyze real anonymized findings, iterate; zero real sessions have been claimed. |

## Safety and rollout switches

Both flags are **off by default**, and no environment file is changed here:

- `SKILLMETRY_COURSE_PROGRESS_ENABLED=true` enables `/api/learning/course-progress` only when the existing Admin Studio and server credential readiness gates are satisfied.
- `SKILLMETRY_EDITORIAL_APPROVAL_ENABLED=true` requires reviewer-approved **saved revision and exact canonical payload digest** before any of the five Admin PUT publish operations. Reviewer decisions require a distinct authorized reviewer identity, matching saved revision and same-origin protections.
- Neither feature should be enabled until its matching additive SQL migration under `database/supabase/migrations/20261018000*.sql` is separately approved, rehearsed on a disposable project, and applied to the intended environment.
- **Do not** re-create or reset Supabase project `qepaepqrhgrejzarqlrd`, rotate OAuth, change admin ownership, touch any SafeRelay repository, connect paid services, deploy to production or alter `frontend/.env.local` as a side effect.

## Safe release order — requires separate owner permission

1. Review and visually sign off draft UI PR #27, including 1366×768, mobile 390/320, signed-in/guest, Admin five modules.
2. Review staged product PR #28 and GitHub CI: typecheck, lint, Vitest, Next production build, backend safety/source gates.
3. On a **disposable** test Supabase project, apply both additive migrations using the test harness. Explicitly verify forced RLS: anon cannot read/write, authenticated user sees only own course progress, service-role only for editorial review metadata.
4. Use two distinct already-authorized test Admin accounts (editor/requester and reviewer/approver), plus Owner. Verify self-review denied; changed revision and changed payload denied; owner-only publication and normal legacy path when the feature gate is off.
5. Run sign-in/out, onboarding, baseline quiz, course choose → lesson studied → practice → reassess. Verify only quiz results affect Digital Twin; activities never create score.
6. Test 409 concurrent edits, stale version, wrong lesson ID, cross-account reads/writes, missing Origin, expired cookies, offline, 503 service unavailable, retry.
7. Independently approve and enable release flags **only after** hosted migrations and rollback/restore plans; never infer permission from pushing source code.
8. Recruit 5–10 consenting students and conduct the tasks below; log observations without emails, IDs, screenshots of account secrets or other personal data. Use the consented local JSON exports only with permission.
9. Record actual completion and problem rates, fix supported issues, rerun CI/browser testing, request merge approval. **Do not invent participant counts or task metrics.**

## Manual usability study (each participant)

Allow students to use their own account; do not request passwords. For each task, record whether they completed it, difficulty (1–5), time only if actually measured, and short notes.

1. Choose a learning direction or individual skill.
2. Locate a clear next action on the Dashboard and explain why it is recommended.
3. Find a course, open its lesson, and understand whether activity was actually saved.
4. Open the relevant learning/practice activity and see server feedback.
5. Find a suitable trusted reassessment and distinguish it from practice.
6. Identify what Account “cloud-connected”, demo and “saved profile” mean.
7. For **authorized Admin testers only**, review draft → request approval → reviewer decision → owner publish, without revealing question answers to learners.

Afterward ask: “Which step was hardest, and why?”, “Where did you expect the Save/Continue control?”, “Did anything look like a grade when it wasn't?”, and “Was keyboard/mobile use comfortable?”

## Current evidence

- Source code and automated contract tests: tracked in draft PR #28.
- Real browser test results: **pending**.
- Applied hosted database migrations: **none in this phase**.
- Real student task results: **pending; do not claim 5–10 tested**.
- Production release / `main` merge: **not authorized**.

Full Phase 0 browser matrix is in `docs/UI_UX_PHASE5_7_QA.md`.
