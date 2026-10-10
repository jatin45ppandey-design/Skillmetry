# Skillmetry

**Measure Your Skills. Shape Your Future.**

A **career digital twin** starter: a responsive Next.js workspace where a student selects a career, rates skills, explores an interactive prerequisite-aware roadmap, tries hypothetical missions and takes short local quizzes. Created as a **Git-ready foundation for Codex**, not a production career credentialing platform.

> **Development status — MVP starter.** Homepage, dashboard, three career tracks, local skill twin, skill graph, deterministic readiness/scenario math, curated missions, local quizzes and a simulation API are implemented as a prototype. Authenticated cloud persistence, AI job parsing, real GitHub verification, shareable passport and all P1/P2 integrations are **not** implemented. Sample/readiness numbers are NOT hiring probabilities.

## Getting started (VS Code / Codex)

Prerequisites: **Node.js 22**, npm, Git.

```bash
npm install
cp .env.example .env.local # optional; app runs without keys
npm run dev
```

Open http://localhost:3000. Windows PowerShell alternative: `Copy-Item .env.example .env.local`.

### Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

**Important:** This offline-generated starter does **not** contain `package-lock.json` because npm registry access was unavailable during preparation. Run `npm install` and **commit the generated lockfile** before pushing. The initial CI uses `npm install`; switch to `npm ci` once the lockfile is committed.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS + hand-built minimal components (shadcn/ui integration is a P1 option)
- React Flow for roadmap graph
- Zustand browser-persisted demo store
- Zod validated simulation endpoint
- Supabase migration scaffold (NOT wired into runtime)
- Vitest test coverage for scoring

## Repository map

```text
src/
  app/
    page.tsx                 # marketing homepage
    onboarding/              # career + self-assessed skills
    (workspace)/             # sidebar workspace pages
      dashboard/             # command center
      careers/               # curated role picker
      roadmap/               # React Flow graph
      twin/                  # readiness/evidence overview
      simulator/             # what-if scenario UI
      missions/              # mission templates
      assessments/           # client-only demo quizzes
      jobs/                  # AI job analyzer placeholder
      passport/              # private passport preview
      settings/              # local profile controls
    api/
      health/                # GET status
      simulate/              # POST deterministic simulation
      jobs/analyze/          # 501 placeholder
      ai/missions/           # 501 placeholder
  components/                # reusable UI/graph components
  data/catalog.ts            # skill DAG, roles, weights, missions, quizzes
  lib/readiness.ts           # pure scoring/simulation logic
  store/use-skillmetry.ts    # local demo state (NOT production identity)
  types/domain.ts            # domain model
supabase/migrations/         # draft relational schema and RLS
 docs/                      # product plan, architecture, backlog, scoring, security
 tests/                     # test suite
 AGENTS.md                  # instructions for Codex
```

## Ground rules

1. **No static roadmap clone.** Skill graph must respond to an individual's profile and a target role.
2. **No fabricated readiness guarantee.** The index measures weighted estimated skill coverage, not employment likelihood.
3. **Scenarios are hypothetical.** They MUST NOT directly write skill proficiency or verification state.
4. **Assessment and evidence differ.** A short quiz pass is weak evidence; GitHub metadata cannot independently certify a skill.
5. **Keep student data private.** Demo uses browser storage; future cloud storage requires auth, RLS and consent.
6. **No API secrets in the browser.** External providers are server-only.

## Recommended first Codex prompt

> Read `AGENTS.md`, `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md` and `docs/BACKLOG.md`. First run dependency install, create/commit `package-lock.json`, and run typecheck/lint/test/build. Fix scaffold problems without changing product behavior. Then implement Task P0-01 from the backlog with tests, keeping demonstrated proficiency separate from self-report.

## Deployment

Connect the GitHub repository to Vercel only after checks pass. The starter currently works without Supabase or Gemini keys, but a local prototype is **not** a secure multiuser platform.

## Licensing

No license has been selected. The owner must decide license and public/private distribution policy before publication.
