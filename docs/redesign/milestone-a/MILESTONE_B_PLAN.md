# Milestone B Plan — Foundation, Landing, and Home

## Goal

Implement the approved Direction B Lite foundation and prove it on the two highest-leverage surfaces: the public landing page and signed-in/illustrative Home. Preserve every backend contract and existing route.

Milestone B begins only after explicit design approval.

## In scope

1. Design tokens and shared layout primitives.
2. Primary/utility navigation information architecture.
3. Landing page redesign.
4. Home/dashboard redesign.
5. Truth-state primitives used by those screens.
6. Responsive, accessibility, motion, and visual regression verification.

## Out of scope

- No schema or migration changes.
- No assessment grading, score, RLS, auth, or API contract changes.
- No route removal.
- No implementation of the remaining Milestone C screens.
- No automatic enabling of staged flags.
- No deployment, commit, push, or merge unless separately requested.

## Implementation sequence

### B1. Baseline and contracts

- Record clean Git state and preserve all unrelated work.
- Turn the Milestone A screenshots into a route/viewport test matrix.
- Add characterization tests for navigation destinations and truth labels where coverage is missing.
- Confirm the live environment’s feature flags without printing secrets.
- Document exact components and CSS layers touched before editing.

### B2. Tokens and primitives

- Define palette, type, spacing, radius, focus, motion, and layout tokens.
- Build or refine `PageFrame`, action styles, status labels, async region, and path rail primitives.
- Keep existing fonts and Lucide React.
- Add no dependency unless a demonstrated requirement cannot be met with the current stack.

### B3. Navigation shell

- Desktop: Home, My Path, Learn, Practice, Progress.
- Mobile: the same five direct destinations.
- Move advanced tools and utilities into the drawer/More structure.
- Preserve all route URLs and account/sync behavior.
- Fix bottom-nav safe-area and content inset centrally.
- Retain skip link, drawer focus trap, Escape close, and focus return.

### B4. Landing

- Replace repeated chapter/card composition with the Direction B Lite hero.
- Use a real, readable product fragment for Goal → Evidence/Assessment → Next action.
- Keep copy grounded in server-graded quizzes and honest unknown states.
- Use one primary CTA and one secondary explainer.
- Retain responsive behavior down to 320 px and reduced-motion fallback.
- Add route metadata and favicon cleanup if approved as part of this surface.

### B5. Home

- Implement Now / Why this / What changed.
- Derive the action from existing real overview/store data; no fabricated recommendation.
- Preserve illustrative-demo labeling.
- Distinguish evidence from learning activity.
- Show advanced tools only through contextual links when they are useful and available.

### B6. CSS consolidation for migrated surfaces

- Move migrated rules into a clearly owned foundation/surface structure.
- Remove only superseded Landing/Home/shell overrides proven unused.
- Avoid broad restyling of untouched routes.
- Replace body overflow suppression only after measuring all primary widths.

### B7. Verification

- TypeScript and lint.
- Unit/component tests for state mapping and navigation.
- Production build.
- Browser checks at 1440×900, 1024×768, 768×1024, 390×844, and 320×720.
- Keyboard-only navigation from a clean load.
- Reduced motion, 200% zoom, long labels, empty/loading/error/offline, signed-out, illustrative, and staged-feature states.
- Confirm no horizontal overflow and no fixed-nav overlap.
- Confirm no console errors, including missing icon assets.

## Acceptance criteria

- Landing communicates Skillmetry’s actual loop in the first viewport.
- Home presents one grounded next action and explains why it is next.
- Five primary areas are directly understandable and accessible on desktop/mobile.
- Missing evidence is never numeric; measured zero remains numeric.
- Illustrative and unscored states remain explicit.
- No API, database, auth, grading, or feature-flag behavior changes.
- Untouched routes remain functional.
- All requested verification reaches explicit final completion markers before being reported as passed.

## Review gates

1. Approve Direction B Lite and the five-area IA.
2. Review shell and Landing at desktop/mobile before migrating Home.
3. Review Home with at least signed-out illustrative, signed-in no-evidence, and signed-in measured-evidence states.
4. Approve the Milestone B diff before any Milestone C work.

## Highest-priority implementation risks

- Global CSS specificity may make isolated migration difficult.
- The current store/API may not expose every “why this” sentence directly; derive only from existing deterministic logic.
- Build-time feature flags can produce different navigation/availability states.
- Mobile fixed navigation must be validated on long and short content, not just the dashboard.
- Product preview content on Landing must remain illustrative and clearly labeled if it resembles a score/result.
