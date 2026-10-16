# P3–P6 learning workflows: implementation and safe rollout

Date: 2026-10-16. All code changes committed directly to `main`. **Workflow cloud persistence is staged, not deployed.**

## Implemented MVP slices

### P3 — Roadmap and Digital Twin
- Independent `not_started / planned / learning / practiced / project_submitted` activity indicators.
- Roadmap nodes and skill details may display private activity beside (never inside) measured quiz scores.
- Digital Twin has separate learning-activity section and links to study plan, lab and missions.
- No synthetic proficiency, employment-probability or project-derived grading.

### P4 — Weekly study planner
- Deterministic, bounded weekly task drafts using learning goals, study hours, prerequisites and existing server-graded attempts.
- Authenticated owner-scoped `GET/POST/PATCH /api/learning/plan` for task creation and status updates; idempotent stable keys preserve existing progress.
- Supports todo/in-progress/completed/skipped, planner view, resource/practice/assessment links.
- Without hosted migration, the UI displays a clearly labeled nonpersistent plan preview. It must not imply a cloud save.

### P5 — Guided coding practice
- Twelve server-authored, output-prediction, syntax-fill and debugging/SQL-reasoning exercises.
- `GET/POST /api/learning/lab` shares only questions, grades responses server-side and explains mistakes.
- Works as unscored practice before rollout; authenticated private practice attempt history requires migration and the feature flag.
- **No user code is executed**. A real sandboxed compiler/SQL interpreter remains a future phase.

### P6 — Project mission workshop
- Converted curated mission briefs into interactive acceptance checklists, notes, GitHub repository and public HTTPS demo links.
- `GET/PUT /api/learning/missions` persists individual private mission progress when rollout is enabled.
- Server validates mission IDs, deliverable indices, HTTPS links and complete checklists before submission.
- Status is exclusively learner-reported (in_progress/submitted/self_completed). No GitHub scanning, review or project scoring is claimed.

## Private storage / gates

`202610160004_learning_workflows.sql` is an additive migration for:
- `learning_plan_tasks` (owner-only select/insert/update)
- `practice_lab_attempts` (owner-only read, trusted-server insert)
- `mission_work` (owner-only select/insert/update)

All three tables have forced RLS and foreign keys to owner and known skill/mission catalog IDs. Practice and mission evidence are not trusted assessments.

```env
NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED=false
```

**The flag stays false on production until:** every previously staged migration, including P1/P2/Phase D, has been separately approved and applied in order; the new migration passes local pgTAP RLS and two-user staging isolation; the authenticated planner, practice history and mission flows pass browser E2E; and the owner explicitly approves hosted rollout and environment changes.

## Important remaining items

- P3: more advanced topic-level analytics, version-aware topic change visualizations, accessible graph keyboard QA and comprehensive activity history beyond the latest activity window.
- P4: drag ordering, date rescheduling, reminders, continuous calendar, diagnostic-topic-specific plans and weekly summaries.
- P5: authenticated challenge authoring, more tracks/difficulties, hints, bookmarks and a genuinely isolated code runner.
- P6: upload support, GitHub metadata validation (without server-side execution), multi-reviewer rubric workflow, more missions including Full Stack.
- All: production API throttling, dependency/incident reviews, performance/device/browser QA, staging migrations, RLS and full authenticated E2E.

Avoid declaring P3–P6 fully shipped until these gaps and release gates are resolved.
