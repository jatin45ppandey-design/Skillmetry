# Skillmetry

**Measure Your Skills. Shape Your Future.**

Skillmetry is a responsive career digital twin for students. A student chooses a target career, completes secure foundational quizzes, and sees an assessment-derived skill profile, history, coverage, roadmap, and clearly labeled hypothetical scenarios.

> **Development status — quiz-driven MVP.** Supabase SSR authentication, private profile persistence, server-only assessment grading, immutable attempt history, owner-scoped RLS, and an anonymous illustrative demo are implemented. Unassessed skills remain unknown; they are never displayed as 0%. The product does not claim hiring probability, professional readiness, human verification, or project/GitHub-derived skill scores.

## Getting started

Prerequisites: Node.js 22, npm, Git, and optionally Docker for local Supabase.

```powershell
npm install
Copy-Item .env.example frontend/.env.local # optional; anonymous demo works without keys
npm run dev
```

Open `http://localhost:3000`. Next.js reads local Supabase settings from `frontend/.env.local` (not a root `.env.local`); restart the dev server after changing it.

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
frontend/src/app/api/assessments/          authenticated start, submit, and history routes
backend/lib/assessments/                   server-only question bank and trusted grading
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
