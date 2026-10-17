# Skillmetry UI/UX Phases 5–7 — QA and Release Acceptance

**Status:** UI source implementation on draft PR #27. Automated CI gates run on every push; authenticated visual QA still requires a real browser and the owner's sign-off. **Do not claim the complete redesign is browser-verified until this checklist is executed.**

## Scope
Phase 5: Resources, Courses, Planner, Practice, Coding Lab, Missions, Job Analyzer, Tutor, Simulator, Passport and all corresponding empty/preview/error states.
Phase 6: unified Admin Studio navigation and all five editors (Guides, Roadmaps, Courses, Missions, Assessment Banks), collapsed draft-preview panels, revision history and guarded switching.
Phase 7: automated regression/production build plus manual visual, accessibility, network and role-based QA.

Existing palette (cream/forest/sage), accounts and OAuth, backend, published assessment versions, trusted scores, Supabase project `qepaepqrhgrejzarqlrd`, and private `.env.local` are preserved. No hosted migration or feature-flag change.

## Run the branch locally

```powershell
git fetch origin
git switch feat/phase0-student-admin-viewport-ux
git pull --ff-only origin feat/phase0-student-admin-viewport-ux
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm run dev:admin
```

The dev server can choose 3001 or another free port if 3000 is occupied. Open the **printed** localhost URL, not an assumed port. Do not expose credentials or `.env.local`.

## Browser grid (record actual screenshots)

Test at browser zoom 100% and then 200%:
- Desktop: **1366×768**, 1440×900, 1920×1080.
- Tablet: 768×1024, landscape 1024×768.
- Mobile: 390×844 and 320×720, with on-screen keyboard.
- Include a narrow/large-text system setting and `prefers-reduced-motion: reduce`.

For each route **[ /, /auth/sign-in, /auth/sign-up, /account, /settings, /dashboard, /careers, /roadmap, /assessments, /twin, /resources, /courses, /planner, /lab, /practice, /missions, /jobs, /tutor, /simulator, /passport, /admin ]**:
1. Page goal, current state and primary action are discoverable in the first desktop viewport without a needless scroll.
2. No clipped text, invalid tiny columns, content hidden behind sticky actions, horizontal page overflow or duplicate generic headers.
3. Loading, no data, error and result state remain understandable. Scroll state and keyboard focus are sensible after navigation.
4. Verified quiz scores, illustrative sample scores, learning participation and hypothetical scenarios remain truthfully different.
5. Zoom to 200%, tab through controls, open menus and dialogs with keyboard, observe visible focus and select states. No hover-only interaction.
6. Reduced motion disables nonessential content/route/card animations, while preserving visible state and content.
7. Check link/button contrasts, specifically **Set up learning profile** and **Student workspace**.

## Phase 5 functional walkthrough

- Courses: change skill, search by title/skill, open a published course, expand/collapse modules. Check empty published-only state and external resource links; no fabricated course completions.
- Planner: show all/to-do/completed tasks, verify date/status updates only when persistence is truly enabled; the preview remains labeled unsaved when not.
- Lab: filter by skill, search by title, select question, answer and review; ensure changing filter does not leave a different exercise displayed.
- Missions: switch priorities-only filter, expand checklist, edit repository/demo/note evidence; save/submit only if permitted and only after server confirmation.
- Resources: open focused learning desk, full curated catalog, filtered resources, inspect expanded topics/relevance and external links without broken main action.
- Jobs/Tutor: empty → input → pending → result/error → retry, including opted-out external AI mode; no permanent empty results card.
- Simulator: no score modification, hypothetical quantities visibly distinct from server-graded results, reset works.
- Passport: distinguish share feature disabled/enabled, consent and private/preview data; no fake active public link.

## Phase 6 authenticated Admin walkthrough

With a **verified owner** and, separately, a reviewer/editor account only if already authorized:
1. Navigate all five modules with desktop rail and mobile select; check keyboard and focus.
2. Select existing item, edit it (do NOT publish test content to live students). Switching modules must warn for unsaved changes, cancel preserves draft.
3. Preview content using collapsed disclosure, confirm it explicitly says current editor content and whether a published version exists.
4. Review history, version labels, validation messages, errors and relevant field focus; ensure no answer-key leaks through student routes.
5. Check Save Draft pending → confirmed response; publication is owner-only with a clear confirmation and real server response. Avoid publishing changes to production during visual QA unless separately approved.
6. Test long-course/long-question-form scroll, "Jump to save & publish", 200% zoom and mobile keyboard without overlapping footer/actions.
7. Repeat short checks for Guides, Roadmaps, Courses, Missions and Assessment Bank. Preserve immutable published versions and server-only evaluation.

## Phase 7 automated checks

GitHub Actions Validate starter must pass **TypeScript**, **ESLint**, **Vitest**, **Next production build**, **privacy/static source gates**, **migration source safety checks** and **public journey HTTP smoke**. Added `tests/phase5-7-ux.test.ts` guards route-specific filter flows, honest save/preview semantics, five-editor unsaved protection and responsive/reduced-motion CSS.

Automated source/HTTP checks **do not replace screenshot comparison, cross-browser testing or real authenticated browser QA**.

## Approval

- [ ] Desktop/mobile screenshot QA completed (record date and tested sizes).
- [ ] User accepts client/student visual composition.
- [ ] User accepts Admin editor composition.
- [ ] OAuth sign-in/out and saved-vs-demo states exercised.
- [ ] Editor RBAC and draft/preview/submit checked without unintended production publication.
- [ ] CI green at the final PR head and review comments resolved.
- [ ] User explicitly authorizes merge into `main`; production deployment is a separate authorization.

No assertion of screenshot approval should be made from passing CI alone.
