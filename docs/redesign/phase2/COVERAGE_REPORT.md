# Phase 2 curriculum and resource coverage

Date: 2026-10-22

Curriculum version: `2026.2`

## Coverage summary

| Measure | Count |
| --- | ---: |
| Existing careers integrated | 4 / 4 |
| Existing canonical skills covered | 18 / 18 |
| Topics | 54 |
| Subtopics | 54 |
| Structured lessons | 54 |
| Built-in courses | 18 |
| Preserved resource records | 61 |
| Normalized video additions | 18 |
| Hindi video additions | 4 |
| Total deduplicated resources | 83 |
| Editorially accepted / available | 82 |
| Editorial review pending | 1 |
| Marked unavailable | 0 |

Every skill has three ordered topics—beginner, intermediate, and advanced—with one subtopic and one original lesson per topic. Every topic has at least one primary documentation/course reference, one reviewed video, and one practical task. Practical tasks are self-reported learning activity, not assessment evidence. Numerical proficiency remains restricted to valid server-graded quizzes.

## Skill coverage

| Skill | Topics | Subtopics | Lessons | Distinct mapped references |
| --- | ---: | ---: | ---: | ---: |
| Python | 3 | 3 | 3 | 5 |
| SQL | 3 | 3 | 3 | 5 |
| Math & Statistics | 3 | 3 | 3 | 3 |
| Data Processing | 3 | 3 | 3 | 3 |
| ML Fundamentals | 3 | 3 | 3 | 3 |
| Model Evaluation | 3 | 3 | 3 | 3 |
| REST APIs | 3 | 3 | 3 | 3 |
| Docker | 3 | 3 | 3 | 3 |
| Deployment | 3 | 3 | 3 | 3 |
| HTML | 3 | 3 | 3 | 5 |
| CSS | 3 | 3 | 3 | 3 |
| JavaScript | 3 | 3 | 3 | 5 |
| TypeScript | 3 | 3 | 3 | 3 |
| React | 3 | 3 | 3 | 3 |
| Accessibility | 3 | 3 | 3 | 3 |
| Testing | 3 | 3 | 3 | 3 |
| Node.js | 3 | 3 | 3 | 3 |
| Authentication | 3 | 3 | 3 | 3 |

The four existing career paths retain their canonical skill mappings and now resolve to all three topics for every mapped skill.

## Resource status

- The original 61-resource catalog is preserved by ID and extended rather than replaced.
- The existing English lecture selections from `skill-learning-guides.ts` are normalized into 18 catalog resources and mapped to the appropriate skill topics.
- Four reviewed Hindi videos cover Python, SQL, JavaScript, and Node.js. Language filtering is explicit; no translation or generated metadata is presented as source content.
- All 83 unique HTTPS URLs returned a reachable HTTP response during the 2026-10-22 validator run.
- `roadmap-frontend-learning-kit` remains `unverified` editorially even though its URL is reachable. Reachability is not treated as editorial approval.
- The referenced 227-URL research registry was searched for in known repository and Phase 1 files but was not found. Phase 2 does not invent the missing 144 records or claim they were reviewed.

Run `npm run report:curriculum` for the current machine-readable totals and per-skill gaps. The report currently returns no missing primary-resource, documentation, video, lesson, or practice coverage.
