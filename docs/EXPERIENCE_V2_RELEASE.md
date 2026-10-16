# Skillmetry 2.0 — connected learning experience release status

**Implementation track:** `feat/skillmetry-learning-experience-v2`

## Product principle
Show students one understandable next step instead of 10 disconnected dashboards. Keep numerical quiz scores server-authoritative, keep unassessed states unknown, and separate learning participation from measured proficiency. Preserve Skillmetry's cream/forest/sage visual identity; no backend migrations or hosted deployment are performed by this frontend track.

## Implemented experience changes
- Landing: concrete purpose and learning outcome, interactive career gallery retained, explicit sample journey and no invented employability percentages.
- Onboarding: first choose goal intent (career / explore / skill), then a selected career or skill; advanced 18-skill/tool configuration is hidden until requested. Weekly study hours are a simple preset. The canonical profile and saved account schema are unchanged.
- Learning Home: one clear next step derived from real learning goals and quiz-only Digital Twin insights, current career skills, assessed-vs-unassessed states, resource recommendations, and approachable links to quizzes, coding lab, and planner.
- Streak calendar: owner-scoped `GET /api/learning/streak` integration with a seven-day grid; no client-generated days, localStorage counts, login rewards or artificial scores. Anonymous users never see fabricated streaks.
- Navigation: original routes remain available, but advanced tools are grouped under learning, career, and account rather than one undifferentiated list.
- Roadmap, results, job analyzer, tutor: contextual links connect the selected skill to catalog resources, guided coding, private progress, and the tutor. Tutor accepts `?skill=<canonical skill ID>` but does not transmit the selected skill/question to an external AI provider without explicit per-message opt-in.
- Planner: first unfinished task promoted as an action, while showing unsaved-preview status before workflow rollout.
- Practice: filtering selects a relevant visible exercise; challenge feedback now offers retry, next challenge and relevant curated learning resources.
- Visual system: additive `experience-v2.css` scoped sections, accessible links/buttons, keyboard-facing controls, reduced-motion behavior and responsive breakpoints. Existing pages and identity preserved without overwriting global foundations.

## Release controls
- Anonymous demos remain illustrative.
- The public app **must not claim streak data or saved task persistence** if corresponding migrations/flags are not active.
- Backing streak RPC requires migration `202610160006_learning_streak.sql`; the prior migrations `202610160001`–`202610160005` remain subject to approval and deploy sequencing.
- Both `SKILLMETRY_STREAKS_ENABLED=true` (server) and `NEXT_PUBLIC_LEARNING_STREAK_ENABLED=true` (client build-time flag) are required after approved staging E2E. The client shows a descriptive staged-state message otherwise.
- `NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED=false` means planner is a clearly labeled preview and practice history is not saved.
- Do not enable production database flags, apply Supabase hosted migrations, set secrets, deploy, or make paid AI calls without explicit user approval.
- Keep current production/preview behavior unchanged until verified staging promotion.

## Quality checks
- Repo CI: TypeScript, ESLint, Vitest, Next.js production build, static privacy/release checks and unauthenticated HTTP smoke of the full public/demo-facing page sequence must pass on the final commit. HTTP 200 smoke does not validate browser interactions or auth flows.
- Existing disposable database migration/pgTAP CI from backend PR #12 passed; frontend track does not alter those SQL migrations.
- Complete browser-specific mobile/desktop visual QA, real device keyboard/screen-reader testing, profile and quiz authenticated E2E, staging streak reactivity, timezone continuity and cross-account navigation, and usability sessions with new learners **before a public production claim**.
- Test that a signed-out demo, an authenticated learner with zero quiz results, a learner with trusted results, and a disconnected/offline session show honest next actions.
- Editorial review: English copy may later be localized; no unsupported certifications, guarantees or placement outcomes are implied.

## Explicit remaining scope
- Deeper visual redesign of all auxiliary pages (mission workshop, Passport, job comparison, simulator and settings).
- Fully implemented personalized continuity across devices depends on hosted workflow migrations.
- Automated reminders/notifications, real code execution sandbox, reviewer-verified projects, full AI tutor evaluation and legal/privacy retention workflow remain out of scope for this source-only release.
- Product analytics/user interviews are not fabricated; no claim of measured student comprehension or conversion improvements.

**Do not close the original 11-bucket master UX backlog until browser QA, advanced surfaces and full integration are finished.**
