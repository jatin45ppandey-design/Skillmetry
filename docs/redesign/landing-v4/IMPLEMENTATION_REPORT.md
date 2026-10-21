# Skillmetry — Landing Skill Atlas V4

## Scope and provenance

Branch: `design/landing-skill-atlas-v4`

Base: clean published Milestone B final-polish commit `85b5787`. This intentionally **does not include the user's unpushed Milestone C, Landing 2.0 or Experience 3.0 local changes**. Do not merge this branch blindly into that work; compare first and cherry-pick/reconcile Landing-only files.

This work changes the landing page and one scroll-reveal helper shared by legacy landing surfaces. No backend, API, database, secrets, feature flags, workspace routes, or hosted environment were changed.

## Implementation

- Replaced an oversized static headline/flat-card hero with an editorial composition and one interactive learning-map artifact.
- Added keyboard-accessible Goal / Evidence / Next Step tabs, honest quiz availability metadata, and available links.
- Replaced flat section banners with a connected four-stage learning narrative (neutral numbered stages, no fictional completion checkmarks).
- Built a real catalog-backed career blueprint: four existing careers; Foundation/Core/Applied skill nodes; edges drawn only for actual catalog prerequisites; click-to-inspect skill; career handoff to validated onboarding parameter.
- Used a meaningful three-state evidence ledger: server-graded measurement, unknown/not assessed, unscored activity.
- Included skill-scoped links into existing resources and lab routes; available assessment metadata is taken from the enabled public assessment catalog only.
- Compact, section-specific closing CTA and footer.
- One scoped new CSS layer with desktop/tablet/mobile fallbacks, keyboard focus, visible-by-default scroll reveal and reduced-motion support.
- Updated source-contract tests to assert the new visible landing implementation instead of requiring the removed landing wrapper strings.

## Files

- `frontend/src/app/page.tsx`
- `frontend/src/components/landing-atlas-v4.tsx`
- `frontend/src/app/landing-atlas-v4.css`
- `frontend/src/app/layout.tsx` (scoped CSS import only)
- `frontend/src/components/landing-scroll-motion.tsx` (supports new selector)
- Three landing-related source assertion test files.
- This report.

## Verification and limitations

**Not claimed:** full Next.js build, TypeScript/lint/test run, Playwright screenshots or authenticated browser workflows. The remote GitHub connector allows text commits but does not provide the user's local dependency environment. CSS brace structure and source/test contract alignment were inspected. The user should run the normal existing project checks in a local checkout and inspect 1440, 1024, 768, 390 and 320px screenshots before approval.

Known risk: this new branch originates from published Milestone B because the locally completed Experience 3.0 version was not pushed to GitHub. Those histories should be integrated deliberately, keeping Milestone C's functional fixes.

## Visual acceptance checklist

- Inspect hero alignment and interaction density at desktop + mobile.
- Verify public navbar never occludes anchored section headings.
- Check hero tabs with mouse, touch, keyboard and reduced-motion preferences.
- Switch all four careers and verify valid highlighted prerequisite edges, selected skill details and onboarding handoff.
- Verify links to skill-specific resources, lab, and enabled assessments.
- Inspect all sections at intermediate widths and with 200% zoom.
- Ensure no cross-route styling changes or false evidence claims.
- Repeat typography, spacing and motion critique based on actual rendered screenshots.

**Status: LANDING V4 CODE IMPLEMENTED ON REMOTE BRANCH — BUILD AND VISUAL REVIEW REQUIRED.**
