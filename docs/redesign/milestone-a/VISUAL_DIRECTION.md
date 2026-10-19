# Skillmetry Visual Direction

## Decision

**Recommend Direction A: Learning Field Guide.**

Direction A is the coherent direction for Milestones B and C. It uses the path as a single product-owned motif and puts the evidence-to-next-action loop inside the interface itself. It is not a blend with Direction B.

Concept references:

- [Direction A — landing](concepts/direction-a-landing.png)
- [Direction A — dashboard](concepts/direction-a-dashboard.png)
- [Direction B — landing](concepts/direction-b-landing.png)
- [Direction B — dashboard](concepts/direction-b-dashboard.png)

The concept images are exploratory references, not implemented screens and not authoritative product data.

## Candidate comparison

| Criterion | Direction A — Learning Field Guide | Direction B — Evidence Notebook |
| --- | --- | --- |
| Product fit | Directly represents goal → evidence → next action. | Represents study and evidence through literal stationery. |
| Backend truth | Works well with measured, unassessed, available, locked, and staged states. | Can show states, but the desk metaphor risks making self-reported checklist items feel equivalent to evidence. |
| Navigation | Naturally supports Home, My Path, Learn, Practice, Progress. | Supports the same labels but turns the whole shell into a notebook/workbench. |
| Responsive scaling | Path becomes a vertical sequence or list on mobile. | Layered paper, props, tabs, and texture become crowded or must be discarded on mobile. |
| Performance | Can be built mainly with typography, flat color, icons, and existing product UI. | The rendered desk/plant/books/texture would require heavy imagery or an inauthentic CSS imitation. |
| Maintainability | A small set of motifs and layout templates can span all routes. | Risk of many one-off paper objects, rotations, shadows, and faux physical details. |
| Audience tone | Supportive, directional, credible for students. | Warm and memorable, but more nostalgic/craft-themed than product-centered. |
| Risk | Could become generic if reduced to repeated cards or decorative roads. | Could become themed decoration that competes with the learning task. |

## Why Direction A wins

1. **The motif comes from the product.** A path is not decoration; prerequisites and next actions are actual Skillmetry data.
2. **It clarifies truth states.** Nodes can show measured, unassessed, available, prerequisite-blocked, activity-only, and staged states without inventing progress.
3. **It scales across the product.** The same visual grammar can support landing explanation, dashboard action, roadmap sequence, assessment progression, and history.
4. **It survives mobile.** A horizontal route can become a vertical rail without losing meaning or requiring a large image.
5. **It preserves performance.** Most expression can come from composition, type, flat color, and Lucide icons.
6. **It keeps the product UI as the proof.** The landing page can show the actual goal/evidence/next-action relationship rather than an abstract marketing illustration.

## Direction A rules

### Core idea

On this product, the prerequisite path becomes the organizing line.

Use the path motif at three scales only:

- macro: one compositional route through a hero or dashboard;
- component: a sequence connecting goal, evidence, and next action;
- micro: a restrained node/bullet for ordered states.

Do not introduce extra motifs—no unrelated blobs, paper scraps, orbit diagrams, or decorative charts.

### Composition

- Prefer one dominant action region plus one supporting evidence region.
- Use asymmetry and whitespace, not a uniform three-column card grid.
- Allow flat color fields to create sections.
- Keep complex product fragments at readable size; do not shrink a full dashboard into an illegible hero screenshot.
- Use a linear/list path as the default and reveal graph complexity only when useful.

### Landing proposal

First viewport:

- concise navigation and sign-in;
- statement: “Know what to learn next.”;
- support copy that names authenticated quiz evidence;
- primary CTA to choose a goal;
- secondary explanation link;
- a real product fragment showing Goal → Available assessment/evidence → Next action;
- a compact three-stage explanation below the fold.

The generated concept’s product-led composition is approved as reference. Its exact logo, icons, copy, status badges, and invented example content are not implementation specifications.

### Home proposal

