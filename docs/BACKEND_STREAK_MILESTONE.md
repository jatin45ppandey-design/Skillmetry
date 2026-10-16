# Backend-first milestone: learning consistency streak (staged)

**Status:** source implementation on `feat/backend-streaks-v1`; no frontend changes, hosted DB migrations, production environment edits, deployment or secrets changes.

## Purpose
Help a learner recognize their **participation habits**. Never make up skill proficiency, claim measured mastery, or pressure users with a paid streak freeze. Streak can remain unchanged through the day if yesterday was active.

## Supported events (read from existing trustworthy database records)
- One completed authenticated `assessment_attempts` row with `grading_method='server_quiz'`.
- One server-graded `practice_lab_attempts` row; even a wrong response counts as an effortful attempt.
- More than one eligible event on a local calendar day contributes **one** active day.
- Logins, tab visits, planner checkbox changes, mission submissions, demo data and AI chats do **not** count.
- No raw new events or user-created rewards table is used: PostgreSQL derives days from already persisted trusted events.

## API
`GET /api/learning/streak?timeZone=Asia/Kolkata`, authenticated only, `Cache-Control: private, no-store`.
- Query accepts a valid IANA time zone (default Asia/Kolkata); SQL independently validates it.
- Returns `timeZone`, `asOfDate`, `currentStreak`, `longestStreak`, `totalActiveDays`, `lastActiveDate`, `activeToday`, `dueToday`, `last7Days` and source/disclaimer.
- `currentStreak` includes consecutive participation ending **today or yesterday**, so it does not prematurely reset before the student's day ends.
- Historical data on the account is automatically reflected; no client-generated days are accepted.
- The requested time zone affects date grouping (and is shown in the response), not scores or ownership. For consistency a future account preference should be persisted once UI is added.
- With no activity current and longest are zero, lastActiveDate null.
- The streak is an educational engagement metric only, never a quiz score, hiring signal, certification or penalty.

## Database and security
Migration `202610160006_learning_streak.sql` depends on `202610160004_learning_workflows.sql`.
The read-only `get_learning_streak(text)` RPC uses `SECURITY INVOKER`, `auth.uid()`, underlying FORCE RLS and execute grant to authenticated only. No score writes, new tables or service-role escalation. PostgreSQL time-zone conversion handles local-day boundaries and DST.

Default-off server gate:
```env
SKILLMETRY_STREAKS_ENABLED=false
```

## Release checklist
- [x] Source RPC, API, type-safe response validation and source/contract tests written.
- [x] Add dedicated pgTAP test for duplicate events, wrong answers, owner isolation, timezone rejection, anonymous denial and yesterday grace.
- [ ] Rehearse all previously staged migrations `001`–`005` plus `006` in an isolated disposable Supabase/Postgres.
- [ ] Run pgTAP and authenticated API E2E with separate learners, timezone differences and DST cases.
- [ ] Obtain explicit approval for hosted migration / flag activation.
- [ ] Design streak presentation, accessible calendar and low-pressure feedback during later frontend milestone.

## Backend stabilization backlog (not marked complete)
- Review and fix pending migrations (including Passport 005 function delimiter).
- Audit user-manipulable fields in plan/mission evidence tables; enforce selected server-trusted invariants.
- Stage schema migrations and validate grants/RLS/real RPC integration.
- Verify auth, accounts, quizzes, retakes, diagnostics, saved workflows and exports with two real test accounts.
- Configure/rehearse rate limiting, token safety, retention/deletion, monitoring and backup/restore.
- Complete operational security and production readiness before UI rollout.
