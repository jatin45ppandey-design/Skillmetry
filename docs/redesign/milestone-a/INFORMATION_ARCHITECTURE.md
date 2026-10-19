# Skillmetry Information Architecture

## IA principle

Organize Skillmetry around the learner’s recurring loop, not around the number of implemented routes:

`Home → My Path → Learn / Practice → Progress → next action`

All existing routes and capabilities remain available. This proposal changes grouping, labels, and entry points—not product contracts.

## Recommended primary navigation

| Area | Purpose | Routes and content |
| --- | --- | --- |
| **Home** | Orient the learner and present one grounded next action. | `/dashboard` |
| **My Path** | Choose a career direction and understand the ordered skill path. | `/careers`, `/roadmap`; goal editing from `/settings` surfaced contextually |
| **Learn** | Study curated material without implying it changes measured scores. | `/resources`, `/courses` |
| **Practice** | Check knowledge and build skills. | `/assessments`, `/practice`, `/lab`, `/missions` |
| **Progress** | Inspect trusted evidence, coverage, and immutable history. | `/twin`, assessment history; Career Passport entry when available |

### Desktop

- Show the five areas as stable top-level destinations.
- Use a compact account/utility control at the right.
- “More” contains advanced tools and service utilities, not the core learning loop.
- The current route’s local subnavigation appears below the shell only when an area has multiple views.

### Mobile

- Bottom navigation: Home, My Path, Learn, Practice, Progress.
- Put account, advanced tools, settings, feedback, and sign-in in the header menu/drawer.
- Reserve `calc(nav-height + env(safe-area-inset-bottom))` once in the shell.
- Never rely on horizontal tab scrolling for access to a required destination.

## Secondary navigation

### Advanced tools

Group by learner intent and show real availability:

- **Plan:** Weekly planner.
- **Get guidance:** Learning tutor.
- **Explore possibilities:** Job description analyzer and Simulator.
- **Present evidence:** Career Passport.

Each entry should carry one of four states where relevant: Available, Preview, Requires sign-in, or Not enabled. Do not use a disabled-looking link without explanation.

### Utilities

- Account
- Goals and settings
- Feedback
- Sign in / sign out
- Sync status

### Admin

- `/admin` remains outside student navigation.
- Access continues to depend on server-side owner authorization and environment readiness.

## Area-level structures

### Home

1. Greeting and current goal.
2. One next action.
3. Why this action is recommended.
4. Most recent evidence change or “not assessed” clarification.
5. One optional learning continuation.
6. Compact links to the five areas.

Do not place every advanced tool on Home.

### My Path

Subnavigation:

- **Career direction** — explore and select among the four curated paths.
- **Skill pathway** — ordered prerequisites, current evidence, availability, and next steps.

Default pathway representation should be a readable sequence grouped by foundation/core/applied stages. A graph can be an optional desktop exploration mode, not the only understandable representation.

### Learn

Subnavigation:

- **Recommended** — a focused resource tied to the current next action.
- **Resources** — searchable/filterable curated catalog.
- **Courses** — published structured lessons.

Persistent note: learning activity does not alter assessed proficiency.

### Practice

Subnavigation:

- **Assessments** — trusted quiz entry and resume state.
- **Guided practice** — unscored topic/challenge practice.
- **Projects** — missions and learner-reported evidence.

Assessment and practice must remain visually distinct. “Check knowledge” may create trusted evidence; “Practise” does not.

### Progress

Subnavigation:

- **Overview** — evidence coverage and most important changes.
- **Skills** — measured and unassessed skills with provenance.
- **History** — immutable attempt timeline and reassessment deltas.
- **Passport** — private presentation/export, with sharing shown only when enabled.

Simulation never appears inside the trusted evidence view; link to it as a separate hypothetical tool.

## Canonical task flows

### A. First-time anonymous learner

1. Landing explains the evidence-to-action loop.
2. Learner starts onboarding.
3. Learner gives a name and chooses a flexible direction.
4. Home shows an illustrative journey with persistent demo labeling.
5. Learner can explore the path or a sample assessment.
6. Sign-in is offered when private verified history becomes relevant.

### B. Signed-in learner with no evidence

1. Home identifies the chosen path.
2. The next available supported assessment is the primary action.
3. Progress shows “Not assessed” without a numeric placeholder.
4. Learn provides a relevant preparatory resource as a secondary option.

### C. Assessment loop

1. Practice → Assessments.
2. Select a supported assessment and read scope/time.
3. Start or resume the owner-bound session.
4. Complete one-question navigation and submit.
5. Receive server-graded result and evidence explanation.
6. Open Progress for history or My Path for the next prerequisite.
7. Retake remains available according to the real policy.

### D. Learning loop

1. Open the recommended resource/course from Home or My Path.
2. Read/watch/practise.
3. If saving is unavailable, say so before the action.
4. Marking activity remains explicitly self-reported/unscored.
5. Return to the linked assessment when ready.

### E. Evidence review

1. Progress opens with coverage: measured versus unassessed.
2. Select a measured skill.
3. Inspect latest score, source assessment, date, and history.
4. Compare attempts without rewriting history.
5. Open the related path/resources/reassessment action.

### F. Advanced analysis

1. Enter through More or a contextual link.
2. Read availability/privacy status before entering data.
3. Job analyzer uses canonical skill recognition and no employability prediction.
4. Tutor defaults to curated guidance; external AI requires explicit per-message consent.
5. Simulator is framed as hypothetical and provides no save-to-progress affordance.
6. Passport sharing appears only when enabled and includes expiry/revocation context.

## URL and state rules

- Preserve current route URLs during the redesign unless a redirect plan is separately approved.
- Encode durable filters, selected skill, open course, and tab state in URL parameters where useful for sharing/back navigation.
- Do not put assessment answers, private evidence, or sensitive text in URLs.
- Back/forward navigation must restore meaningful view state.
- Deep links to gated content should resolve to an explanatory state, not a silent redirect or empty canvas.

## Label rules

- Use “Assessment” for score-producing quizzes and “Practice” for unscored work.
- Use “Evidence” for trusted assessment records.
- Use “Activity” for learning completion, planner tasks, lab work, and missions.
- Use “Not assessed” for missing trusted evidence.
- Use “Measured 0/100” for an actual zero result.
- Use “Illustrative” for anonymous sample data.
- Use “Hypothetical” for simulator outputs.
- Use “Preview” for locally usable but unsaved/staged workflows.

## Route preservation matrix

No route needs to be removed for Milestones B or C. Existing URLs map into the new areas:

| Route | New area |
| --- | --- |
| `/dashboard` | Home |
| `/careers`, `/roadmap` | My Path |
| `/resources`, `/courses` | Learn |
| `/assessments`, `/practice`, `/lab`, `/missions` | Practice |
| `/twin`, `/passport` | Progress |
| `/planner`, `/tutor`, `/jobs`, `/simulator` | More / contextual |
| `/settings`, `/feedback`, `/account` | Utilities |
| `/admin` | Owner-only operations |

## Success criteria

- A new learner can explain what creates a score after viewing Landing and Home.
- A learner can reach an assessment, learning resource, or evidence history in at most two primary navigation decisions.
- Mobile users have direct access to all five primary areas without opening More.
- Every unassessed, illustrative, hypothetical, preview, loading, error, and disabled state is named in text.
- No route promises a capability that its current environment cannot perform.
