# Skillmetry 2.0 Phase 1 implementation report

Date: 2026-10-22  
Branch: `feat/skillmetry-2-phase-1-foundation`

## Outcome

Phase 1 is implemented as an additive foundation over the latest verified Experience 3.0 baseline. The work introduces a validated curriculum graph, simplifies student-facing product language, and adds coherent area navigation while preserving routes, API contracts, authentication boundaries, trusted scoring, staged feature gates, and saved-data compatibility.

No hosted migration was required or applied. No deployment, production credential change, merge, or push was performed.

## Architecture and compatibility

- Added typed Career → Skill → Topic → Subtopic → Lesson → Resource/Practice contracts in `shared/types/curriculum.ts`.
- Added runtime schema and relationship validation in `shared/lib/curriculum.ts` for malformed nodes, duplicate IDs, invalid references, missing relationships, and circular skill/topic prerequisites.
- Added a versioned `2026.1` curriculum catalog in `shared/data/curriculum.ts` covering all four existing careers and all 18 canonical skills.
- Reused canonical career/skill IDs, the existing 61-resource learning registry, active assessment metadata, resource-intelligence selectors, and Admin Studio course models.
- Added stable namespaced topic, subtopic, lesson, and practice IDs plus difficulty, order, learning objectives, source attribution, and prerequisite relationships.
- Extended published course lessons with optional curriculum metadata. Existing saved course payloads remain valid because all new fields are optional.
- Preserved existing route and API identifiers. The naming overhaul is deliberately presentation-only where an identifier change could break a contract.
- Preserved scoring truth: only completed server-graded assessments produce numerical proficiency; unassessed is unknown, practice and lesson activity are unscored, and hypothetical plans never become actual scores.

The Phase 1 catalog does not attempt the future 227-resource registry or add careers. Its interfaces are ready for Phase 2 to expand topics, lessons, resources, and practice without replacing the canonical catalog.

## Student-facing language and navigation

Updated visible product language across Home, My Path, Learn, Practice, Progress, account, assessment, course, project, planning, study-help, job-checking, and summary surfaces:

- Digital Twin → My Skill Progress
- Private Cloud Workspace → My Account or contextual account copy
- Career Passport → Skill Summary
- What-if Career Simulator → Compare Study Plans
- Mission Workshop → Projects
- Guided Coding Lab → Coding Practice
- Learning Tutor → Study Help
- Adaptive Roadmap → My Learning Path
- Diagnostic Insights → Topics to Improve
- Learning Planner → Weekly Study Plan
- Job Description Analyzer → Job Skill Checker
- Learning Desk / Shelf → Learning Resources

Decorative chapter numbering was removed from relevant visible headings. Technical mission, passport, simulator, tutor, and lab identifiers remain where required by APIs, database contracts, routes, and Admin Studio compatibility.

`frontend/src/components/workspace-shell.tsx` now supplies route-aware secondary navigation:

- My Path: Career Directions, My Learning Path
- Learn: Learning Resources, Courses & Lessons
- Practice: Assessments, Topic Practice, Coding Practice, Projects
- Progress: My Skill Progress, Skill Summary

Secondary tools receive a breadcrumb/back context. Active links expose `aria-current="page"`; mobile area links meet a 44 px target; reduced-motion rules remain supported. A 320 px My Learning Path detail-panel overflow found during browser verification was corrected.

## Tests and verification

Executed against the production source on this branch:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed with 0 errors and 13 existing warnings |
| `npm test` | Passed: 61 files, 272 tests |
| `npm run build` | Passed: Next.js 15.5.27, 31/31 static pages generated |
| `npm run verify:backend` | Passed: 43 static backend gates |
| `npm run verify:release` | Passed; hosted database/RLS and authenticated staging checks remain manual release gates |

New regression coverage includes curriculum schema/relationship validation, Admin Studio curriculum metadata compatibility, student terminology, five-area navigation, active states, and route preservation.

## Browser evidence

The production build was exercised with Playwright CLI on 12 representative routes at 1440×900, 768×1024, 390×844, and 320×720: 48 route/viewport combinations total.

Observed results:

- No horizontal overflow after the 320 px detail-panel fix.
- No retired student-facing terms in the rendered routes under test.
- No unnamed visible button, link, input, select, or textarea in the checked surfaces.
- No area or bottom navigation target smaller than 44 px.
- The first keyboard focus target is “Skip to main content”.
- Reduced-motion media emulation collapses navigation transition duration to effectively zero.
- The only console entries were two expected `401 Unauthorized` resource responses on `/passport` while browsing anonymously. No page exceptions were observed.

Rendered evidence:

- [My Learning Path — desktop 1440 px](screenshots/roadmap-desktop-1440.png)
- [Projects — tablet 768 px](screenshots/projects-tablet-768.png)
- [My Learning Path — mobile 390 px](screenshots/roadmap-mobile-390.png)
- [My Learning Path — narrow mobile 320 px](screenshots/roadmap-mobile-320.png)

Limitations: this pass did not use an authenticated learner or owner session, did not apply or exercise hosted Supabase migrations/RLS, and did not complete a native screen-reader or 200% zoom audit. Authentication-specific workflows and staged hosted capabilities therefore retain their existing release gates.

## Reviewable commits

- `3fba6df` — `chore: preserve verified experience v3 baseline`
- `3890eb2` — `feat(curriculum): add validated learning architecture`
- `f7d154d` — `feat(ui): simplify product language and area navigation`
- Final documentation/evidence commit: see branch tip.

## Phase 2 readiness

Phase 2 can build the complete learning and resource system on stable curriculum IDs and selectors, add richer shared-topic reuse, expand lesson and practice coverage, and grow the resource registry incrementally. It should preserve the Phase 1 validators, optional course metadata, source attribution, honest availability states, and existing assessment-only proficiency boundary.
