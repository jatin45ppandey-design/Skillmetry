# Skillmetry — Learning Chapters Design System

> Desktop-first visual direction approved in design discussion, implementation milestone 2026-10-16.
> Source of truth: `frontend/src/app/chapter-landing.css` for public marketing,
> `frontend/src/app/studio.css` for the authenticated workspace,
> `frontend/src/app/studio-surfaces.css` for supporting screens.
> Do not confuse this UI redesign with authorization/scoring changes.

## Product character

**Creative learning magazine × interactive discovery × evidence-based skill journal.**

Skillmetry is a learner's workspace, not a generic statistics dashboard. The public experience is colorful and expressive. Assessment pages are deliberately quiet, readable, and task-focused. Evidence pages are structured and credible. No glowing chatbot sphere, fictitious leaderboard, stock AI robot or invented employability prediction.

## Palette and color roles

| Role | Token / value | Usage |
| --- | --- | --- |
| Warm paper | `#FBF5EA` | Learning canvas / long-reading pages |
| Deep forest | `#283C30` | Main copy, primary controls, editorial contrast |
| Apricot | `#F4B78D` | One career family, exploratory illustrations |
| Lilac | `#D5C1EB` | One career family, creative chapter sections |
| Sage | `#C7E2BE` | Learning surfaces / a career family |
| Sky | `#C6DDF2` | One career family |
| Citron | `#D9ED82` | Rare, high-signal accent |

Career colors are **identity / navigation**, never substitutes for assessment status or score semantics.
Success, caution and hypothetical states must be communicated in text and accessible labels, not just color.

## Typography

- **Bricolage Grotesque:** striking editorial heading hierarchy, not paragraph copy.
- **Instrument Sans:** body, forms, questions, controls, long-reading interface.
- **IBM Plex Mono:** quiet evidence metadata (quiz version, attempt date, section counters).
- Minimum practical body copy target 16px for reading. Avoid 10px labels for important content.
- Keep paragraphs readable, typically 50–75 characters per line.
- Use asymmetrical composition deliberately, not as randomized decoration.

## Geometry and visual grammar

Four shape families: asymmetric chapter sheets, rounded capsules, circular action bubbles, and curved connected learning trails. Primary action buttons combine a unified text + arrow-bubble hit target. Shapes may vary by role, but actions must retain consistent hover, focus, disabled and loading feedback. **No mandatory uniform rectangular KPI card grid.**

Custom illustration language is built from layered paper objects, editorial cutouts, real skill-themed motifs, and connected trails. Decorative illustration may never imply an assessment result.

## Navigation system

- Desktop: persistent compact **top navigation**, not a fixed left sidebar.
- Primary destinations: My Studio, Explore, My Path, Assess, Evidence.
- Supporting destinations: Resources, Simulator, Missions, Jobs, Passport and Settings in **More** and the all-pages drawer.
- Mobile: four compact main destinations + More, which opens the complete navigation drawer.
- Keyboard support: visible focus, Escape and focus wrap in drawer, proper focus return when closing.
- Deep routes and authenticated pages remain reachable by direct URLs.

## Content and UI architecture

1. **Landing / Discover:** bold editorial hero, interactive career islands from the real catalog, honest process story and original illustrations.
2. **Onboarding / Build a study kit:** choose optional career, skills, and tools with live goal preview. Do not invent any proficiency.
3. **My Studio / Now:** one current recommendation, a contextual trail, trusted evidence counts, and one grounded resource.
4. **Assessment / Focus:** large readable question booklet, visible question status, locally preserved answers where supported, final submission confirmation and trustworthy result/history.
5. **Roadmap / Explore:** prerequisite-aware graph with a keyboard-accessible list fallback; do not synthesize evidence or prerequisite links.
6. **Digital Twin / Reflect:** latest valid server-graded score per skill, immutable historical attempts, missing vs 0% separation, accessible source labels.
7. **Resources / Learn:** trustworthy curated sources, clear target/format and an explanation of why each is relevant.
8. **Simulator / Try:** explicitly hypothetical read-only comparison; never persists as actual progress.

Avoid deceptive progress bars, invented streaks, generic AI assistant panels, exaggerated claims, and meaningless charts.

## Trust invariants (unchanged)

- Only a real server-graded valid assessment yields a numerical skill score.
- `Not Assessed` is **unknown**, never 0%.
- A measured 0% from a valid quiz is **not** unknown.
- Demo data is illustrative and separate from signed-in records.
- Quiz pass is not professional verification, certification or job readiness.
- Simulations remain read-only hypothetical views.
- Auth, RLS, grading, persistence and hosted migrations are outside cosmetic changes.

## Accessibility and responsive expectations

- Primary design canvas 1440px. Validate 1280px, 1024px, 768px and 390px, plus content zoom and keyboard-only navigation.
- Respect reduced motion and preserve all information when animations are removed.
- Every action must be available on touch and keyboard; hover previews cannot be the only discovery route.
- Focus mode may suppress decorative navigation only while an actual quiz session exists; users must retain safe exit or browser navigation.
- Loading, offline, unauthenticated and error states must provide understandable next actions.
- Confirmation uses the native dialog behavior where supported.

## Quality gate before merge

`npm ci && npm run typecheck && npm run lint && npm test && npm run build`, plus browser layout/contrast/keyboard QA and manual auth + quiz + retake testing. A code-only review or successful CI **does not** constitute pixel-by-pixel visual acceptance.

## Current implementation status

The branch `design/learning-chapters-studio-v1` establishes the new design grammar and updates the key public and studio flows. Supporting authenticated routes receive warm visual treatment but **are not yet complete bespoke screen redesigns**. Per-screen responsive and accessibility audits, custom illustration assets, performance measures and production acceptance remain pending. See `docs/LEARNING_CHAPTERS_IMPLEMENTATION.md`.
