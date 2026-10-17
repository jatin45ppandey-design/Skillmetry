# Skillmetry Admin Studio — Phase 3: courses and lessons

**Code-only release.** No production deployment, hosted Supabase migration or elevated secrets changed.

## Scope shipped in source
- Owner/editor/reviewer guarded Admin Studio tab for Courses & Lessons.
- Create multiple courses for any of 18 skills. Each course contains ordered modules and lessons: video, reading or practice, notes, publisher HTTPS link and one practical task.
- Strict Zod validation, slug and identity protection, private draft/publish, owner-only publication, server-only transactional audit revisions and optimistic concurrency check.
- Public `/courses` page displays **only published courses**, with module/lesson expansion, optional HTTPS videos and links to existing learning desk.
- Students cannot directly write to the course tables; direct table/revision access is limited to the elevated server role with no browser grants.
- Course reading or videos never award quiz proficiency, assessment results, streak days or certificates.

## Release validation
- TypeScript, lint, unit tests, Next.js production build and /courses HTTP smoke.
- New SQL migration 202610170003_admin_courses.sql applied in disposable Supabase with pgTAP.
- API two-user E2E covers private course creation, no pre-publish leakage, public lesson delivery, revision conflict and audit history.
- Manual browser QA still needed (mobile editor, keyboard, notes formatting, loss-of-network behavior).

## Not yet implemented
- PDF or image uploads and hosted media Storage, a rich text editor, module-level prerequisites, publishing rollback, student course completion persistence, and course analytics.
- File uploads need a dedicated content-security review: signed storage routes, size/MIME scanning, ownership, copyright and privacy rules.

**Activation later:** Staging migration 001–003 in order, real owner enrollment and flags must be reviewed before hosted activation. Do not deploy until all planned features are accepted.
