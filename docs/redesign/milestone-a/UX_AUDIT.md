# Skillmetry UX Audit

**Milestone:** A  
**Evidence rule:** “Source-confirmed” means visible in repository code or product documentation. “Screenshot-confirmed” means directly visible in the saved local browser capture. A screenshot of a loading state is not treated as proof of a permanent runtime defect.

## Summary

The current interface is honest about evidence and already contains useful accessibility foundations, but the experience is diluted by a broad feature surface, repetitive page templates, dense evidence screens, and a layered CSS system that makes visual behavior difficult to reason about. The highest-value redesign is not a feature expansion. It is a hierarchy correction around Home, My Path, Learn, Practice, and Progress.

## Top 10 actual UX problems

| # | Problem | Evidence | Impact | Redesign response |
| --- | --- | --- | --- | --- |
| 1 | The primary navigation reflects individual routes rather than the student’s learning loop. | **Source-confirmed:** `workspace-shell.tsx` exposes Home, Careers, My path, Quizzes, Progress, then puts Learn and practice tools inside More. | Learn and Practice feel secondary even though they are central to the promised loop; Careers and My Path compete. | Use five task areas: Home, My Path, Learn, Practice, Progress. Keep advanced tools contextual or in More. |
| 2 | Mobile navigation can cover live content. | **Screenshot-confirmed:** `dashboard-390x844.png`, `assessments-390x844.png`, and `resources-390x844.png` show the fixed bottom bar overlapping the content viewport. **Source-confirmed:** it is a fixed shell element with multiple later padding overrides. | Links and status content near the fold are obscured; layout confidence drops. | Reserve one canonical safe-area-aware content inset and test it on every primary route. |
| 3 | The dashboard competes with itself instead of committing to one next action. | **Screenshot-confirmed:** `dashboard-1440x900.png` and the long mobile capture combine goals, sample progress, latest evidence, several learning choices, feedback, streak, and a resource recommendation. | New students must interpret the system before acting. | Lead with one action and its rationale; move evidence/activity to compact supporting regions. |
| 4 | The roadmap’s desktop composition has a large dead zone and a visually foreign minimap. | **Screenshot-confirmed:** `roadmap-1440x900.png` shows a short graph inside a tall canvas, a dark React Flow minimap, and a much taller right inspector. | The graph looks unfinished despite valid data; attention is split across canvas controls and inspector. | Use a readable path/sequence as the default. Offer graph exploration as an advanced view when relationships require it. |
| 5 | Progress is too dense and panel-nested for its core question: “What is measured?” | **Screenshot-confirmed:** `twin-1440x900.png` presents many scores, controls, matrices, nested cards, and explanatory labels at once. | Evidence provenance, unknown states, and change over time are harder to scan. | Separate Overview, Evidence, and History; make unknown coverage explicit before detailed matrices. |
| 6 | Advanced/staged tools are too prominent relative to their real availability. | **Source-confirmed:** many routes are present while related migrations and flags are default-off. **Screenshot-confirmed:** More exposes planner, tutor, missions, simulator, jobs, and passport as peer destinations. | The product appears broader but less dependable; students encounter preview/disabled states unexpectedly. | Label availability before navigation and group advanced tools by purpose; do not make them primary tabs. |
| 7 | Repetition makes the product feel templated. | **Source-confirmed:** `SectionTitle` always renders eyebrow + H1 + description, and route-specific “CHAPTER”/kicker labels repeat across surfaces. **Screenshot-confirmed:** jobs, tutor, lab, missions, and other screens share the same large header-plus-two-panel composition. | Page identity comes from numbering and card shapes rather than the task itself. | Use three purposeful templates: orientation, focused task, and evidence/detail. Remove decorative chapter numbering. |
| 8 | Practice discovery is a long undifferentiated list and the answer controls are visually detached from labels. | **Screenshot-confirmed:** `lab-1440x900.png` shows twelve similarly weighted challenge pills and radio dots aligned far from their text. | Scanning is slow and answer selection has weak visual association. | Add skill/topic grouping, recent/next challenge priority, and wrap each radio with its visible answer label. |
| 9 | Async and two-pane tools can show excessive emptiness or duplicate pending feedback. | **Screenshot-confirmed:** `courses-1440x900.png` contains a large blank page under a loading row; `jobs-analyzed-1440x900.png` and `tutor-curated-1440x900.png` capture large empty result panes and multiple simultaneous loading messages. | The interface feels stalled and the user cannot tell which wait indicator is authoritative. | One local loading state per action, useful skeleton/empty copy, stable pane sizing, retry, and truthful timeout/offline handling. Further runtime verification is required before calling these permanent defects. |
| 10 | The styling architecture is difficult to maintain and can mask layout causes. | **Source-confirmed:** fifteen CSS files under `frontend/src/app` total 3,734 lines and 93 `!important` uses; thirteen are globally imported in `layout.tsx`; key selectors recur across phase files; `body` uses `overflow-x:hidden/clip`; `landing.css` appears unimported. | Cascade order, breakpoints, and spacing drift are expensive to change safely; overflow can be concealed rather than prevented. | Consolidate tokens and shell/layout rules incrementally, route by route, with visual regression checks. Do not rewrite business logic. |

