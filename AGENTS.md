# Skillmetry — Codex/agent instructions

You are implementing Skillmetry, a quiz-driven career digital twin. Follow these instructions for all code in this repository.

## First actions

1. Read `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/SCORING.md`, `docs/BACKLOG.md`, and `docs/SECURITY.md`.
2. Inspect the current branch, dirty worktree, existing migrations, and environment-variable names before editing. Preserve unrelated changes and never print secrets.
3. Run typecheck, lint, tests, and build; record the evidence and fix relevant failures.
4. Work in small vertical slices and report changed files, behavior, verification, configuration, and limitations.
5. Preserve the established visual identity unless explicitly asked to redesign it.

## Product invariants

- Numerical skill scores come only from valid server-graded quizzes.
- Claimed, project, GitHub, demonstrated, and human-verified scoring are outside the current product.
- Never treat an unassessed skill as 0%. Preserve a genuine server-graded 0% as a measured result.
- The latest valid completed quiz is current; all earlier valid attempts remain immutable history.
- Assessment coverage and measured performance are separate, non-employment metrics.
- A what-if operation is read-only and never persists projected values as actual progress.
- AI cannot invent or alter canonical skill IDs, prerequisites, or assessment results.
- No secret belongs in a `NEXT_PUBLIC_*` variable. Service-role and provider credentials are server-only.
- Cloud user records require validated auth, owner-scoped RLS, explicit grants, and multi-user tests.
- Anonymous demonstration data must be labeled illustrative and never promoted into an account.
- Prioritize labels, visible focus, keyboard use, touch targets, responsive layout, and reduced motion.

## Engineering rules

- Use TypeScript strict mode. Avoid `any` and client-side credentials.
- Validate every API request with a strict Zod schema.
- Keep answer keys in `backend/lib/assessments/question-bank.server.ts`; never import it into client code or expose keys in an API.
- Students may read only their own trusted attempts. Only authenticated, authorized server processes may create grades.
- Keep scoring and graph logic pure and independently tested. Use canonical catalog IDs.
- Do not fetch unknown external URLs or execute student repository code on the server.
- Do not add dependencies for a single simple UI feature without justification.
- Do not reset a hosted database, delete existing user data, expose credentials, force-push, or deploy a migration without explicit approval.

## Immediate priorities

1. Review and explicitly approve the additive assessment migration before any hosted apply.
2. Verify the full auth/profile/assessment/retake flow in staging and rerun multi-user RLS tests.
3. Add platform rate limiting, monitoring, secret rotation procedures, privacy controls, and independent security review before public use.
4. Expand assessment coverage only with versioned, reviewed question sets and matching tests.
5. Keep human review, GitHub/project scoring, AI features, placement prediction, and external roadmap resources out of scope unless the owner explicitly reprioritizes them.

Follow `docs/BACKLOG.md` for current acceptance criteria.
