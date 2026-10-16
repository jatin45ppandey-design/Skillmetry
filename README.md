# Skillmetry

**Measure Your Skills. Shape Your Future.**

Skillmetry is a responsive career digital twin for students. A student chooses a target career, completes secure foundational quizzes, and sees an assessment-derived skill profile, history, coverage, roadmap, and clearly labeled hypothetical scenarios.

> **Development status — quiz-driven MVP.** Supabase SSR authentication, private profile persistence, server-only assessment grading, immutable attempt history, owner-scoped RLS, and an anonymous illustrative demo are implemented. Unassessed skills remain unknown; they are never displayed as 0%. The product does not claim hiring probability, professional readiness, human verification, or project/GitHub-derived skill scores.

**P3–P6 staged learning workspaces (2026-10-16):** The roadmap/Digital Twin now distinguish unscored learning activity from assessed skill evidence, and the repository includes a weekly study planner, a safe guided coding lab, and learner-reported project mission workflows. The lab can run without cloud persistence; the planner offers an explicitly unsaved preview. Private task, practice and mission storage requires `202610160004_learning_workflows.sql` and `NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED=true`, both **unapplied/disabled by default**. See [P3–P6 rollout status](docs/P3_P6_IMPLEMENTATION.md).

**P7–P10 source implementation (2026-10-16):** Skillmetry now includes canonical job-description parsing with private opt-in saved requirement summaries, an optional consent-based AI tutor with curated non-AI guidance, printable private Career Passport, staged expiring/revocable share URLs, and additional browser/security/release checks. AI requests and public passport sharing are **disabled by default**. Hosted database migrations and cloud configuration have not been applied. See [P7–P10 release status](docs/P7_P10_IMPLEMENTATION.md), [operations](docs/OPERATIONS_RUNBOOK.md) and the [project backlog](docs/BACKLOG.md). This is not a claim of a completed public-production launch.

## Getting started

Prerequisites: Node.js 22, npm, Git, and optionally Docker for local Supabase.

```powershell
npm install
Copy-Item .env.example frontend/.env.local # optional; anonymous demo works without keys
npm run dev
```

Open `http://localhost:3000`. Next.js reads local Supabase settings from `frontend/.env.local` (not a root `.env.local`); restart the dev server after changing it.

**P1/P2 ongoing (2026-10-16):** The `main` branch now contains the roadmap prerequisite fix, a staged password recovery flow (requires `SKILLMETRY_SITE_URL`), owner-scoped account JSON export, staged atomic request throttling (default off), and five additional foundational 2026.2 quizzes (default off until SQL rollout). See [P1/P2 release status](docs/P1_P2_RELEASE_STATUS.md). This is **not** a claim that all P1/P2 tasks or hosted rollouts are complete.

**Phase D:** The repository includes expanded 2026.3 diagnostics (30 questions per skill, 15 per attempt), private topic-level answer reviews, five unscored practice questions per topic and an updated Digital Twin insight section. This rollout is **disabled by default**. The additional PostgreSQL migration is not applied to the hosted project. See [Phase D rollout and acceptance plan](docs/PHASE_D_IMPLEMENTATION.md) before enabling `NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED`.

For authenticated assessments, configure the two public Supabase values plus the server-only `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`). Never prefix either elevated variable with `NEXT_PUBLIC_`. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Validation

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

With the local Supabase stack running and migrations applied:

```powershell
npm run test:rls
npm run verify:assessment
```

The end-to-end verification command expects a running app and local Supabase variables in the current shell. Setup instructions are in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). `package-lock.json` is committed; use `npm ci` in CI and clean environments.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and reusable project components
- React Flow for the adaptive roadmap graph
- Zustand for the isolated anonymous demo
- Zod-validated API boundaries
- Supabase SSR Auth and PostgreSQL with least-privilege RLS
- Vitest and pgTAP security tests

## Important paths

```text
frontend/src/app/api/assessments/          authenticated start, submit, private reviews, diagnostics, and unscored practice
backend/lib/assessments/                   server-only versioned banks, grading and isolated practice questions
shared/data/assessment-catalog.ts          browser-safe assessment metadata
shared/lib/assessments/                    browser-safe history and profile selectors
shared/lib/readiness.ts                    pure profile and hypothetical scenario logic
frontend/src/lib/supabase/                 browser-only public Supabase client/config
backend/lib/supabase/                      SSR, request-auth, and server-only admin clients
frontend/src/store/use-skillmetry.ts        anonymous demo preferences; not trusted scoring data
shared/                                   shared domain, data, and reusable logic
database/supabase/                        local Supabase project, migrations, and pgTAP security tests
tests/                                    unit and trust-boundary tests
docs/                                     product, architecture, scoring, security, and setup
```

## Product and trust rules

1. Numerical skill scores come only from completed server-graded quizzes.
2. The latest valid attempt is the current score; earlier attempts remain in history.
3. Missing assessment data is `Not Assessed`, not 0%.
4. Assessment coverage and measured performance are separate metrics.
5. Anonymous sample results are explicitly illustrative and never sync into an account.
6. Scenarios are hypothetical and never write assessment results or actual progress.
7. The student owns only their profile and can read only their own graded results. Browser roles cannot create or edit grades.
8. The service-role key and answer keys stay server-only.
9. Immediate retakes are allowed, while PostgreSQL permits only one active session per assessment version and one result per session.

## Deployment

No hosted migration is applied automatically. Review the versioned SQL and [Supabase setup guide](docs/SUPABASE_SETUP.md), run the local RLS suite, then obtain explicit approval before pushing migrations to a hosted project.

## Licensing

No license has been selected. The owner must decide license and public/private distribution policy before publication.
