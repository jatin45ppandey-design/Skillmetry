# Skillmetry Admin Studio Phase 5 — Assessment Question Bank Builder

Tracking: [issue #22](https://github.com/jatin45ppandey-design/Skillmetry/issues/22).

## Scope (source implementation; not hosted-activated)
- A fifth **Assessment Bank** tab in the existing `/admin` workspace, using verified `admin_members` roles.
- Author one private bank per canonical assessment (four original + five additional tracks).
- Edit a bounded set of 10 multiple-choice questions, four choices per question, correct index and explanations.
- Editor saves private drafts; reviewer can inspect read-only; only a verified owner can publish.
- Every owner publication stores a new immutable `cms.N` version snapshot; revision history and optimistic conflict protection.
- Existing 2026.2 and 2026.3 static question banks remain unchanged and usable, with disabled-by-default CMS fallback.
- Quiz start resolves **only the latest published version** on the server. Student receives prompt/options only, never answer indexes or explanations.
- Quiz submission resolves the *version recorded at start*, including after a newer publication or a subsequent feature flag rollback.
- Only authenticated trusted server handles grading and stores scores. Publication cannot edit, generate, re-grade or overwrite prior attempts.
- Questions are text rendered through React's normal escaping; no rich HTML, untrusted scripts, AI question generation or custom plugins.

## Safety and compatibility
- All editorial draft, snapshot and audit tables use forced RLS, zero student/anon grants and service-role-only server reads.
- `save_admin_assessment_bank` RPC enforces owner/editor/reviewer, owner-only publication, revision conflict and basic database-side payload validity.
- Cross-origin writes blocked by the same-origin server check.
- Published version snapshots are append-only (no UPDATE privilege), and a stored attempt continues using the exact original question IDs/key.
- Canonical quiz IDs remain a fixed allowlist. New published versions do not add skills or alter the verified threshold (75%).
- Authoring a custom bank for a diagnostic-enabled skill uses the normal **non-diagnostic 10-question** scoring path. Topic-level diagnostic reviews remain reserved for vetted 2026.3 banks; no invented question topic evidence.
- Correct answers/explanations are not disclosed to student quiz sessions. Admin editor is accessible only after server-side role verification.

## Activation is separate (NOT performed)
1. Keep the connected Skilllmetry Free project, user identities and OAuth/.env settings unchanged.
2. Independently review existing migrations and apply all pending migrations safely in numeric order **only with explicit owner approval**; Phase 5 requires `202610170005_admin_assessment_banks.sql` after Admin Studio 001–004. Do not apply any changes to SafeRelay.
3. Verify the *intended* existing authenticated account UUID and explicitly enroll it as `owner` in `admin_members` (never guess by email or first account).
4. Only after a reviewable staging migration, pgTAP RLS and two-user E2E, enable `SKILLMETRY_ADMIN_STUDIO_ENABLED=true` and `SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED=true` in that authorized server environment. Leave them OFF on current hosted production.
5. Manually verify owner/editor/reviewer/student, desktop/mobile/keyboard, unsaved warning, version conflicts, authored bank start/submit, a republish during an active session and rollback behavior.
6. Historical quizzes and quiz attempts must remain unmodified. There is no export/import of client answer keys.

## Default flags
```dotenv
SKILLMETRY_ADMIN_STUDIO_ENABLED=false
SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED=false
```

## Not in scope
- AI-generated questions, AI grading, proctoring, subjective exams, rubric uploads, dynamic catalog creation, student question explanations before grading, score changes, PDF uploads or media storage.
- Hosted migration, owner enrollment, changed OAuth provider config, new organizations, Vercel deployment or paid features.

## Testing
- `tests/admin-assessments.test.ts`: schema/privacy/static gates.
- `database/supabase/tests/admin_assessment_banks_rls.test.sql`: private grants, RBAC, immutable versions, conflicts, payload denial.
- `scripts/verify-assessment-flow.mjs`: authenticated owner publishes and student starts, a newer version is published, old session still scores with old answer snapshot.
- GitHub CI runs these against disposable Supabase, not the user's existing hosted project.
