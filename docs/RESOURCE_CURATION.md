# Phase B3 — Curated resource decisions (2026-10-15)

Source: [liuchong/awesome-roadmaps](https://github.com/liuchong/awesome-roadmaps), an external curated index. Individual creators/providers retain ownership of their work. Skillmetry links out, stores short editorial descriptions, and does not copy curricula or claim these paths are Skillmetry-authored.

## Scope and baseline

- Four supported careers: ML Engineer, Frontend Developer, Backend Developer, Full Stack Developer.
- Eighteen canonical skills and four optional tools (Git, GitHub, Docker, Postman).
- Preserve the original **50** skill/tool guides; add **11** discovered resources, for **61** total. Ten are classified as roadmaps and one (Microsoft AI for Beginners) is a course.
- External paths are supplementary **career context**, not replacements for the adaptive Skillmetry dependency graph or trusted quiz evidence.
- Source was inspected in its README; direct link existence and freshness require periodic revalidation. `unverified` means a destination was not conclusively checked, not that the link is malicious.

## Accepted discovered links

| Curated ID | Provider | Coverage | Format |
| --- | --- | --- | --- |
| roadmap-frontend-yousha | Yousha | Frontend, Full Stack | Roadmap |
| roadmap-frontend-learning-kit | Sadanand Pai | Frontend, Full Stack | Roadmap; PDF destination not conclusively verified |
| roadmap-backend-gfg | GeeksforGeeks | Backend, Full Stack | Roadmap |
| roadmap-fullstack-gfg | GeeksforGeeks | Full Stack | Roadmap |
| roadmap-ai-microsoft-beginners | Microsoft | ML foundations | Course with lessons and labs |
| roadmap-data-scientist-mrmimic | MrMimic | ML, data processing | Roadmap |
| roadmap-devops-milanm | Milan Milanović | Backend, ML, Full Stack | Roadmap |
| roadmap-mathematics-talal | Talal Alrawajfeh | ML mathematics prerequisites | Roadmap |
| roadmap-devroadmaps-rudra | DevRoadmaps contributors | Four careers; broad reference | Roadmap |
| roadmap-data-analyst-mtahiraslan | M. Tahir Aslan | ML/data and SQL | Roadmap |
| roadmap-sql-gfg | GeeksforGeeks | Backend, Full Stack, ML | Roadmap |

The actual URLs, skill tags, optional tool tags, cost and verification metadata live in `shared/data/curated-roadmaps.ts`; this document is not a second source of truth.

## Considered but deferred

- `adam-golab/react-developer-roadmap`: the README explicitly describes a **2019** roadmap, including dated ecosystem recommendations. Keep modern React documentation and the newer frontend paths primary instead.
- `aliyr/Nodejs-Developer-Roadmap`: older (2019) guide; current backend and general developer roadmaps are more suitable for top recommendations.
- `dswh/ai-engineer-roadmap`: specifically LLM API/RAG/agents. Skillmetry's current `ml-engineer` canonical track is broader foundational ML, so importing as an equivalent ML-career assessment path would misrepresent coverage.
- Java, Angular, PHP, iOS, game-development and cybersecurity tracks: currently outside Skillmetry's four supported careers and canonical skill IDs.

## Recommendation & trust rules

- Prefer the learner's **selected career** and **NOW/NEXT/LATER** goal signals. Explicit curated career tags are binding even when a generic skill overlaps another career.
- For each canonical skill, trusted server-graded score evidence can suggest relative resource difficulty; missing evidence means **not assessed**, never numerical zero.
- Cap roadmap-heavy recommendations when diverse tutorials/docs/practice are available. An all-roadmap fallback is permitted only for a narrow catalog.
- Never feature resources marked `unavailable`; `unverified` results can still be browsed but are de-prioritized.
- No link click or external course completion changes quiz scores or Digital Twin mastery.

## Maintenance

Review changed source links before adding new entries. Use `node scripts/validate-resource-links.mjs` (network-required; `INACCESSIBLE` or `UNVERIFIED` need manual follow-up), plus the catalog/unit tests. Record broken links as `verificationStatus: "unavailable"` rather than silently removing historical source references. Keep duplicated destination URLs and unknown skill/career IDs out of the catalog.

## B3.3 acceptance walkthrough

1. Open a selected career's internal Skillmetry Roadmap. Follow **Explore career roadmaps**; confirm the Resources page loads the matching career and Roadmaps filters (not a new skill score).
2. Switch between `/resources?career=frontend-developer&format=roadmap` and `/resources?career=ml-engineer&format=roadmap` without a full reload. No ML-only roadmap should show under frontend.
3. Filter to an unmatched search, then choose **Reset filters**. All categories and URLs should reset; results must reappear.
4. Confirm both the personalized and featured rows honor search/type/career filters, and a roadmap is not duplicated in those two rows.
5. A broad external roadmap must show its original provider and `awesome-roadmaps` discovery attribution, but not an irrelevant "Take assessment" action inferred from its catalog anchor tag.
6. On phone widths and keyboard navigation, verify filter labels, button focus, and safe HTTPS external links. Desktop/mobile visual QA remains a release gate, not a claim of completed browser testing.

No learning resource click changes any Digital Twin numeric score. Only server-graded assessments can produce trusted skill measurements.
