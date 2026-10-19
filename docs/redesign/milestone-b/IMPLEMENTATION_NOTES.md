# Milestone B — Premium Frontend Redesign

Date: 2026-10-19  
Branch: `milestone-b-premium-frontend-redesign`  
Approved direction: Direction B Lite

## Outcome

Milestone B replaces the previous landing, dashboard, and shared workspace navigation with a lighter Evidence Notebook system built around Skillmetry's real product loop: choose a direction, assess knowledge, understand evidence, learn or practise, then reassess.

The implementation preserves the original palette (`#FBF5EA`, `#283C30`, `#C7E2BE`, `#F4B78D`, `#D5C1EB`, `#C6DDF2`, `#D9ED82`), all routes, API contracts, scoring rules, feature flags, authentication behavior, and backend logic. No dependencies, schemas, environment files, hosted services, or Milestone C surfaces were changed.

## Final polish pass — 2026-10-19

- Rebalanced the landing hero so its catalog-backed Goal → Evidence → Next Action proof appears in the first mobile viewport without weakening the desktop headline.
- Turned the product preview, journey field, career browser, dashboard panels, and drawer into one restrained Evidence Notebook system using purposeful folio tabs, paper grids, chapter edges, and shallow offset layers.
- Reduced the dashboard's poster-like scale. NOW and WHY form one compact decision instrument, while MY PATH and MY EVIDENCE now enter the 1440×900 first screen.
- Kept the primary dashboard action visible at 320×720 (`y=537`, `50px` high) and preserved the five-area mobile navigation with five `76×56px` touch targets.
- Fixed the landing career handoff: the selected catalog career is URL-encoded into onboarding, validated against the catalog, and selected in step two.
- Removed the measured-score fallback to zero. A measured state now requires a finite score; missing or invalid values render as unavailable or not assessed.
- Prevented no-goal states from presenting an evidence-based recommendation. The action and rationale now explicitly require a direction first.
- Audited the scoped Milestone B CSS, removed the obsolete hero-down treatment, consolidated repeated brand rules, and retained only the fine boundaries and shallow depth that communicate real UI structure.
- Updated source-contract tests for career carry-through, finite measured scores, and truthful no-goal recommendations.

## Implemented surfaces

### Landing

- Reframed the first viewport around one concrete promise: “Know what to learn next.”
- Added working primary and secondary paths to onboarding and the example workspace.
- Built a real catalog-backed Goal → Evidence → Next Action fragment without a fictional learner or score.
- Added a concise three-step journey, an interactive career explorer backed by the shared career/skill catalog, the evidence boundary statement “Unknown is not zero,” and a focused closing action.
- Added restrained scroll reveals with a reduced-motion fallback.

### Dashboard

- Preserved `/api/learning/overview`, the existing assessment profile, Digital Twin derivation, resource recommendation, and course-continuation logic.
- Reorganized the workspace around NOW, WHY, MY PATH, MY EVIDENCE, and CONTINUE LEARNING.
- Added a reusable evidence-state component for measured, not-assessed, illustrative, and unavailable states.
- Kept guest/demo data visibly illustrative and kept learning activity separate from measured quiz evidence.
- Added explicit loading, missing direction, no evidence, offline/unavailable, and fallback copy without inventing names, dates, achievements, streaks, or completion.

### Navigation and shared foundation

- Established the primary information architecture: Home, My Path, Learn, Practice, Progress.
- Kept every existing workspace route reachable through a grouped secondary drawer.
- Added a desktop header, tablet/mobile header, fixed safe-area-aware bottom navigation, skip link, dialog semantics, focus trapping, Escape close, focus restoration, and background scroll containment.
- Consolidated the affected styling into one scoped `milestone-b.css` layer and retained existing styles for untouched Milestone C pages.
- Added a palette-matched application icon so local and production review run without a missing-favicon error.

## De-slop decisions

- Removed decorative desk props, sticky notes, paper stacks, slogans, fake dashboards, and nested card grids.
- Used the real product model and catalog as the visual subject instead of stock art or fabricated student data.
- Gave each section a different composition: split hero, stepped process field, interactive path index, evidence statement, and centered action.
- Used large editorial type, shared edges, restrained accent allocation, flat tactile color fields, and only necessary icons.
- Avoided decorative gradients, resting shadows, pill-heavy UI, faux metrics, generic testimonials, pricing, and irrelevant marketing sections.

## Render critique

ROUND FINAL
Seen in one second: the learning decision.  
Idea (one sentence): Skillmetry turns a chosen direction and trusted evidence into one honest next action.  
Live thing: the career selector changes the catalog-backed path preview.  
Layout words by section: hero=split / journey=stepped field / paths=index plus detail / evidence=statement / close=centered action.  
Scores: design 6.5 · usability 8.5 · creativity 7.5 · content 9.0 → overall 7.6.  
Caps applied: design is capped at 6.5 because the landing intentionally has no photography or footage; unrelated stock media would weaken the product-specific brief.  
Top three remaining issues:  
1. The page does not use four real photographs or moving footage; this is an intentional product-fidelity tradeoff, and the real interface remains the visual hero.  
2. The 320 px career detail is necessarily tall; its controls remain readable and wrapped with no horizontal overflow.  
3. The dashboard's WHY detail continues below the first narrow-phone viewport, but the primary action and honest no-recommendation basis are visible before scrolling.

