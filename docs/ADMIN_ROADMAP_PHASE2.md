# Skillmetry Admin Studio — Phase 2: Career roadmap editor

**Staged source only.** No hosted Supabase migration or deployment performed.

## Implemented
- Four canonical career study sequences can be authored and versioned.
- Owner can publish; Editor can draft; Reviewer is read-only.
- Each step has a heading supplied from existing skills, explanatory text, practical assignment and reordering controls.
- At save/publish, Zod validates every canonical skill is present exactly once and included prerequisites precede dependents.
- SQL RPC rechecks career membership, revision conflicts and editorial authorization, then atomically saves and audits the version.
- Student roadmap shows the published learning plan as a collapsible sequence with relevant resource links; the original React Flow graph, verified quiz scores, career weights and canonical prerequisites are unchanged.
- Published content is delivered by a read-only endpoint; drafts and revision history never reach students.

## Activation requirements (not performed)
- Apply migration `202610170002_admin_roadmaps.sql` **after** the admin guide migration in disposable/staging DB and run pgTAP + two-user E2E.
- Admin owner enrollment, `SKILLMETRY_ADMIN_STUDIO_ENABLED=true` and private credentials are required only in a separately authorized environment.
- Validate in real browser at desktop/mobile widths; build pipeline checks are insufficient to guarantee drag/reorder usability.
- Never point test accounts at SafeRelay or another user's production database.

## Reserved for future phases
- Advanced visual graph authoring, dynamic prerequisite changes, weighted curriculum/assessment restructuring, multi-course lesson content, file/PDF uploads, version rollback and granular team approvals.
- Canonical curriculum changes require a separate governance process: never mutate student skill scores through the CMS.
