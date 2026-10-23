# Skillmetry 2.0 Phase 3 coverage

Generated from the canonical catalogs with `npm run report:phase3` and `npm run report:curriculum` on 2026-10-23.

| Area | Verified coverage |
| --- | --- |
| Curriculum | 18 skills, 54 topics, 54 subtopics, 54 lessons |
| Topic practice | 54/54 topic sets, 162 server-checked questions, three per topic |
| Guided coding practice | 23 exercises across 18/18 skills; reference-check-only runtime |
| Diagnostic practice | Four staged diagnostic tracks, five topics per track and five independently authored practice questions per topic (100 total) |
| Projects | 12/12 specified projects, three for each of four careers |
| Resources | 83 reviewed, 82 accepted, one explicitly unverified, zero unavailable |
| Default assessments | Four active skills: Python, SQL, JavaScript and HTML |
| Expanded assessment catalog | Nine staged skills, 90 base questions |
| Topic diagnostics | Four staged banks, 120 pool questions, 15 server-selected questions per attempt |

Assessment breadth is not represented as 18 assessed skills. The remaining skills have learning and practice coverage but no fabricated numerical proficiency. The five expanded assessment tracks beyond the four defaults remain staged, and diagnostic recommendations only appear from real topic evidence when the diagnostic rollout is enabled.

## Relationship checks

- Every curriculum lesson resolves to its topic practice ID.
- Every topic practice resolves back to a real topic, skill, lesson and reviewed resource context.
- Every project resolves to a canonical career and primary skill and includes lesson/practice/resource handoffs.
- Every revision recommendation resolves through deterministic diagnostic-to-topic mapping and preserves the related assessment ID for reassessment.
- The project seed uses canonical career/skill foreign keys and `on conflict (id) do nothing`; local pgTAP includes both seed IDs and relationship insertion checks.

## Browser evidence

- `screenshots/practice-desktop.png`: 1440px topic catalog and filters.
- `screenshots/topic-practice-tablet.png`: 768px graded practice review and revision handoff.
- `screenshots/revision-mobile.png`: 390px deterministic revision plan and truthful signed-out/staged states.
- `screenshots/projects-320.png`: 320px project specifications, curriculum links and learner-evidence controls.

