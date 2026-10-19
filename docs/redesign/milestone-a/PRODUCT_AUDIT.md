# Skillmetry Product Audit

**Milestone:** A — product grounding and redesign direction  
**Date:** 2026-10-19  
**Scope:** Read-only audit of the existing repository, product documentation, routes, feature flags, and captured local UI. No production code, database, or deployment changes are included.

## Executive finding

Skillmetry is not a generic learning dashboard. Its defensible product loop is:

1. choose a career direction;
2. take a supported, authenticated quiz;
3. convert the latest trusted result into a skill profile and roadmap;
4. receive one grounded next action;
5. learn or practise without confusing that activity with assessed evidence;
6. reassess and retain immutable history.

The redesign should make that loop visible on every primary surface. Advanced tools may remain available, but they must not compete with the loop or imply that staged features are active.

## Product contract that the interface must preserve

| Contract | Confirmed behavior | UX consequence |
| --- | --- | --- |
| Trusted scores | Numerical skill scores come from authenticated, server-graded quiz attempts. | A score needs a clear evidence source, assessment name, and date where available. |
| Missing evidence | `undefined` means not assessed; a measured `0` is valid and different. | Never render missing evidence as `0%`, an empty progress bar that reads as zero, or a red failure state. |
| Anonymous mode | Demo assessment data is illustrative and isolated. | Keep “Illustrative demo” persistent near affected content, not only in the header. |
| Learning activity | Reading, practice, planner tasks, and mission activity are unscored unless a separate trusted assessment produces a result. | Label activity as activity. Do not let checkmarks or streaks visually masquerade as proficiency. |
| Simulations | Scenario gains are hypothetical, in-memory, and non-persistent. | Use an explicit hypothetical frame and a clear exit/reset; never merge projections into Progress. |
| History | Trusted attempts are immutable, owner-scoped records. | Progress should foreground evidence history and changes between attempts, not gamified totals. |
| Auth and ownership | Private records are protected by server authorization and RLS; elevated keys remain server-only. | Signed-out, loading, offline, and authorization states must be first-class, truthful states. |
| Feature rollout | Several newer workflows are source-complete but migration- or flag-gated. | Navigation and calls to action must reflect actual environment availability rather than repository ambition. |

## Capability inventory

### Core, product-defining capabilities

- Career selection across four curated career paths.
- A canonical graph of eighteen skills and career-skill relationships.
- Four default foundational assessments: Python, SQL, JavaScript, and HTML.
- Secure start/resume, server grading, immutable attempt history, retakes, and owner-scoped reads.
- Dashboard next-step guidance, Digital Twin evidence, roadmap prerequisites, coverage, and history.
- Explicitly illustrative anonymous demo mode.

### Learning and practice capabilities

- Curated learning resources and published courses.
- Guided, non-arbitrary coding practice.
- Weekly planner and learner-reported project missions.
- Learning activity that is deliberately separate from trusted score evidence.

### Advanced and staged capabilities

- Expanded assessments and 2026.3 diagnostics.
- Topic evidence and answer review.
- Job-description parsing against canonical skills.
- Curated tutor guidance, with external AI only behind explicit per-message consent and server controls.
- Career Passport and staged share links.
- Learning streak, course completion, editorial approval, question-bank administration, and mission administration.

These advanced capabilities are useful extensions, not equal-level destinations for a first-time student.

## Availability and rollout truth

The documentation describes two different migration generations and they must not be collapsed into one status statement:

- `docs/STATUS.md` confirms the seven core assessment/database migrations were applied and verified on the linked hosted Supabase project on 2026-10-15.
- README and later release documents state that newer Phase D and P1–P10 feature migrations remain staged/default-off unless explicitly approved and enabled.

Relevant default-off flags include:

- `NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED`
- `NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED`
- `NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED`
- `NEXT_PUBLIC_LEARNING_STREAK_ENABLED`
- `NEXT_PUBLIC_PASSPORT_SHARING_ENABLED`
- `SKILLMETRY_DB_RATE_LIMITING_ENABLED`
- `SKILLMETRY_AI_TUTOR_ENABLED`
- `SKILLMETRY_PASSPORT_SHARING_ENABLED`
- `SKILLMETRY_STREAKS_ENABLED`
- `SKILLMETRY_ADMIN_STUDIO_ENABLED`
- `SKILLMETRY_COURSE_PROGRESS_ENABLED`
- `SKILLMETRY_EDITORIAL_APPROVAL_ENABLED`
- `SKILLMETRY_ADMIN_MISSIONS_ENABLED`
- `SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED`

