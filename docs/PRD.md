# Skillmetry — Product Requirements (PRD)

## Product vision
Skillmetry is an **adaptive, evidence-aware career digital twin** that helps students understand their abilities, select useful projects and explore career development scenarios.

**Promise:** *Measure Your Skills. Shape Your Future.*

### Primary user
Students and early-career learners who can identify a target role but struggle to map what they already know, which competencies actually matter and what to do next.

### Core jobs to be done
1. Discover/choose a career direction.
2. Build a transparent baseline skill profile without unnecessary personal documents.
3. Understand gaps against a curated role graph, including prerequisites.
4. Compare the potential benefits and costs of learning choices.
5. Complete structured missions and demonstrate improvement with assessments/evidence.
6. Recompute recommendations as demonstrated abilities evolve.

## P0: minimal end-to-end journey
- Anonymous local onboarding: first name, goal, self-ratings, with clear self-report disclaimer.
- Three curated tracks: ML Engineer, Frontend Developer, Backend Developer.
- Accessible dashboard with target role, weighted readiness coverage and top gaps.
- Zoomable skill DAG with blocked/available/strong node states.
- Scenario simulator that compares baseline to **hypothetical** skill adjustments; no actual state mutation.
- Mission catalog with deliverable checklists and explicit verification policy.
- Short foundational assessments, locally scored for prototype only; production version server-scored with attempt limits.
- Student can see any recognized demonstration separately from self-reported proficiency (planned P0 upgrade).

## P1: advanced features
- Authenticated cloud twin persistence and evidence tracking.
- Rich missions with submit/review cycle, structured rubrics, peer/mentor validation.
- Gemini-assisted next mission generation constrained by curated skills.
- Job-description parser: extracted requirements, mapped skill IDs, user-review step, reverse roadmap.
- Context-aware Career Copilot, with transparent data access and no score modification permissions.
- Optional GitHub connect/repo URL analysis as **weak corroborating evidence**, not automatic expertise certification.
- Consent-driven shareable career passport with revocable links.

## P2: ecosystem expansion
- Placement cell dashboard with aggregated permission-aware insights.
- Career switch shortest-path recommender using overlapping skills and prerequisites.
- Team formation based on demonstrated complementary skills.
- Portfolio generator with share-selected evidence.
- Mentor review interface and skill refresh suggestions based on stale evidence.
- Updated role-taxonomy ingestion with sources/versioning, not unverified market claims.
- Interview practice; multi-language accessibility; notifications only with explicit consent.

## Non-goals
- Predicting actual hiring probability or making employment eligibility decisions.
- Automatic confirmation of proficiency from a resume/GitHub repository.
- Scraping job boards without permission or reliable provenance.
- Copying roadmap.sh branding, assets, or proprietary content.

## Demo narrative
Student chooses ML Engineer → initial skill twin → deployment gap → explores Docker/ML API missions → projected readiness changes without committing → completes a quiz → the assessment contributes limited evidence to the actual twin → new next-best actions.

## Success criteria
- Onboarding-to-first-simulation in under five minutes on a normal laptop.
- No selected scenario ever alters actual persisted proficiency.
- Same role + same inputs yield identical readiness score.
- Different user inputs lead to meaningfully different gap rankings.
- AI failures do not break deterministic core experience.
- All personal data is private by default.
- Accessible interaction works with keyboard and mobile viewport.

## Brand notice
"Skillmetry" is the preferred **working name**. Perform domain/trademark checks before public commercialization; similar name usage may exist.
