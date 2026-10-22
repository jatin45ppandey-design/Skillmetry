# Skillmetry 2.0 Phase 2 implementation report

Date: 2026-10-22

Branch: `feat/skillmetry-2-phase-2-learning`

## Outcome

Phase 2 completes the learning and resource system on top of the Phase 1 curriculum contracts. It reuses the canonical 18 skills, four careers, 61-resource catalog, course payloads, owner-scoped progress table, five-area navigation, authentication boundary, Admin Studio compatibility, and assessment-only proficiency model.

No hosted migration was applied. No merge, push, deployment, or production credential change was performed.

## Implemented

- Expanded curriculum version `2026.2` to 54 meaningful topics, 54 subtopics, and 54 structured lessons: three ordered stages for every canonical skill.
- Added original explanations, worked examples, common mistakes, practical tasks, outcomes, estimates, prerequisites, and stable routes for every lesson.
- Added an 18-skill explorer at `/learn`, career/search filtering, skill paths, lesson sequencing, previous/next navigation, and direct resource/assessment handoffs.
- Generated 18 built-in courses from the normalized curriculum and merged them with any owner-published Admin Studio courses without changing the existing payload contract.
- Preserved the staged owner-scoped lesson-progress backend. Anonymous learners see a signed-out state; disabled deployments say saving is staged; successful writes are explicitly self-reported and never update skill scores.
- Extended resource intelligence with normalized skill/topic relationships, topic/language filters, query-state synchronization, availability metadata, and duplicate ID/URL tests.
- Preserved all 61 resource records and extended the catalog to 83 unique records with 18 normalized English video courses and four reviewed Hindi videos.
- Added machine-readable coverage reporting through `npm run report:curriculum`.
- Added loading, empty, unavailable, error, saving, and success states across the explorer, lessons, courses, resources, and staged progress flow.
- Preserved career, assessment, authentication, Admin Studio, and Continue Learning integrations. Only server-graded assessments can produce numerical proficiency.

## Browser-discovered correction

The first production browser pass found that the courses API returned 18 curriculum courses with HTTP 200, but the client discarded them because it passed metadata fields into a strict course-payload schema. The parser now validates only `title`, `summary`, and `modules`, then attaches trusted response metadata. A regression assertion protects this boundary. The rebuilt page renders all 18 courses and deep-links their lessons correctly.

## Verification

The production build was served at the confirmed address `http://127.0.0.1:3100`; the previously refused port `3001` was not assumed.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed with 0 errors and 11 pre-existing warnings |
| `npm test` | Passed: 62 files, 276 tests |
| `npm run build` | Passed: Next.js 15.5.27, 31/31 static pages, `/learn` and lesson route included |
| `npm run verify:backend` | Passed: 43 static backend gates |
| `npm run verify:release` | Passed static release/security gates |
| `node scripts/validate-resource-links.mjs` | Passed: 83 reachable, 0 inaccessible, 0 network-unverified |
| `npm run report:curriculum` | 4 careers, 18 skills, 54 topics, 54 subtopics, 54 lessons, no coverage gaps |

Playwright verified:

- `/learn`, a selected Python skill path, a structured lesson, `/courses`, and `/resources`.
- 18 course cards, three Python topics, lesson next-navigation, course-to-lesson deep links, and the honest signed-out progress state.
- Topic and language controls; Hindi filtering returned four correct resources and updated the URL.
- Desktop 1440×900, tablet 768×1024, mobile 390×844, and narrow 320×720 layouts with no horizontal overflow.
- Skip-link-first keyboard focus and reduced-motion emulation.
- Zero final browser console errors and zero warnings.

Rendered evidence:

- [Skill path — desktop 1440 px](screenshots/learn-desktop.png)
- [Lesson reader — tablet 768 px](screenshots/lesson-tablet.png)
- [Courses — mobile 390 px](screenshots/courses-mobile.png)
- [Learning resources — narrow mobile 320 px](screenshots/resources-320.png)

## Known limitations and Phase 3 handoff

- The researched 227-URL registry is absent locally. The missing records were not fabricated; future work should import the original registry with source provenance and editorial review history if it becomes available.
- One reachable roadmap remains editorially unverified and is reported as such.
- Authenticated saved-progress E2E, hosted Supabase RLS, migrations, native screen-reader testing, 200% zoom, and production performance remain release/hosted-environment gates.
- Phase 3 can add richer exercises, assessment breadth, and authenticated progress analytics while preserving the strict separation between study activity and server-graded proficiency.

## Commits

- `d8bdc0b` — `feat(learning): complete phase 2 curriculum system`
- `11a1165` — `fix(learning): render built-in courses in catalog`
- Final QA/evidence commit: see branch tip.
