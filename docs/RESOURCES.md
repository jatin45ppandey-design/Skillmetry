# Phase B3 — Curated Resource Library

## Scope and source

Source: https://github.com/liuchong/awesome-roadmaps

This is an aggregator of external roadmaps, not the author of their contents. Skillmetry links directly to original providers, records source attribution separately and preserves the original 50 learning resources.

## Accepted additions (11)

| Original provider | Item | Type |
| --- | --- | --- |
| Yousha | Frontend Developer Roadmap | roadmap |
| Sadanand Pai | Frontend Learning Kit — 2024 roadmap PDF | roadmap (unverified PDF link) |
| GeeksforGeeks | Backend Developer Roadmap | roadmap |
| GeeksforGeeks | Full Stack Developer Roadmap | roadmap |
| Microsoft | AI for Beginners | course |
| MrMimic | Data Scientist Roadmap | roadmap |
| Milan Milanović | DevOps Roadmap 2026 | roadmap |
| Talal Alrawajfeh | Mathematics Roadmap | roadmap |
| DevRoadmaps contributors | Developer Career Paths | roadmap |
| M. Tahir Aslan | Data Analyst Roadmap | roadmap |
| GeeksforGeeks | SQL Roadmap | roadmap |

Older candidate alternatives (including a 2019 React roadmap and a 2022 AI Expert roadmap) are not prioritized; their current usefulness would need a fresh review. Unrelated mobile, game and security paths were out of scope for the existing four careers.

## Implementation contracts

- Four careers, eighteen canonical skills and four optional tools remain unchanged.
- `relatedSkillIds`, `relatedToolIds` and `careerIds` enable a resource to match multiple learning targets without adding fictional skill scores.
- `discoverySource` records the list where a resource was found; `provider` credits the original creator.
- `roadmap` is a distinct resource type. The Microsoft curriculum remains a `course`.
- Recommendations remain explainable and deterministic; career match, skill prerequisites and trusted overall assessment scores influence ordering.
- External links never update the Digital Twin, record completion or substitute for Skillmetry's own roadmap.
- The resource validator checks both the existing and new catalog files; network-based validation is environment-dependent.

## Verification and remaining caveats

GitHub Actions performs typecheck, lint, unit tests and a production build. The PDF source remains marked unverified until the raw PDF destination is checked. Third-party roadmaps change independently of this repository.
