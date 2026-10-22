# Milestone C — Complete Product Experience

Completed: 2026-10-20  
Branch: `milestone-c-complete-product-experience`  
Approved direction: Direction B Lite — Evidence Notebook

## Outcome

Milestone C extends the approved Milestone B identity across the remaining frontend route families without changing backend services, database schemas, scoring, authentication, feature flags, or hosted configuration. The original Skillmetry palette remains unchanged.

The implementation keeps each task visually distinct while sharing one editorial document grammar: fine evidence rules, restrained paper depth, meaningful accent bands, compact technical metadata, and warm typography. It does not introduce fake handwriting, quotes, learner achievements, decorative props, or inferred evidence.

## Foundation and branch note

The local approved Milestone B branch was clean at `5247446`. After fetching, `origin/main` was still four commits behind that approved Milestone B head, so Milestone C was created from the approved Milestone B head rather than rewriting or merging `main`. No commit, push, merge, deployment, database operation, environment change, or hosted flag change was performed.

`docs/redesign/milestone-a/MILESTONE_C_PLAN.md` now identifies Direction B Lite rather than the superseded Direction A.

## Design and implementation decisions

- Added three scoped, route-family layers rather than one giant override: `milestone-c-foundation.css` (entry/account/shared refinement), `milestone-c-learning.css` (path, evidence, learn, and practice), and `milestone-c-tools.css` (advanced tools, passport, and admin boundary).
- Added stable `data-route` and `data-area` attributes to the existing five-area shell. This keeps family-specific compositions isolated while preserving all navigation behavior.
- Refined onboarding/authentication into editorial entry documents; settings/account into learning records; assessment/practice into focused paper workspaces; path/evidence into readable staged documents; and advanced tools into task-specific working surfaces.
- Kept the palette tokens exactly at paper `#FBF5EA`, ink `#283C30`, sage `#C7E2BE`, apricot `#F4B78D`, lilac `#D5C1EB`, sky `#C6DDF2`, and citron `#D9ED82`.
- Used purposeful notebook cues only: a single margin rule, fine dividers, document corners, evidence bands, and compact index numbering. No decorative scene or unrelated generated imagery was added.

## Functional refinements

### My Path

- The roadmap now presents a readable staged skill path by default.
- The React Flow prerequisite graph remains available inside an explicit optional disclosure and rendered nine real catalog nodes in the local demo path.
- On narrow screens the staged path appears before personalized guidance, so the prerequisite journey is visible sooner.
- A missing trusted score no longer creates a zero-width numerical bar; the detail explicitly says no bar exists until trusted evidence exists.

### Practice

- `/practice` now opens a real diagnostic topic index with 20 catalog-backed topic links rather than showing an error for a valid base route.
- A selected Python topic loaded five guided questions from the existing practice API.
- The page continues to state that practice is unscored and never changes trusted assessment evidence.

### Progress / Digital Twin

- Added direct Overview, Skills, and History navigation within the evidence workspace.
- History always resolves to the selected skill detail; measured history remains conditional on real trusted attempts.
- Demo inspection found no `Not Assessed` skill rendered as `0%`.

### Shared quality

- Corrected narrow-viewport overflow caused by the route progress track, decorative route marker, roadmap filters, and Twin flex alignment.
- Preserved the five-area navigation, drawer focus trap, Escape close, focus restoration, skip link, bottom navigation, auth redirects, admin gate, privacy language, deterministic tools, and staged-feature messaging.
- Added a focused Milestone C regression suite for modular styling, five-area IA, list-first roadmap behavior, unknown-score handling, practice indexing, Twin navigation, and direction documentation.

## Route-family verification matrix

| Family | Routes reviewed | Browser/source evidence | Not verified locally |
| --- | --- | --- | --- |
| A. Onboarding, authentication, account | `/onboarding`, `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password`, `/account`, `/settings` | Responsive onboarding; desktop auth/settings; anonymous account redirected to sign-in with encoded return path; accessible control-name scan | Live email delivery, OAuth callback, recovery token, authenticated sync/error states |
| B. Assessments | `/assessments` | Desktop plus 768/390/320 captures; assessment choice, illustrative provenance, not-assessed state, history/source tests | Signed-in start/resume/submit/replay and immutable remote attempt creation |
| C. My Path | `/careers`, `/roadmap` | Career explorer desktop; roadmap at all four viewports; staged list, filters, optional graph interaction and real graph nodes | Hosted published-roadmap variants behind unavailable remote content |
| D. Progress | `/twin` | All four viewports; Overview/Skills/History anchors; evidence coverage and dates; unknown-not-zero DOM check | Authorized empty account, measured zero, multiple live attempts, legacy-untrusted hosted rows |
| E. Learn | `/resources`, `/courses` | Resources at all four viewports; courses desktop; local content APIs, loading/empty copy and navigation tests | Authenticated staged course-progress persistence and remote pagination beyond local data |
| F. Practice | `/practice`, `/lab`, `/missions` | Practice at all four viewports; 20-topic index; five-question API response; lab and missions desktop | Signed-in persistence for lab/mission activity and external mission assistance |
| G. Advanced tools | `/planner`, `/tutor`, `/jobs`, `/simulator` | Planner at all four viewports; tutor/jobs/simulator desktop; consent/privacy/hypothetical copy and existing security tests | External AI request, authenticated saved job/plan persistence, hosted rate-limit behavior |
| H. Passport and Admin | `/passport`, `/passport/share/[token]`, `/admin` | Passport and admin gate at all four viewports; invalid share token returned safe 404; sharing/admin authorization source tests | Valid share lifecycle, revocation/expiry across users, and authorized Admin Studio session |

