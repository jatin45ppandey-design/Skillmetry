# Skillmetry — UI/UX Design System v2

This is the **canonical design direction** for all Skillmetry pages. It complements `AGENTS.md` and the implementation backlog. Follow it before writing new UI components.

## Product principle

Skillmetry is a career-navigation product, not a chatbot wrapper or a collection of stock dashboard cards. Show a coherent **student → skills → target role → roadmap → mission → evidence → updated twin** journey.

Visual references: clarity and restraint of Linear/Vercel; network interaction patterns of roadmap.sh. Do not copy any particular product's interface, artwork or brand.

## Visual identity

- Background: `#080D18` (ink); panel: `#101D2D`; raised panel: `#142132`.
- Text: `#F0F5FF`; secondary: `#9BAEC1`; tertiary: `#71869B`.
- Accent: `#72E2D0` (soft mint); subtle secondary blue allowed for status/data.
- Borders: `#24394A`, 1px. No heavy glow around every card.
- Radius: 10–18px, with consistent nesting.
- Typography: Inter / Segoe UI / system sans; no serif display fonts or decorative all-caps paragraphs. Headings use tight letter spacing; body line-height 1.6–1.8.
- Spacing system: 4/8/12/16/24/32/48/64/96; avoid arbitrary gaps.
- Shadows: use only for elevated product preview, floating panels and active overlays.
- Icons: lucide-react, consistent 1.7–2px stroke.

## UI architecture

### 1. Landing — editorial introduction + REAL product visual
- Compact header: logo, Platform, How it works, Explore careers, Enter workspace.
- Strong headline with one soft-accent emphasis; 1–2 sentence description.
- Primary action: Build your skill twin; secondary: Explore roadmap.
- Hero visual must resemble the actual product: connected skill nodes, statuses, readiness, next step and simulation.
- Show sample data labels visibly; never imply illustrative values are real user data.
- Below hero: continuous loop, three differentiated capability blocks, four-step process and final CTA.

### 2. Dashboard — decision center, not just analytics
- First-view answer: **Where am I? What is my next best move? Why?**
- Primary content: readiness score and source status, target-role context, next mission, gap graph.
- One dominant chart/roadmap/twin visualization; other cards secondary.
- Clear labels on self-reported vs demonstrated skills.
- Prefer meaningful visual hierarchy over equal-sized statistic tiles.

### 3. Adaptive roadmap — first-class interaction
- React Flow graph with visible prerequisites and accessible pan/zoom controls.
- Skill node states: demonstrated, learning, next, locked; semantic colors + text labels.
- Selecting a node opens a side panel: purpose, prerequisites, skill importance, missions, evidence and CTA.
- Filtering must not erase unsatisfied prerequisites silently.
- Mobile offers a sequential/list equivalent.

### 4. Digital Twin — evidence, not vanity scoring
- Make claimed vs demonstrated vs verified state understandable.
- Score is a transparent role-weighted coverage index, NEVER hiring probability.
- Provide explanation of "why this score" and what will move it.
- Show uncertainty and assessed skills separately.

### 5. Simulator — distinguish hypothetical from actual
- Show baseline and projected score in parallel.
- Label scenarios `Projected, not achieved`.
- Toggle missions and explain expected impact; no mutation of verified skill data.

## Interactions

- Buttons: clear action verbs, predictable destination, consistent hierarchy.
- Every interactive control needs hover/focus/disabled/loading/error states.
- Subtle 150–220ms hover/expand feedback. No excessive animations or distracting glows.
- Support keyboard, proper landmarks and focus order.
- Respect `prefers-reduced-motion`.

## Responsive acceptance criteria

Check **1440px, 1024px, 768px and 390px** widths:
- No text overlap, clipped CTA, horizontal page overflow or unreadable preview.
- On mobile: hide desktop nav behind simpler access, stack controls, retain primary CTA.
- Complex graphs must have touch-friendly controls or a list alternative.
- Any cards should collapse gracefully without artificially long blank areas.

## Avoid

- Generic "AI-generated" graphics and excessive blue-purple gradients.
- Huge multiline headings that push everything off screen.
- Several identical metric bars as the only product showcase.
- Mixed serif/sans fonts, distorted wordmarks or inconsistent button styles.
- Empty padding, meaningless decorative hero blocks or fake live API data.
- Statically hardcoded dashboard data masquerading as the signed-in student's actual progress.

## Build/QA sequence for Codex

1. Run `npm install` once and validate the current baseline.
2. Build shared design tokens/components before editing every screen.
3. Match the landing's v2 tone on Dashboard, Roadmap, Twin and Simulator.
4. Preserve existing domain logic, APIs and route structure; improve UI separately.
5. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
6. If browser testing is available, inspect desktop and mobile screenshots, then fix spacing and overflow.
7. State honestly which routes have been visually checked versus only code-reviewed.