Use a “Now / Why / What changed” hierarchy:

1. **Now:** one next action tied to the learner’s selected path.
2. **Why this:** the prerequisite/evidence reason and availability.
3. **What changed:** the latest trusted evidence or a clear unassessed state.
4. **Continue learning:** one optional activity, labeled unscored.

Do not implement the concept’s decorative motivational quote. It violates the product’s grounded voice and adds no task value.

### My Path proposal

- Stage sections: Foundation, Core, Applied.
- Each skill row/node exposes status, availability, and prerequisite reason.
- Unknown state is text-first: “Not assessed.”
- Default desktop view should not require pan/zoom.
- A graph may remain as an optional “Explore relationships” mode.

### Learn proposal

- One focused recommendation at top.
- Resource and course catalogs below, filtered by path and skill.
- A persistent, low-emphasis note: “Learning activity is not scored.”

### Practice proposal

- Two clear modes: Assess and Practise.
- Assessment uses a calm paper-like reading surface because concentration matters, but this is a component treatment—not the site-wide notebook metaphor.
- Guided practice uses grouped challenge navigation and label-wrapped answers.

### Progress proposal

- Overview leads with coverage and evidence provenance.
- Measured and Not assessed receive equal clarity, not equal numeric treatment.
- History is a timeline/table, not a decorative chart.
- Hypothetical scenarios remain outside the trusted evidence canvas.

## Palette

Preserve the approved palette exactly as the brand foundation:

- Warm paper: `#F2E8CF`
- Forest: `#174C3C`
- Golden mustard: `#DDA03A`
- Terracotta: `#A44A2A`
- Near-black: `#111111`

Tints may be derived for backgrounds and borders, but no new hue should become a brand color. Semantic success/error/warning colors must remain distinguishable in text and iconography and cannot rely on hue alone.

## Typography

Retain the installed type stack for performance and continuity:

- Bricolage Grotesque: display and important section headings.
- Instrument Sans: interface, navigation, forms, and long copy.
- IBM Plex Mono: evidence IDs, dates, versions, and terse technical metadata only.

Reduce uppercase micro-labels and monospace decoration. Headings should be sentence case and no more than two lines at target widths.

## Imagery and iconography

- Product UI is the primary visual proof.
- Use Lucide icons consistently.
- Prefer real Skillmetry interface details over stock student photography.
- No generated character art, 3D scenes, glowing graphics, or generic technology imagery.
- If real student/project imagery is added later, it must be truthful, consented, optimized, and secondary to the product task.

## Motion

- Motion is functional: page arrival, path-state change, disclosure, and progress between assessment questions.
- Use `opacity` and `transform` only for most transitions.
- Typical duration: 160 ms for control feedback; 240 ms for panels; up to 500 ms for one signature landing/path transition.
- Never use `transition: all`.
- Respect reduced motion and disable non-essential path drawing or travel.
- Avoid perpetual animation, parallax, or scroll-jacking.

## Explicit rejections from both generated concepts

- No decorative motivational quote.
- No fake goal progress, completion state, score, date, or learner identity.
- No literal photographic desk, plant, coffee, notebook, or stacked-book set.
- No handwriting font or faux sticky notes.
- No excessive card nesting, pill badges, drop shadows, or ornamental texture.
- No unique navigation system inside a hero preview that conflicts with the real product IA.

## External reference principles used

- Vercel Web Interface Guidelines informed focus, reduced-motion, labeling, overflow, safe-area, and async-state requirements.
- The reviewed DESIGN.md example from the VoltAgent collection was used only for abstract principles: show the live product early, keep geometry sober, and define a small type/spacing system. Its brand palette, copy, and signature assets are not reused.
- The design-taste direction exercise suggested “one motif” and “page is the object.” Direction A adopts the product-owned path motif; Direction B explored and ultimately rejected the literal object approach.

References:

- <https://github.com/vercel-labs/web-interface-guidelines>
- <https://github.com/VoltAgent/awesome-design-md>
