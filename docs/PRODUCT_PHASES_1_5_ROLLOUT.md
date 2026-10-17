# Skillmetry — five product development phases (staged implementation)

**Branch**: `feat/product-phases-1-5-staged` (starts from the unmerged UI/UX PR #27 head).

## Important distinction
The source already included secure login, server-graded assessments, a read-only personalized next-action API, gated weekly tasks, gated lesson-progress saving, Admin Studio versioned drafts and editorial-review APIs, and an opt-in browser-only research form. These are foundations, **not proof that the hosted feature rollout has occurred**.

This branch closes practical source integration gaps and adds tests. The existing live Supabase project, environment, OAuth, student assessment history, admin roles, Vercel deployments and SafeRelay have **not** been changed. Real user trials have **not** been performed.

## Phase 1 — reliability and safety
- Preserve authenticated ownership, same-origin writes, server-only answer keys, rate limits and existing assessment history.
- For saved lessons, return up to 500 activity rows plus a `truncated` signal after requesting 501; never claim the displayed count is complete if older records exist.
- Keep optional learning features disabled until their already-staged database migrations, RBAC/RLS and rollout gates are approved and tested.
- Add tests protecting cross-version lesson evidence and editorial inventory handling of numeric revisions versus immutable `cms.N` assessment versions.
- **Acceptance pending:** fresh/returning-user browser login; offline/retry; migration rehearsal in isolated DB; backup/recovery; full RLS review and real-owner/editor smoke tests.

## Phase 2 — personalized dashboard and resume
- Continue one *published*, authenticated learner course using genuinely saved lesson activity, prioritizing the most recently studied course.
- Current published revision must match the saved activity revision; no sample data, hypothetical scores, old versions, or incomplete (truncated) history may create a resume suggestion.
- Saved lesson activity is self-reported; only server-graded quiz attempts feed assessed proficiency.
- If learning progress feature isn't enabled, the dashboard retains the earlier evidence-first next useful step instead of displaying pretend saved progress.
- **Acceptance pending:** signed-in end-to-end browser save → sign out/in → resume, and account isolation.

## Phase 3 — Learn → Practice → Reassess
- Dashboard resume link opens the matching published course with an accessible course-selection UI.
- Course → Coding Lab link includes the actual canonical skill, and Lab supports deep-linking to that skill when it has available exercises.
- Assessment results → skill-specific Lab, Lab → skill-specific verified assessment (when a supported assessment exists), plus learning resource links.
- Searching/changing Lab exercises clears stale checked-answer feedback and prevents double submit. These are learning activities, not grade changes.
- **Acceptance pending:** learner journey browser test with an actually published course and authorized assessment.

## Phase 4 — advanced Admin CMS
- Admin inventory counts actual unreviewed revisions correctly, including question-bank published versions stored as strings `cms.N` rather than numeric revision fields.
- Review queue can filter Pending / Approved / Changes requested; shows current response status and preserves independent reviewer role, no self-approval, draft digests, safe version history and owner-only publication.
- Existing rich course/mission/question editing and editorial revision APIs remain gated. No test content published to students.
- **Acceptance pending:** actual independent reviewer/editor/owner role tests, secure server-side approval rollout, immutable rollback policy, content analytics and controlled migrations. Rollback controls must not be represented as implemented without a safe DB-backed API.

## Phase 5 — real student research
- The existing opt-in `/feedback` interface allows a consenting student to record task completion/difficulty and download a local JSON export; it never sends analytics or personal information automatically.
- Locally analyze only explicitly shared exports with:
  ```bash
  node scripts/analyze-usability-feedback.mjs student1.json student2.json student3.json
  ```
- Aggregates are task completion / difficulty only. Text notes (which might inadvertently include personal information) are never printed. The script has no network calls and rejects oversized or symlinked inputs.
- An anonymous export is **not** proof of a unique participant. Report `exportsAnalyzed` rather than participant count. No invented success rates or findings.
- **Acceptance pending:** recruit 5–10 actual consenting students, explain voluntary participation, avoid sensitive information, collect/share approved exports, observe desktop/mobile/keyboard tasks and prioritize empirically found issues. Separate student testing from Admin role testing.

## Quick validation
```bash
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
```
CI should also pass the existing static privacy, release safety and public-route HTTP smoke gates. These are source/regression checks, *not* proof of feature availability on the live hosted project.

## Safe rollout order (requires separate explicit operational approval)
1. Merge or otherwise establish a reviewed UI/UX baseline (PR #27) **before** this dependent product PR.
2. Rehearse staged migrations and RLS in a disposable isolated Supabase development database.
3. Complete database backups, migration rollback plan, and safety/security review.
4. Only then approve controlled hosted migration and feature flag changes (lesson progress, learning workflows, editorial reviews). No automatically authorized hosting change is implied by source code commits.
5. Run authenticated owner/student tests; collect opt-in feedback; accept browser visuals; merge product work. Production release is separate.

There is **no claim that these five product phases are completely live or student-validated** from code changes alone.
