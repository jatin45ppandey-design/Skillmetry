# Skillmetry — build backlog for Codex

Priority: **P0** working hackathon product; **P1** intelligent integration; **P2** post-hackathon expansion.

## P0 — strong vertical slice

### P0-01: Install, build and CI
- Run `npm install` and commit `package-lock.json`.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` pass.
- Correct any hydration mismatch, accessibility problem or React Flow typing issue.
- Confirm routes and demo on laptop and mobile.
- **Done when:** main branch CI passes and local quick start works from clean clone.

### P0-02: Authenticated profiles + database
- Add Supabase browser/server client utilities and auth session integration.
- Apply/review `supabase/migrations/0001_skillmetry_core.sql`; add catalog seed script.
- Persist onboarding and progress; retain anonymous demo mode.
- Test that Alice cannot read/write Bob's skill/assessment/evidence records.
- **Done when:** profile persists on different devices after sign-in and RLS tests pass.

### P0-03: Trustworthy skill twin
- Separate claimed, assessed, demonstrated and verified states.
- Move scoring and quiz grading to trusted server-only rules (don't ship answer keys to clients).
- Prevent repeated same-question pass farming; define caps and audit.
- Show confidence/evidence strength on UI.
- **Done when:** self-reports alone never create verified badges, and audits show why scores changed.

### P0-04: Rich adaptive roadmap
- Add detail sidebar for selected node: prerequisites, estimated time, resource links, relevant missions.
- Filter to gaps/next actions/completed, keyboard navigation, responsive graph fallback.
- Add dependency-aware next skill queue; don't recommend blocked tasks as executable.
- **Done when:** nodes respond to profiles and show consistent prerequisite logic.

### P0-05: Missions and proof workflow
- Save mission status and student submissions; support project URL and selected skill tags.
- Add simple acceptance rubric, evidence pending/reviewed/rejected states.
- Mission completion alone never marks skill verified.
- **Done when:** student can submit evidence and see a trustworthy review state.

### P0-06: What-if simulator hardening
- Add saved scenario names; estimated effort; comparison between career tracks.
- Include uncertainty text and never update persisted actual proficiency.
- **Done when:** simulated results remain distinct from actual before/after reload.

### P0-07: UX, reliability, demo
- Polished product layout with restrained navy/cyan visual language.
- Error handling, loading states, accessible keyboard controls, responsive screens.
- Seed a realistic profile, record a complete judged demo storyline.
- **Done when:** user completes the end-to-end journey without external API keys.

## P1 — intelligence and evidence

### P1-01: Job description → reverse roadmap
- Limit input length, reject dangerous formats, classify target role.
- Extract skills with server-side LLM, validate JSON schema, map to canonical catalog.
- Let user review extracted skills before adding to their plan.
- **Done when:** arbitrary role descriptions map to explicit known skills or an "unknown" bucket; never invent verified proficiency.

### P1-02: AI Career Copilot
- Restrict context to explicitly permitted fields, target role, skill gap and missions.
- Use a server-side LLM adapter with fallbacks and provider usage controls.
- Responses cite evidence/status context; copilot cannot mutate verification fields.

### P1-03: Optional GitHub evidence
- Connect user-owned repository using authorized credentials or specific public URLs.
- Read minimal metadata, README, language indicators and test presence.
- Present evidence as signals pending review, not automatic mastery.

### P1-04: Shareable Career Passport
- User chooses exactly which records/projects to make public.
- Revocable links, no sensitive details by default, explicit visibility warnings.
- Public endpoint uses safe projection/view and rate limits.

### P1-05: Structured AI missions
- Generate acceptance criteria and effort estimates aligned with known skill IDs.
- Review generated deliverables with deterministic validation; moderation and retries.

## P2 — expansion
- P2-01 Career switch path comparison and transition planning.
- P2-02 College placement preparation view (consent and aggregation).
- P2-03 Skill-based team formation and collaborator matching.
- P2-04 Portfolio generator from consented evidence and timeline.
- P2-05 Mentor review dashboard and comment workflow.
- P2-06 Skill refresh missions and provenance-aware role taxonomy refresh.
- P2-07 Interview simulator and language options.

## Scope decision
Avoid claiming all tasks are built. Demonstrate one high-quality, accurate feedback loop before adding new breadth.
