# Skillmetry — Codex/agent instructions

You are implementing **Skillmetry**, an evidence-aware career digital twin. Follow these instructions for all code in this repo.

## First actions
1. Read `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/SCORING.md`, `docs/BACKLOG.md`, `docs/SECURITY.md`.
2. Run `npm install` (generate `package-lock.json`), `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Record and fix issues first.
3. Work in small vertical slices; provide a summary of files changed, user-facing behavior, test results, and incomplete tasks.
4. Do not rewrite the visual identity or rename product unless explicitly asked.

## Product invariants (do not violate)
- Distinguish **claimed**, **assessed**, **demonstrated** and **verified** skill status. Never mark a checkbox or GitHub link as definitive skill mastery.
- A what-if operation is read-only. Never persist projected scores as actual proficiency.
- Readiness index is a role-weighted estimate (0–100), never hiring chance or validated employment prediction.
- AI cannot invent/alter canonical skill IDs, prerequisites or assessment results. Validate AI output through a schema.
- No secrets in `NEXT_PUBLIC_*` except explicitly safe public config. Service role tokens/API keys only on server.
- All cloud user records must have working auth + owner-based RLS; test with separate users.
- Prioritize accessible interactions: labels, focus visibility, keyboard use, responsive layouts, and reduced-motion support.

## Engineering rules
- TypeScript strict mode. Avoid `any` and client-side exposure of API credentials.
- Keep core scoring and graph logic pure and independently tested. Use source-of-truth catalog IDs.
- Validate every API request with Zod; add rate limits, size limits, and error handling for AI endpoints.
- Do not fetch unknown external URLs or execute student repository code on the server.
- Keep generated AI content clearly distinguished from verified outcomes.
- The current assessments are demo-only with answer keys in client code; move evaluation server-side before production.
- No npm dependencies just for one simple UI feature unless justified.
- Preserve full feature scope in backlog, but **ship P0 before P1/P2**.

## Immediate prioritized tasks
1. **P0-01** Stable install and baseline CI. Generate lockfile, fix types/tests/build.
2. **P0-02** Real persistence: Supabase Auth, SSR client/server helpers, private user rows, migrations and RLS tests. Local demo mode stays available.
3. **P0-03** Split self-reported vs assessed proficiency, and server-validate all assessment attempts.
4. **P0-04** Skill graph interactions: details panel, filters, prerequisite validation, meaningful node states.
5. **P0-05** Mission workflow: submission status, rubric, evidence, review and recalculation.
6. **P1-01** AI job description normalizer (server-only Gemini key, JSON schema and human review).
7. **P1-02** Twin-aware Copilot; never allow it to mutate verified state.
8. **P1-03** Optional GitHub evidence; metadata is not proof.
9. **P1-04** Opt-in shareable career passport with link revocation.

Follow `docs/BACKLOG.md` for detailed acceptance criteria.
