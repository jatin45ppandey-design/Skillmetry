# Skillmetry — Implementation Status

> Working status: 2026-10-11. Claims below reflect repository code and local verification. No migration from this milestone has been applied to Supabase Cloud.

## Milestone outcome

The quiz-driven Career Digital Twin milestone and its approved local concurrency/security remediation are implemented on `feature/quiz-digital-twin-mvp`.

The authenticated path is:

**Sign in → select career → take secure quiz → receive a server-graded score → save it to PostgreSQL → view the updated twin → retake immediately → see the latest score and preserved history.**

## Implemented

- Existing landing, workspace, dashboard, simulator, and React Flow roadmap behavior is preserved.
- Onboarding collects display name and target career. Manual skill sliders do not contribute to trusted scores.
- Authenticated cloud profile sync persists display name, career, onboarding completion, and presentation preferences only.
- Browser-safe metadata covers Python, SQL, JavaScript, and HTML assessments.
- A server-only, versioned question bank contains ten reviewed four-option questions per assessment. Client catalogs and API responses contain no correct-answer indexes.
- Authenticated start, submit, and history routes validate requests with Zod and validate identity from Supabase SSR claims.
- Assessment start/resume is atomic. PostgreSQL serializes starts and enforces one active session for each user, assessment, and version; expired sessions are retired safely.
- Concurrent duplicate submissions are idempotent. One immutable result is inserted, and the losing request securely reloads that owner/session result.
- Immediate serial retakes are allowed by default. An optional server-only completion-window policy can be enabled with both `ASSESSMENT_MAX_COMPLETIONS` and `ASSESSMENT_WINDOW_MINUTES`; PostgreSQL enforces it atomically.
- PostgreSQL validates score arithmetic, question counts, pass-threshold consistency, pass flags, and session completion metadata.
- Current assessment version `2026.2` uses a 75% pass threshold. Historical `2026.1` results retain their original 70% threshold in immutable result metadata.
- Display categories are `Not Assessed`, `Needs Improvement` (0–49), `Developing` (50–74), and `Strong Quiz Performance` (75–100).
- Retakes preserve history. Latest-attempt selection uses completion time and immutable attempt ID for deterministic ordering.
- Dashboard, Digital Twin, and roadmap keep unassessed skills unknown. The roadmap labels them `Assessment Recommended` and assigns no numeric zero-derived gap.
- The simulator keeps hypothetical gains separate from trusted progress and never projects an unassessed skill from 0%.
- Anonymous demo mode remains available without Supabase credentials and labels all sample assessment data as illustrative.
- Legacy claimed skill rows and legacy attempts remain preserved but excluded from trusted scoring.
- The service-role credential and grading implementation are isolated in server-only modules. Assessment mutation functions are service-role-only and use an empty `search_path`.

## Verified locally

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 38 tests across 6 files passed.
- `npm run build`: passed with the assessment API routes in the production route manifest.
- `npm run test:rls`: 31 pgTAP assertions passed across profile and assessment suites.
- `npm run verify:assessment`: two simultaneous starts returned one session; two simultaneous submissions returned one result with one replay; cross-user submission was denied; a genuine 0% result remained distinct from missing history; six immediate retakes succeeded; history remained ordered; and profile/history survived sign-out and sign-in. Both disposable users were removed afterward.
- Rendered local UI verification covered the dashboard, assessments, Digital Twin, simulator, desktop React Flow roadmap, and a true 390 × 844 mobile roadmap. The mobile document width remained 390 pixels after the status-label wrapping fix.
- These authenticated tests used the disposable local Supabase Docker stack and local Next.js server at `127.0.0.1`. They do not constitute hosted-cloud verification.

## Configuration still required

- Review and explicitly approve both assessment migrations before applying them to a hosted staging project.
- Set `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) only in the trusted server environment. Authenticated quizzes return a safe unavailable state when it is absent.
- Configure production Auth site/redirect URLs and email delivery.
- Decide whether to leave immediate retakes unlimited or set both optional completion-window environment values.
- Run the RLS and authenticated concurrency checks against a staging project before production rollout.

## Known limitations and release gates

- The question bank is source-controlled server code. Changes require review and a version bump; there is no authoring/review console.
- One-active-session enforcement, bounded validated payloads, authentication, expiry, and duplicate-result protection provide basic abuse safeguards. There is no distributed IP/device rate limiter yet.
- The server runtime holds a broad Supabase service-role credential; routes minimize its use, but production secret management and an independent security review remain required.
- Local pgTAP and end-to-end checks do not prove hosted policies or grants were applied correctly.
- Dependency installation currently reports npm audit findings that need a separate compatibility-aware review; they were not auto-fixed in this milestone.
- Final manual checks across the supported production browser/device matrix remain a release gate.
- No human verification, project/GitHub scoring, AI grading, placement prediction, or professional certification is implemented.

## Verification commands

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:rls
npm run verify:assessment
```

See `docs/SUPABASE_SETUP.md` for the local environment required by the final two commands.