## What already works and should be retained

- Explicit distinction between illustrative demo and signed-in evidence.
- Repeated copy that learning activity does not change trusted quiz scores.
- “Not assessed” treatment in roadmap and evidence views.
- Assessment security boundaries and server-side grading language.
- Keyboard-operable mobile drawer with Escape close and focus return in the captured check.
- A visible skip link in the workspace shell.
- Reduced-motion CSS disables the sampled landing animation.
- No horizontal overflow was observed in the sampled desktop/mobile routes.
- The existing approved palette is distinctive and suitable for a warm learning product.
- The current type stack is already performant through `next/font` and can be refined without adding dependencies.

## Page-by-page findings

### Landing

Evidence: `landing-1440x900.png`, `landing-1366x768.png`, `landing-1024x768.png`, `landing-768x1024.png`, `landing-390x844.png`, `landing-320x720.png`.

- Responsive behavior is broadly stable and no horizontal overflow was observed.
- The proposition is honest, but the page is long and repeats uppercase micro-labels, framed blocks, and “chapter” devices.
- The real product loop should appear sooner and at larger visual scale.
- Keep one clear primary CTA and one explanatory secondary action.

### Onboarding and authentication

Evidence: `onboarding-1440x900.png`, `onboarding-390x844.png`, `onboarding-step-2-390x844.png`, `auth-sign-in-390x844.png`.

- The two-step mobile interaction works in the captured run.
- Keep career choice reversible and avoid suggesting a permanent identity decision.
- Clarify what remains local/illustrative before sign-in and what becomes private cloud data after sign-in.

### Home

Evidence: `dashboard-1440x900.png`, `dashboard-390x844.png`.

- Honest sample labeling is strong.
- The page should collapse into a “Now / Why this / What changed” structure.
- Avoid making every product capability a home-page card.

### Careers and My Path

Evidence: `careers-1440x900.png`, `roadmap-1440x900.png`, `roadmap-390x844.png`.

- Careers and roadmap belong to one mental area.
- Mobile’s list fallback is more readable than shrinking a graph; keep that principle.
- Availability needs explicit treatment because only a subset of canonical skills has default assessments.

### Assessments and practice

Evidence: `assessments-1440x900.png`, `assessments-390x844.png`, `lab-1440x900.png`, `missions-1440x900.png`.

- The assessment entry point communicates sign-in and sample states well.
- Separate “Assess” from “Practise,” but keep both under the Practice area.
- Missions need differentiated difficulty, outcome, evidence type, and availability—not equal cards with chapter labels.

### Learn

Evidence: `resources-1440x900.png`, `resources-390x844.png`, `courses-1440x900.png`.

- Resources has a strong focused-learning idea, but the page repeats its CTA and carries a large legacy catalog below it.
- Courses correctly states that reading does not change scores.
- The loading capture is evidence of a weak intermediate layout, not proof that the API is permanently stuck.

### Progress

Evidence: `twin-1440x900.png`.

- Put coverage and provenance before comparative visualizations.
- Use distinct words for evidence, activity, path completion, and hypothetical scenarios.
- History should be an obvious subview rather than another panel among many.

### Advanced tools

Evidence: `planner-1440x900.png`, `jobs-1440x900.png`, `jobs-analyzed-1440x900.png`, `tutor-1440x900.png`, `tutor-curated-1440x900.png`, `simulator-1440x900.png`, `passport-1440x900.png`.

- Planner lists are repetitive and need day/priority grouping.
- Job analysis correctly avoids hiring predictions; preserve that language.
- Tutor correctly separates curated guidance from explicit AI consent; preserve that boundary.
- Simulator must remain visibly hypothetical.
- Passport should foreground private preview and sharing availability/expiry, not imply public sharing is always active.

### Admin

Evidence: `admin-1440x900.png`.

- The local capture shows the unavailable gate rather than a fabricated admin experience.
- Student redesign work must not weaken the server-side membership check or expose admin navigation.

## Accessibility and responsive observations

### Confirmed positives

- Mobile drawer is a modal dialog, traps focus, closes with Escape, and returns focus to the trigger in the captured check.
- Reduced-motion sampling reported no landing hero animation.
- Controls generally use semantic links, buttons, labels, and status/alert roles.

### Required Milestone B checks

- Re-run keyboard order from a clean page load; the previous post-drawer sample had retained focus state and was not conclusive for first-focus skip-link behavior.
- Verify focus visibility on every navigation and form control against the final tokens.
- Ensure fixed navigation never covers anchored headings, validation text, or final actions.
- Test text resizing to 200%, zoom, long labels, and safe-area insets.
- Avoid `transition: all`; animate only `transform` and `opacity` where possible.
- Give every async action exactly one announced pending state and a recoverable error.

## Browser evidence limitations

- Captures were local and primarily anonymous/illustrative; no owner credentials or cross-user authenticated sessions were used.
- Loading-state screenshots are time-bound observations. Final success/error states for courses, job analysis, and tutor require targeted authenticated/runtime verification in later milestones.
- The browser reported a missing `/favicon.ico` request in the local run. This is a small but real source/console cleanup item.
- Screenshot review verifies presentation, not backend correctness or assessment accuracy.