The redesign must derive user-visible availability from these real gates. A staged route can remain discoverable, but its entry point should say what is usable now, what is preview-only, and what requires sign-in or deployment configuration.

## Audience and jobs to be done

### Primary audience

Students and early-career learners who are uncertain about:

- which career direction fits their interests;
- what they already know based on actual evidence;
- what to learn or practise next;
- whether their effort is producing measurable improvement.

### Primary jobs

1. “Help me choose a direction without pretending the choice is permanent.”
2. “Show me what is measured and what is still unknown.”
3. “Give me one realistic next step, with a reason.”
4. “Help me learn and practise without inflating my score.”
5. “Let me see how my evidence changes after reassessment.”

### Secondary jobs

- Compare a job description with measured and unassessed skills.
- Plan a week of study.
- Work through guided challenges and project missions.
- Export or share a controlled career summary when the relevant feature is safely enabled.

## Product content model for the redesign

The UI should consistently use these nouns:

- **Goal:** the selected career direction.
- **Skill:** one canonical capability in the graph.
- **Assessment:** a supported quiz that can create trusted evidence.
- **Evidence:** the latest trusted result plus its immutable history.
- **Learning activity:** resources, course lessons, planner tasks, lab practice, and missions; explicitly unscored.
- **Next action:** one recommended action grounded in goal, prerequisites, evidence, and availability.
- **Scenario:** hypothetical, temporary, and never a result.

Avoid using “progress” as a catch-all. Skill evidence, learning activity, path completion, and feature availability are different states.

## Route-to-capability map

| Current route | Product role | Recommended prominence |
| --- | --- | --- |
| `/dashboard` | Orientation and one next action | Primary: Home |
| `/careers` | Career exploration and goal selection | Primary: My Path |
| `/roadmap` | Prerequisites and ordered skill pathway | Primary: My Path |
| `/resources`, `/courses` | Curated study content | Primary: Learn |
| `/assessments`, `/practice`, `/lab`, `/missions` | Measurement and skill-building | Primary: Practice |
| `/twin` | Current evidence, coverage, and history | Primary: Progress |
| `/planner`, `/tutor`, `/jobs`, `/simulator`, `/passport` | Supporting or advanced tools | Secondary: More/contextual entry points |
| `/settings`, `/feedback`, `/account` | Personal and service controls | Utility navigation |
| `/admin` | Owner-only content operations | Never in student navigation |

## Product risks the redesign must prevent

1. Treating all eighteen skills as measurable when the default catalog exposes only four assessments.
2. Making learning completion look like assessed proficiency.
3. Turning the dashboard into a catalog of every feature instead of one next step.
4. Presenting staged functionality as fully operational.
5. Showing anonymous sample data without persistent illustrative context.
6. Using a career-readiness percentage or hiring probability unsupported by the scoring model.
7. Letting decorative visuals imply a successful result or completed prerequisite.
8. Burying evidence provenance behind a generic “progress” label.
9. Allowing the tutor, job analyzer, or simulator to become the perceived core product.
10. Exposing admin affordances based only on client-side identity.

## Product recommendation

Make “one grounded next action” the organizing principle, with a visible evidence chain:

`goal → available assessment/evidence → next action → learning activity → reassessment`

Direction A expresses this product most directly. Direction B is visually memorable but makes the stationery metaphor the dominant idea, adds photographic/texture cost, and is harder to scale across complex authenticated states and small screens.

## Evidence consulted

- Repository product documents: `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/SCORING.md`, `docs/STATUS.md`, `docs/BACKLOG.md`, `docs/SECURITY.md`, and staged-release documents.
- Route and navigation source under `frontend/src/app` and `frontend/src/components`.
- Browser captures under `screenshots/` and concepts under `concepts/`.
- No hosted Supabase mutation, authentication action, or production request was performed.
