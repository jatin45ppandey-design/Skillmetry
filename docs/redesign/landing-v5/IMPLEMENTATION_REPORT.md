# Skillmetry Landing — Editorial Product Experience

## Scope
Branch `design/landing-skill-atlas-v4` (retained for continuity; V5 UI replaces the former Atlas-branded landing). Built on published Milestone B, **not** the user's unpushed Milestone C/Experience 3.0. Do not merge blindly into local Milestone C.

## Design decisions
- Removed unnecessary Atlas badge, VOL. 01, section numbers, decorative labels and faux editorial chapter metadata.
- New product-first hero: one connected career selector, real selected skill, truthful "Not assessed" state and available next action.
- Simplified landing copy with a shorter high-signal headline, clear primary/secondary actions and no invented readiness scores.
- Connected learning-flow story with staggered entry animation and progressive link; no fake checkmarks or scroll hijacking.
- Career explorer is a useful selectable skill browser with groups, real catalog prerequisite inspection, relevant learning links and career-to-onboarding preservation. Does not fabricate a graph.
- Compact evidence status comparison and simple contextual learning links replace repetitive oversized colour banners.
- Scoped responsive styles in `landing-home-v5.css`; existing authenticated routes/components remain untouched.
- Tabs/controls remain native links, buttons and select elements. Content stays visible without JavaScript-driven animation; reduced-motion support included.
- Preserve server-only assessment scores, unknown as unknown, staged features and existing backend API/auth.

## Changed files
- `frontend/src/components/landing-home-v5.tsx` (new active landing)
- `frontend/src/app/landing-home-v5.css` (new scoped styles)
- `frontend/src/app/page.tsx` (switch active landing)
- `frontend/src/app/layout.tsx` (replace old V4 CSS import only)
- `frontend/src/components/landing-scroll-motion.tsx` (point existing observer at active landing)
- Three existing landing-specific source contract tests were updated to check the real, current implementation.
- Former V4 files remain in source history but are no longer rendered/imported.

## Review and integration notes
GitHub CI can verify TypeScript, lint, unit tests and build; no local Playwright screenshots are claimed here. Visual review should test 1440, 1024, 768, 390 and 320px, keyboard controls, career switch, onboarding handoff, link destinations and scroll motion. User should approve rendered desktop/mobile before promoting this branch. The current remote branch has **not** incorporated newer unpushed local Milestone C work.

No cloud infrastructure, database, auth, scoring, dependency or application workflows were changed.
