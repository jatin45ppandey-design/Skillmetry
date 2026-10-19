# Skillmetry Design System Proposal

## Purpose

Create a small, product-specific system for the approved Direction B Lite implementation that can replace the current sequence of global phase overrides without changing business logic. The notebook influence stays subtle: editorial composition and warm surfaces, without literal desk props or decorative stationery. The system should make truthful states easy to render and incorrect states hard to invent.

This is a specification for later implementation, not a CSS change in Milestone A.

## Foundations

### Color tokens

Preserve the approved palette. Derive tints by mixing with paper/near-black during implementation; document the resulting contrast before use.

```text
brand.paper       #FBF5EA
brand.ink         #283C30
brand.sage        #C7E2BE
brand.apricot     #F4B78D
brand.lilac       #D5C1EB
brand.sky         #C6DDF2
brand.citron      #D9ED82
```

Proposed roles:

| Role | Default |
| --- | --- |
| Page background | Paper |
| Primary text | Ink |
| Primary action / active navigation | Ink |
| Directional highlight / current step | Citron |
| Supporting product fields | Sage, apricot, lilac, or sky according to information role |
| Resting surface | Paper or a paper-derived light surface |
| Border | Ink/paper mix with sufficient contrast |

Color is never the sole carrier of measured, unassessed, hypothetical, disabled, or error states.

### Type tokens

Use the existing `next/font` stack.

| Token | Family | Desktop target | Mobile target | Use |
| --- | --- | --- | --- | --- |
| `display-xl` | Bricolage | 64–76 / 0.96 | 42–52 / 1.0 | Landing statement only |
| `display-lg` | Bricolage | 44–56 / 1.02 | 34–42 / 1.06 | Major product heading |
| `heading-1` | Bricolage | 32–40 / 1.12 | 28–34 / 1.12 | Page title |
| `heading-2` | Bricolage | 24–30 / 1.2 | 22–26 / 1.2 | Section title |
| `heading-3` | Instrument Sans | 18–21 / 1.3 | 18–20 / 1.3 | Component title |
| `body-lg` | Instrument Sans | 18 / 1.55 | 17 / 1.55 | Lead copy |
| `body` | Instrument Sans | 16 / 1.55 | 16 / 1.55 | Default copy |
| `small` | Instrument Sans | 14 / 1.45 | 14 / 1.45 | Supporting content |
| `meta` | IBM Plex Mono | 13 / 1.4 | 13 / 1.4 | Dates, versions, evidence IDs only |

Rules:

- Minimum readable content size: 13 px; default body: 16 px.
- Use sentence case; reserve uppercase for short system labels.
- Avoid negative tracking on UI labels and body text.
- No decorative monospace paragraphs or chapter numbers.

### Spacing

Use a 4 px base with a deliberately small vocabulary:

```text
space-1  4
space-2  8
space-3  12
space-4  16
space-5  24
space-6  32
space-7  48
space-8  64
space-9  96
```

Layout:

- Maximum workspace width: 1320 px.
- Desktop gutters: 32–48 px.
- Tablet gutters: 24 px.
- Mobile gutters: 16 px.
- Section spacing: 48–80 px desktop; 36–56 px mobile.
- Use `env(safe-area-inset-*)` in shell chrome where relevant.

### Radius and elevation

Use geometry sparingly:

- Controls: 8 px.
- Standard surfaces: 12 px.
- Feature/path field: 20 px maximum.
- Pills: only for compact status/filter semantics, never as the default container.
- Resting surfaces: no drop shadow by default.
- Elevation only for open menus, dialogs, drawers, and dragged/floating objects.
- Remove the current one-off large top-right corner treatment from generic panels.

### Borders and fields

- One-pixel borders for interactive boundaries, tables, and form fields.
- Separate ordinary sections with space or a change of ground, not boxes around everything.
- Focus ring: 2–3 px, high contrast, with offset; never removed.

## Layout primitives

### Shell

- `AppHeader`: brand, five primary areas, account/menu, sync status.
- `MobileNav`: five primary areas; fixed only with canonical content inset.
- `UtilityDrawer`: advanced tools, account, settings, feedback, sign-in/out.
- `AreaNav`: local tabs for My Path, Learn, Practice, or Progress.
- `PageFrame`: one width/gutter contract, no route-specific width overrides.

### Page templates

1. **Orientation page:** Home and landing; one dominant action plus supporting evidence.
2. **Focused task page:** assessment, lab, job analyzer, tutor; one input/action region and one result region.
3. **Evidence/detail page:** Progress, roadmap detail, history; overview plus selectable details.

Avoid a universal eyebrow + H1 + description + two equal panels template.

## Component set

### Actions

- `Button`: primary, secondary, quiet, destructive; 44 px minimum touch height.
- `TextAction`: link with explicit destination/action label.
- `IconButton`: always has an accessible name and tooltip when meaning is not obvious.

