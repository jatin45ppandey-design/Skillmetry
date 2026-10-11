# Skillmetry design system

## Product character

Skillmetry is a focused career intelligence workspace, not a generic analytics dashboard. The interface uses restrained deep navy surfaces, cyan for actionable information, green for evidence-backed positive states, and amber for caution or hypothetical states.

## Visual hierarchy

- Use one clear page title and one primary task per screen.
- The adaptive roadmap and next executable skill are the product's main visual focus.
- Keep role coverage contextual: always label it as a weighted skill coverage index, never employability or hiring probability.
- Prefer structured lists and tables over collections of decorative metric cards.
- Use gradients only to add subtle depth to major focus areas.

## Core tokens

- Background: `#07101B`
- Raised background: `#0B1625`
- Panel: `#101D2E`
- Border: `#21344A`
- Primary text: `#F1F6FB`
- Muted text: `#91A3B7`
- Accent/action: `#22D3EE`
- Success/strong: `#44D6A2`
- Warning/hypothetical: `#F1B868`

## Interaction rules

- Every action must work with keyboard and touch; hover is enhancement only.
- Use visible focus rings and minimum 40px touch targets.
- Mobile uses a primary bottom navigation plus a complete navigation drawer.
- Respect `prefers-reduced-motion` and avoid motion that conveys required information.
- On small screens, replace the interactive graph with an accessible skill list and detail panel.

## Trust language

- `Claimed`: student self-report.
- `Assessed`: result from a bounded check.
- `Demonstrated`: reviewed practical evidence.
- `Verified`: trusted review under an explicit policy.
- `Hypothetical`: simulator-only result that never mutates actual progress.

Empty, loading, and error states must state what is unavailable, preserve the student's data, and offer a safe next action where one exists.