## Browser and accessibility verification

The official `@playwright/cli` package was run through `npx` without adding a dependency. The separately named `playwright-cli` skill package was not installed in this environment.

- Captured 49 screenshots: every in-scope route at 1440×900, plus representative route-family captures at 768×1024, 390×844, and 320×720.
- Final representative rerun reported `scrollWidth === innerWidth` at every required viewport.
- Automated DOM inspection found no unnamed buttons, inputs, selects, or textareas on the responsive representative routes.
- The secondary drawer opened as a labelled modal dialog, moved focus to Close, closed with Escape, and restored focus to More.
- Reduced-motion emulation removed the workspace entry animation; the mobile 320 capture ran with reduced motion enabled.
- The optional graph disclosure opened and exposed nine React Flow nodes.
- A fresh browser session crawled Twin, Resources, Practice, Jobs, and Simulator with zero console or page errors.
- The screenshot harness's `animations: "disabled"` mode injects temporary `caret-color` styles before hydration and produced development-only hydration warnings in that capture session. A fresh session without that injection produced no hydration errors, so these were not recorded as product defects.
- The invalid passport token intentionally returned a 404 and therefore logged the expected failed document request.

Dedicated assistive-technology/screen-reader testing and browser-native 200% zoom were not available. Narrow effective layout widths, semantic roles, visible focus, keyboard operation, accessible names, reduced motion, and overflow were checked directly; final AT and native-zoom review remain manual approval items.

## Screenshots

All artifacts are in `docs/redesign/milestone-c/screenshots/`.

- Desktop: 22 captures covering onboarding, five auth/account/settings states, every workspace route family, passport, and the admin gate.
- Tablet: 9 representative captures.
- Mobile 390: 9 representative captures.
- Mobile 320 with reduced motion: 9 representative captures.

Representative review files include `onboarding-desktop-1440.png`, `assessments-mobile-320.png`, `roadmap-mobile-320.png`, `twin-desktop-1440.png`, `practice-mobile-390.png`, `planner-mobile-390.png`, `passport-tablet-768.png`, and `admin-mobile-320.png`.

## Verification results

- `npm run typecheck` — passed after final source changes.
- `npm run lint` — passed with 0 errors and 13 pre-existing warnings in assessment, course, jobs, resources, admin-editor, backend practice/lab, and learning-activity files.
- Focused Milestone C/product tests — 4 files and 13/13 tests passed.
- `npm test` — 58 files and 259/259 tests passed.
- `npm run build` — passed with Next.js 15.5.27; 31/31 static pages generated and build traces completed.
- `git diff --check` — passed; only Windows line-ending notices were emitted.

## Changed files

- Direction and documentation: `docs/redesign/milestone-a/MILESTONE_C_PLAN.md`, this implementation note, responsive screenshots.
- Shared routing/composition: `frontend/src/components/workspace-shell.tsx`, `frontend/src/app/layout.tsx`.
- Route-family styling: `frontend/src/app/milestone-c-foundation.css`, `frontend/src/app/milestone-c-learning.css`, `frontend/src/app/milestone-c-tools.css`.
- Functional path/practice/evidence refinements: `frontend/src/app/(workspace)/roadmap/page.tsx`, `frontend/src/app/(workspace)/practice/page.tsx`, `frontend/src/components/digital-twin-workspace.tsx`.
- Regression coverage: `tests/milestone-c-experience.test.ts`.

## Explicitly unverified

- No authorized student or owner-admin credentials were introduced or used.
- No two-user RLS, valid public-share token, live OAuth, password email, external AI, or hosted feature-flag flow was exercised.
- No database, migration, hosted configuration, deployment, commit, push, or merge action was performed.
- Final visual approval, native 200% browser zoom, and assistive-technology review remain with the owner.