### Navigation

- `PrimaryNavItem`
- `AreaTab`
- `Breadcrumb` only where hierarchy is genuinely deep
- `DrawerSection`
- `SkipLink`

### Product truth components

- `EvidenceStatus`
  - Not assessed
  - Measured
  - Measured zero
  - Illustrative
  - Legacy/untrusted where required
- `AvailabilityNotice`
  - Available
  - Requires sign-in
  - Preview / not saved
  - Not enabled
- `EvidenceProvenance`
  - assessment name
  - attempt date
  - version/method where relevant
- `ActivityDisclaimer`
  - learning activity is not scored
- `HypotheticalFrame`
  - visible label, reset/exit, no persistence language

### Path components

- `PathRail`: ordered stages and connecting line.
- `PathStep`: skill, prerequisite, evidence status, availability, next action.
- `NextAction`: one action plus concise reason.
- `PathStage`: Foundation, Core, Applied grouping.
- `GraphView`: optional advanced relationship exploration.

### Content components

- `ResourceRow` and `CourseSummary`
- `AssessmentSummary`
- `AttemptHistoryTable`
- `ChallengeNavigator`
- `EmptyState`
- `InlineNotice`
- `AsyncRegion`

## State model

Every data-bearing component must specify all relevant states before implementation:

| State | Required behavior |
| --- | --- |
| Loading | Keep layout stable; announce once; do not show duplicate spinners. |
| Empty | Explain whether there is no data, no matching filter result, or no published content. |
| Error | State what failed, what remains usable, and provide a retry when safe. |
| Offline | Preserve local/previous content where valid; never claim cloud sync. |
| Unauthenticated | Explain what can be explored and what requires sign-in. |
| Unauthorized | Do not reveal private/admin content; provide a safe exit. |
| Feature disabled | Explain deployment availability; do not fake success. |
| Preview/unsaved | State before action that data will not persist. |
| Illustrative | Keep context persistent near sample results. |
| Not assessed | No number and no zero-like progress fill. |
| Measured zero | Show `0/100` with assessment provenance. |
| Hypothetical | Visually and semantically isolated from trusted progress. |

## Forms

- Visible labels for every input; placeholders are examples, not labels.
- Put validation beside the field and move focus to the first invalid field on submit.
- Preserve user-entered text across recoverable errors.
- Textareas display remaining/used limits where meaningful.
- Checkboxes and radios wrap both control and visible label in one clickable target.
- Do not disable submit without explaining unmet requirements.
- Use a single pending label in the action that initiated the request.

## Tables and data visualization

- Prefer tables or ordered lists for exact comparisons and history.
- Charts are permitted only when they reveal a pattern that the list cannot.
- Always include text/value equivalents.
- Do not chart unassessed skills as zero.
- Keep career weighting separate from skill score.
- Minimap, pan, and zoom controls belong only in optional graph exploration.

## Motion tokens

```text
motion-fast    160ms
motion-panel   240ms
motion-feature 420–500ms
ease-standard  cubic-bezier(.2,.8,.2,1)
```

- Animate `transform` and `opacity` by default.
- No `transition: all`.
- One signature path reveal may appear on the landing page.
- Under `prefers-reduced-motion: reduce`, remove non-essential entrance/path animation and use immediate state changes.

## Responsive rules

- Start at 320 px and prevent horizontal overflow by layout, not body clipping.
- Collapse multi-column task pages into input → action → result order.
- Convert paths to vertical rails/lists on small screens.
- Keep touch targets at least 44 × 44 px.
- Never make hover the only reveal mechanism.
- Long labels wrap; controls do not truncate critical status.
- Verify bottom navigation against long pages, virtual keyboards, safe areas, and anchored content.

## Accessibility acceptance criteria

- WCAG AA contrast for text and essential controls.
- Visible focus for all interactive elements.
- Logical headings and landmarks.
- Clean first-tab access to the skip link.
- Escape and focus return for drawers/dialogs.
- Status and error changes announced once through appropriate live regions.
- Reduced-motion support.
- 200% text zoom without loss of task completion.
- No color-only status distinctions.

## CSS migration direction

The current app globally imports thirteen CSS layers after `globals.css`, with repeated selector overrides and 93 `!important` declarations across fifteen app CSS files. Milestone B should not rewrite everything at once.

1. Freeze current screenshots as baseline evidence.
2. Introduce tokens and a new shell layer with low-specificity selectors.
3. Migrate Landing and Home first.
4. Remove only rules proven unused or superseded by migrated surfaces.
5. Keep route-local styles close to the route/component.
6. Reduce `!important` only when the owning surface is migrated and verified.
7. Remove body-level overflow clipping only after root causes are fixed and regression-tested.
8. Confirm whether `landing.css` is dead before deleting it in a separately reviewed change.
