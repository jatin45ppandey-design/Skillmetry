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
