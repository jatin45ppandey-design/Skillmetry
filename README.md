# Skillmetry

**Measure Your Skills. Shape Your Future.**

A **career digital twin** starter: a responsive Next.js workspace where a student selects a career, rates skills, explores an interactive prerequisite-aware roadmap, tries hypothetical missions and takes short local quizzes. Created as a **Git-ready foundation for Codex**, not a production career credentialing platform.

> **Development status — Phase 2A.** The redesigned workspace, anonymous local demo, Supabase SSR authentication, private claimed-profile persistence, hardened RLS migrations, and deterministic simulation are implemented. Trusted server-side assessment grading/evidence approval, AI job parsing, GitHub verification, and shareable passports are **not** implemented. Sample/readiness numbers are NOT hiring probabilities.

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

`package-lock.json` is committed. Use `npm ci` in CI and clean environments for reproducible installs.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS + hand-built minimal components (shadcn/ui integration is a P1 option)
- React Flow for roadmap graph
- Zustand browser-persisted demo store
- Zod validated simulation endpoint
- Supabase SSR Auth and PostgreSQL persistence with least-privilege RLS
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
  lib/supabase/              # browser/server clients and SSR session refresh
  store/use-skillmetry.ts    # local demo cache (NOT production identity)
  types/domain.ts            # domain model
supabase/migrations/         # versioned schema, RLS hardening and catalog seeds
supabase/tests/              # executable two-user pgTAP security tests
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

## Deployment

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for project configuration, migrations, redirect URLs and RLS tests. The app continues to work without Supabase or Gemini keys, but live multiuser claims require the migrations and database tests to be applied to the target project.

## Licensing

No license has been selected. The owner must decide license and public/private distribution policy before publication.
