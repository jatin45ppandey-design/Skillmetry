# Skillmetry Admin Studio — Phase 1

**Staged source only.** No production deployment, hosted migration or account changes.

## What is implemented

- `/admin` protected by a server-verified, explicit `admin_members` table; never trust emails or client-selected roles.
- 18 canonical skill guides editable: documentation title/HTTPS URL, video lecture/course title/HTTPS URL, short notes, practical challenge.
- Preview, private draft save, owner-only publish, optimistic revision conflict handling and immutable audit revision entries.
- Editor can save drafts. Reviewer is read-only. Owner can publish.
- Published updates are read by `/api/content/skill-guides?skill=...`; the student Learning Desk uses original curated guides if no published version is available.
- Database membership, drafts and audit logs have no browser Data API privileges.
- A single service-only transactional RPC writes guide revision + audit entry atomically.
- All existing quiz scoring, streaks, student records and career paths are preserved.

## Activation prerequisites (NOT performed)

1. Run all migrations through `202610170001_admin_learning_guides.sql` in a disposable or authorized staging Supabase database.
2. Run pgTAP and two-user authenticated E2E testing before any hosted operation. The disposable CI suite now tests owner enrollment, denied student edits, draft privacy, publish, stale update rejection and history.
3. A database operator explicitly inserts the **intended existing authenticated user's UUID** into `public.admin_members` with `role='owner'`. Never infer owner from first account, email or public signup.
4. Set `SKILLMETRY_ADMIN_STUDIO_ENABLED=true` only on that verified environment, then test `/admin`.
5. Test owner/editor/reviewer permissions, two-browser draft conflicts, publish, reload, student-facing guide updates and keyboard/mobile behavior.

Example (replace with a verified UUID in the intended staging project only):
```sql
insert into public.admin_members (user_id,role)
values ('<VERIFIED_AUTH_USERS_UUID>'::uuid,'owner')
on conflict (user_id) do update set role='owner';
```

## Scope intentionally reserved for later phases

- Multiple resources/attachments per skill, PDF uploads, media storage and a rich text note editor.
- Visual roadmap graph editing, ordered course lessons, mission briefs and assessment question bank publishing.
- Rollback to a previous published version, advanced editorial collaboration and link-check background jobs.
- Actual hosted project activation and deployment.

These features must use the same RBAC, versioned audit and safe preview/publish model. A successful repository build alone is not a claim of deployed CMS functionality.