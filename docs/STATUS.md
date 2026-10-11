# Skillmetry — Implementation Status & Roadmap

> Working status: 2026-10-11. Keep this document aligned to the code and test evidence, not product aspirations.

## North star
Skillmetry is a **student-facing adaptive career digital twin**: students choose a role, record claimed skills, complete evaluated activities, submit work evidence, and see transparent skill gaps and recommended next steps. **Role-weighted readiness measures estimated skill coverage, NOT employability or placement probability.**

## Implemented foundations
- Next.js App Router / React / TypeScript responsive frontend, code quality checks and GitHub CI.
- Premium landing page and student workspace: onboarding, dashboard, career explorer, adaptive prerequisite graph with a mobile list view, digital twin, scenario simulator, missions, demo assessment UI, and private passport preview.
- Three curated career tracks: ML Engineer, Frontend Developer and Backend Developer; 18 skills, prerequisite map and curated missions.
- Deterministic role-weighted readiness, gap ordering and hypothetical what-if logic; simulation does not update actual proficiency.
- Supabase SSR email/password authentication with login, signup, session validation, callback and signout, protected account page, cloud profile synchronization API, strict input validation and anonymous demo fallback.
- SQL migration set for catalog/user tables and narrower owner-scoped RLS privileges. Claimed skills are student-editable; assessment grades, demonstrated proficiency and verification/review statuses are not student-writeable.
- Local Docker Supabase startup and migrations demonstrated, plus the 12-assertion `supabase/tests/profile_rls.test.sql` suite passed on the user's local environment. Login and a "Cloud synced" account page were observed against the user's cloud project.

## Important qualifications
- The user's recent screenshot confirms a signed-in account and a synced profile indicator, **not** the whole signout/signin/cross-device restoration sequence. Explicitly verify that before calling cloud persistence fully acceptance-tested.
- Local RLS tests do not replace a production audit or testing against hosted database policies. A cloud migration apply should be verified separately from its dry-run output.
- Demo quizzes currently include answer keys in client code. They **do not** provide trusted certification.
- The MVP roadmap and scenarios are adaptive prototypes; the full evidence-backed feedback loop is still pending.
- Real AI mission generation, AI copilot and job parser are not available yet.
- Do not commit `.env.local`, Supabase secret keys, cloud database passwords, or machine-specific ports unnecessarily.
- Public launch needs dependency vulnerability review, abuse controls, account deletion/export, privacy policy, and a reliable outbound email provider.

## Next development sequence

### Release gate A — Foundation verification
1. Confirm all changes on `main`, and CI passes after consolidation.
2. Re-run typecheck/lint/tests/build and review landing + auth UI at desktop/tablet/mobile widths.
3. Confirm Supabase hosted migrations, auth redirects, sign-up/email confirmation/sign-in/signout/profile restoration.
4. Test **two real accounts** against hosted RLS: account A never accesses account B's profiles/skills.
5. Clarify loading/failure states and auth provider rate limits.

### Phase 2B — Proof-of-Skill Engine (next feature milestone)
- Server-only question bank and grading with assessment attempt controls, audit trails and bounded skills signals.
- Mission states and practical project evidence submission with rubrics and pending/reviewed/rejected status.
- Reviewer identity, authorization and decision logs; **student submissions must never approve themselves**.
- Distinguish claimed, assessed, demonstrated and verified states in the twin.
- Recalculate dependent roadmap recommendations only from policy-defined trusted inputs.
- Automated multi-user security/integration tests.

### Phase 3 — Career AI
- Job description to canonical skill mapping and consented reverse roadmaps.
- Context-aware career copilot, safe model adapter, usage limits and feedback.
- Structured AI missions validated against curated skill IDs.
- Optional GitHub repository evidence signals **pending review**, never automatic skill verification.

### Phase 4 — Share, polish, launch
- Consent-based revocable career passport and portfolio export.
- Saved simulations, career switch comparisons, accessible onboarding refinement.
- Operational controls, email/SMPP configuration, security audit, Vercel deployment and monitoring.
- Optional future: campus placement prep, complementary team matching, mentor workspace and interviews.

## Verification commands
```powershell
npm install
npm run typecheck
npm run lint
npm test
npm run build
# Requires local Docker Supabase already running:
npm run test:rls
```

## Architecture & trust boundary
- Frontend: Next.js/React/TypeScript, Tailwind + project CSS, React Flow, Zustand.
- API/auth/db: Next.js route handlers, Zod, Supabase SSR Auth, PostgreSQL + RLS.
- Dev/test: Supabase CLI, Docker, pgTAP, Vitest, ESLint, GitHub Actions.
- Target hosting: Vercel + Supabase Cloud.

See `docs/PRD.md`, `docs/BACKLOG.md`, `docs/SECURITY.md` and `docs/SUPABASE_SETUP.md` for details.
