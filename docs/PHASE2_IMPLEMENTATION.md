# Skillmetry Phase 2 — Project evidence V1

This is the first **implemented vertical slice** of the Phase 2 roadmap (P2.1/P2.2/P2.5 partial), not a completed public launch.

## Implemented

- Students with real Supabase sessions can save private, editable drafts of existing curated missions.
- Mission deliverables are checkable; a project/GitHub **HTTPS link** and notes may be saved.
- Submission requires an evidence URL and all deliverables checked. Submission is immutable and explicitly labeled **self-reported / unverified**.
- Owner-scoped API uses the authenticated SSR Supabase client and validates mission IDs and payloads; students never choose their database owner ID.
- RLS isolates each student's work. No anonymous write/read or deletion privileges; drafts can be updated, submitted records cannot be edited.
- Digital Twin shows a **separate project-evidence journal**; official assessment scores, immutable attempts and career percentages are untouched.
- No GitHub OAuth repo access, background crawling, AI evidence grading, reviewer approval or project proficiency inference is implemented.

## Private learner export (P2.6/P2.7 partial)

The private Career Passport now offers an authenticated **Download my private learning record** JSON action. `GET /api/account/learning-export` uses Supabase SSR Auth to fetch that student's profile, paginated trusted quiz history, and (when available) self-reported mission submissions. The response uses `Content-Disposition: attachment` and `Cache-Control: private, no-store`. The export includes an explicit completeness flag if the Phase 2 mission migration has not yet run. This is a **learning-record export**, not a full Supabase Auth/Storage GDPR export, public sharing link or verified Career Passport. Real-account email/session testing remains a release gate.

## Job-description vocabulary matching (P2.4 baseline)

The Jobs page now provides a functional, **browser-only deterministic vocabulary matcher** for the 18 existing canonical skills. It identifies explicit named technologies/terms and maps each one to an existing server-graded result or `Not assessed`; it links to relevant learning resources and supported assessments. **No job text is sent to an external API or persisted.** This is not AI extraction, a complete job requirement parser, hiring prediction, resume recommendation or fitness grade. Those advanced capabilities require a reviewed provider integration and reliable benchmark evaluation.

## Database activation

Migration: `database/supabase/migrations/202610160002_mission_submissions.sql`.

**NOT applied to hosted Supabase by this PR.** It follows the pending Phase D migration in chronological order. Verify migration dependency order on disposable staging first and run `npm run test:rls`, including `mission_submissions_rls.test.sql`. Obtain owner approval before cloud deployment. Without this migration, the UI preserves the existing mission catalog and shows a clear storage-unavailable state; authenticated draft/submission APIs return 503.

## Manual acceptance

1. Sign in as student A, open Missions, save an incomplete draft. Refresh: checked items, URL and reflection remain.
2. Try submitting an incomplete checklist or unsafe URL: the application rejects it.
3. Complete the checklist with an HTTPS project URL and submit. The record becomes read-only, labeled unverified.
4. Open Twin: the project appears in its **separate journal**, without changing quiz scores.
5. Sign in as student B: A's private draft and submission are invisible. Cross-owner forged writes fail.
6. Anonymous visitors see catalog missions but cannot save/read evidence.
7. Confirm hosted emails/auth, basic keyboard/tab navigation, responsive/mobile experience and database security regression tests.

## Deferred Phase 2 buckets

- Project reviews/verification and optional GitHub OAuth repository permissions (P2.1–P2.2).
- Production AI mission generation with a validated provider and costs/abuse controls (P2.3).
- AI job description parsing and grounded matching (P2.4).
- Full review-backed evidence graph and longitudinal journal (P2.5).
- Shareable, revocable Career Passport and export (P2.6).
- Privacy controls, account deletion, production security and public deployment (P2.7–P2.8).
- Real-user pilot, product analytics/privacy approvals and iterative QA (P2.9).

## Opt-in AI additions (P2.3 and P2.4)

- `POST /api/ai/missions` provides a bounded, JSON-validated draft project plan from a curated mission. No student data is shared, and no grade or project verification is created.
- `POST /api/ai/jobs` sends **user-consented** job text (max 6000 chars) to the external Gemini provider; all returned skill IDs must be canonical and all extracted evidence quotes must occur in the submitted text. The existing browser-only matcher is the private fallback.
- Both routes require an authenticated account, `SKILLMETRY_AI_ENABLED=true`, a server-only `GEMINI_API_KEY`, and the approved `202610160003_ai_usage_daily.sql` migration. `consume_ai_usage` enforces 3 requests per feature per user UTC day atomically. Expensive provider calls happen only after quota consumption.
- Gemini API requests have 12-second timeouts and capped output; responses are validated and never create official proficiency scores. No AI text is saved by this implementation.
- **No hosted migrations, provider billing setup or AI flag enablement performed.** Real provider integration and moderation/cost evaluation remain staging gates.