Taste Skill final checks: source lint `0 FAIL, 0 WARN`; rendered inspector `0 FAIL, 5 WARN`. The five rendered warnings were the locked cream palette, a broad but purposeful type scale, no photography, no footage, and restrained rather than continuous motion.

## Browser verification

The official `@playwright/cli` package was run through `npx` without adding a project dependency. The separate Playwright CLI skill package was not installed in this environment.

Verified at 1440×900, 768×1024, 390×844, and 320×720:

- Landing and dashboard rendered at every target size.
- `documentElement.scrollWidth` matched the viewport at all eight landing/dashboard captures; no horizontal overflow was detected.
- The bottom navigation remained fixed with safe-area content clearance.
- The 320×720 dashboard primary action was fully visible at `y=537` with a `50px` height.
- The landing career selector produced `/onboarding?career=frontend-developer`; onboarding then exposed Frontend Developer with `aria-pressed="true"` in step two.
- Mobile primary navigation and secondary drawer links reached their existing routes.
- The drawer exposed labelled dialog semantics; Escape removed it and focus returned to “Open tools and settings.”
- The workspace skip link received first keyboard focus.
- All five bottom-navigation targets measured `76×56px` at 390×844.
- `prefers-reduced-motion: reduce` reduced animation and transition durations to `0.00001s`.
- A fresh browser session reported zero console errors and zero console warnings after the application icon fix.

The live browser review covered the anonymous illustrative state. Authenticated-without-evidence and server-unavailable branches were verified through implementation/source-contract tests rather than a signed-in account because no test credentials were introduced or used.

No automated screen-reader session or third-party axe scan was introduced. Keyboard focus, semantic roles, target sizes, reduced motion, responsive overflow, and rendered contrast were checked directly in the browser; final assistive-technology review remains a manual approval item.

## Screenshots

- `screenshots/landing-1440x900.png`
- `screenshots/landing-768x1024.png`
- `screenshots/landing-390x844.png`
- `screenshots/landing-320x720.png`
- `screenshots/dashboard-1440x900.png`
- `screenshots/dashboard-768x1024.png`
- `screenshots/dashboard-390x844.png`
- `screenshots/dashboard-320x720.png`
- `screenshots/navigation-390x844.png`

## Verification results

- `npm run typecheck` — passed.
- `npm run lint` — passed with 0 errors and 13 existing warnings in unrelated assessment, course, jobs, resources, admin-editor, and learning-activity files.
- Focused final-refinement tests — 3 files passed, 18/18 tests passed.
- `npm test` — final rerun passed 57 files and 253/253 tests. The first full run had one transient 5-second subprocess timeout in `release-preflight`; that unchanged test passed in isolation and again in the clean full rerun.
- `npm run build` — passed with Next.js 15.5.27; static generation completed 31/31 and build traces completed.
- Taste Skill source lint — 0 failures, 0 warnings.
- Playwright — responsive screenshots, navigation destinations, focus restoration, reduced motion, overflow, and console reviewed.

## Skills used

- `design-taste-frontend`: landing composition, anti-template constraints, source lint, rendered measurements, and three-round screenshot critique.
- `redesign-existing-projects`: dashboard hierarchy and preservation-first redesign of an existing functional product.
- `web-design-guidelines`: semantic controls, focus visibility, keyboard behavior, touch targets, responsive layout, reduced motion, and honest state feedback.
- `tastecode-design-suite`: workflow coordination, safety boundaries, staged visual review, and Playwright verification routing.

`image-to-code` was not used because the approved concept could be translated with functional React components directly; generating or flattening a replacement image would not improve fidelity or product behavior.

## Changed-file summary

Final refinement changed nine source/test files plus this note and the nine requested screenshot artifacts:

- Landing and career handoff: `frontend/src/app/page.tsx`, `frontend/src/components/landing-journey-preview.tsx`, `frontend/src/components/career-chapter-gallery.tsx`, `frontend/src/app/onboarding/page.tsx`.
- Dashboard evidence honesty: `frontend/src/app/(workspace)/dashboard/page.tsx`, `frontend/src/components/evidence-status.tsx`.
- Shared visual refinement: `frontend/src/app/milestone-b.css`.
- Regression contracts: `tests/experience-v2.test.ts`, `tests/signal-interface.test.ts`.

The broader Milestone B implementation remains as previously recorded:

- Landing: `frontend/src/app/page.tsx`, `landing-journey-preview.tsx`, `career-chapter-gallery.tsx`, `landing-scroll-motion.tsx`.
- Dashboard and navigation: `frontend/src/app/(workspace)/dashboard/page.tsx`, `workspace-shell.tsx`, `evidence-status.tsx`.
- Shared presentation: `frontend/src/app/milestone-b.css`, `layout.tsx`, `icon.svg`.
- Direction correction: three Milestone A direction/system/plan documents now identify Direction B Lite and the original palette.
- Tests: eight source-contract suites were updated to assert the new interface language and preserved product boundaries.
- Review artifacts: nine screenshots in `docs/redesign/milestone-b/screenshots/`.

No commit, push, merge, reset, deployment, database operation, or environment change was performed.
