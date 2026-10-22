# Skillmetry Landing 2.0 — Implementation Notes

Completed: 2026-10-20  
Branch: `milestone-c-complete-product-experience`  
Direction: Evidence Notebook 2.0 — Editorial Learning Experience

## Outcome

The public landing page now presents Skillmetry as a connected learning decision rather than a sequence of oversized marketing blocks. The real product loop—career goal, trusted assessment evidence, and a grounded next action—is the visual subject throughout.

The work is isolated to the landing page, its directly related components, a scoped CSS module, landing source-contract tests, and this review record. Existing Milestone B/C application work, APIs, authentication, scoring, database behavior, feature flags, and workspace screens were not changed.

## Product and visual changes

- Rebuilt the hero as a compact two-column composition with a genuine, keyboard-operable Goal → Evidence → Action preview.
- Brought truthful proof into the first mobile viewport: catalog counts, account-free exploration, the primary action, and the no-score-without-a-trusted-quiz boundary.
- Replaced the flat process band with a connected four-stage learning loop: choose a goal, take an assessment, read the evidence, learn and reassess.
- Expanded the career selector into a catalog-derived Career Blueprint. Each of the four real careers now exposes foundations, core/applied skills, canonical prerequisites, active assessment entry points, and working resources/practice/assessment destinations.
- Preserved the selected-career handoff through `/onboarding?career=…`; browser verification confirmed `frontend-developer` was preselected in onboarding step two.
- Replaced the large evidence slogan with a compact evidence ledger that distinguishes measured assessment evidence, unknown/not-assessed state, and unscored learning activity without fabricated values.
- Replaced the oversized closing section with one compact action and a restrained footer.
- Kept the exact approved palette: `#FBF5EA`, `#283C30`, `#C7E2BE`, `#F4B78D`, `#D5C1EB`, `#C6DDF2`, and `#D9ED82`.
- Used one scoped `landing-v2.module.css` rather than adding another global override layer. The existing Milestone B application stylesheet remains untouched.

## Visual feedback loop

### Baseline critique

Seen in one second: an oversized headline beside three colored rows.  
Idea: present, but it stopped after the hero.  
Live thing: the career selector changed a basic two-list preview.  
Primary issues: excessive hero dead space, a disconnected flat-blue process section, a shallow career explorer, and repetitive oversized evidence/closing statements.

### Refinement pass 1

Implemented the integrated decision preview, connected journey, full career blueprint, evidence ledger, learning preview, and compact closing section.

Rendered issues found and corrected:

1. The hero still broke into three oversized lines at desktop/tablet.
2. The preview still read too much like three equal horizontal rows.
3. The 320 px header wrapped both account actions and the page became unnecessarily tall.

### Refinement pass 2 / final

The hero is now a deliberate two-line lockup at all required widths. Preview cards are staggered around one evidence rail; the mobile header keeps one action; blueprint density is reduced without hiding the required catalog relationships; all visible headings stay within two lines.

Final layout words: hero=editorial split / journey=connected rail / careers=index plus blueprint / evidence=ledger / close=action strip.

Brief-aligned critique: design 8.2 · usability 8.8 · creativity 8.1 · content 9.0 → 8.4 overall. The formal Taste inspector remains capped because its general-purpose rubric requires photography/footage and classifies the three real product-state cards as a generic icon-card row. Those two rules were not followed because the approved brief explicitly rejected arbitrary photography and required the actual Goal → Evidence → Next Action interface as the hero subject.

## Browser and accessibility verification

The official `@playwright/cli` package was run through `npx` without adding a project dependency.

Verified at 1440×900, 768×1024, 390×844, and 320×720:

- `documentElement.scrollWidth === innerWidth` at every viewport.
- The primary CTA and truthful catalog proof are fully visible before the 320 px first viewport ends.
- No heading exceeded two rendered lines.
- No unnamed button, input, select, or textarea was found.
- All interactive buttons measured at least 44 px in both dimensions; brand links were raised to a 44 px target.
- The first Tab focuses the visible “Skip to content” link with a solid outline.
- `prefers-reduced-motion: reduce` produced `0.00001s` transitions.
- The Evidence tab changed to `aria-pressed="true"`.
- Selecting Frontend Developer updated the blueprint and produced `/onboarding?career=frontend-developer`; onboarding then marked Frontend Developer `aria-pressed="true"`.
- A fresh production-browser session reported zero console errors and zero console warnings.

Dedicated screen-reader software and browser-native 200% zoom were not available. Semantic structure, names, keyboard focus, target sizes, narrow effective layouts, reduced motion, and overflow were checked directly; final assistive-technology review remains a manual approval item.

## Taste and interface guideline results

- Taste source lint: 0 failures, 0 warnings.
- Final rendered inspector: 2 failures and 4 warnings. The remaining findings are deliberate brief exceptions: no unrelated photography/footage, the three actual decision-state UI cards, the locked cream palette, the wider editorial type scale, and restrained motion (11 measured elements).
- The earlier inspector findings for tiny readable text, page-scale `data-ui`, eyebrow labels, and footer wordmark contrast were fixed before the final render.
- Web Interface Guidelines review: semantic links/buttons, visible focus, 44 px controls, heading hierarchy, skip link, active/pressed state, no horizontal overflow, and reduced-motion handling passed for the modified landing files.

## Screenshots

All artifacts are in `docs/redesign/landing-v2/screenshots/`.

Before:

- `before-1440x900.png`
- `before-768x1024.png`
- `before-390x844.png`
- `before-320x720.png`
- `before-full-1440.png`
- `before-full-390.png`

Final after:

- `after-1440x900.png`
- `after-768x1024.png`
- `after-390x844.png`
- `after-320x720.png`
- `after-full-1440.png`
- `after-full-390.png`

Intermediate review evidence is retained as `pass-1-*` and `pass-2-*` screenshots.

## Verification results

- `npm run typecheck` — passed.
- `npm run lint` — passed with 0 errors and 13 pre-existing warnings outside the landing scope.
- Focused landing/experience tests — 3 files and 17/17 tests passed.
- `npm test` — passed: 59 files and 263/263 tests.
- `npm run build` — passed with Next.js 15.5.27; 31/31 static pages generated and build traces completed.
- Taste source lint — passed with 0 failures and 0 warnings.
- `git diff --check` — recorded during final worktree review.

## Changed files

- `frontend/src/app/page.tsx`
- `frontend/src/app/landing-v2.module.css`
- `frontend/src/components/landing-journey-preview.tsx`
- `frontend/src/components/career-chapter-gallery.tsx`
- `frontend/src/components/landing-scroll-motion.tsx`
- `tests/landing-v2.test.ts`
- `tests/experience-v2.test.ts`
- `tests/signal-interface.test.ts`
- `tests/phase1-4-ux.test.ts`
- This note and the screenshot artifacts listed above.

No dependency, backend, Supabase, scoring, database, feature-flag, deployment, commit, push, rebase, merge, or hosted-infrastructure change was made.
