# V3 — Content-first learning experience

**Source stage:** `feat/content-first-workspace-v3`. No hosted Supabase migrations, paid AI calls, deploy or account changes.

## What changes for students
- Learning desk is the primary view on `/resources`: select one of 18 canonical skills, then choose **Documentation**, **Video lectures** or **Quick notes**. Everything stays in the same concise interface.
- External educational providers (official docs, freeCodeCamp and other publisher-hosted guides) own their lessons. Skills remain mapped to the verified catalog and supported assessments. Some provider URLs open an article that embeds a video, rather than opening YouTube directly.
- Notes are brief original recaps and a suggested mini-challenge; checkboxes track **only this browser session**, not cloud completion, skill proficiency or streak.
- Original ~61 curated resources, career roadmaps, filters and recommendation explanations stay accessible within a collapsed advanced catalog. This preserves feature coverage without crowding the first screen.
- All 15 student workspace routes now show a compact page-specific purpose and two meaningful adjacent actions. The header and title density have been reduced; dashboard and roadmap decorative space also shrinks.
- Old colors, trusted quiz scoring, profile state, database APIs and existing URLs remain intact.

## Content policy and caveats
- Lecture links were selected from recognizable educational publisher pages and several high-confidence YouTube courses. No course content is copied, uploaded or claimed as Skillmetry-owned.
- Titles are descriptive, not guaranteed to stay unchanged. Provider pages and YouTube videos can be moved or restricted. The link list requires periodic manual availability review.
- Do not call all external courses officially certified/skill verified. Learning content and Skillmetry quiz evidence are separate.

## Required quality validation
- TypeScript, lint, unit tests, production build, static release/privacy verification, HTTP smoke.
- Browse all 15 student routes at 1440px, 1024px, 768px and 390px. Verify keyboard navigation/ARIA focus, scroll, no overlaps and resource content fits the first screen on desktop.
- Validate every external course by opening it from a browser; formal provider link monitoring is not implemented.
- Novice usability: select React, switch docs → video → notes; locate a practice action; find full catalog if needed. No claims about actual improvement until tested.

## Follow-up
- Admin CMS for versioned notes, lectures, uploads, roadmaps and publishing controls as a separate feature with secure RBAC and audit history.
- In-platform richer lessons, notes editor and video progress must not silently award trusted assessment scores.
