# P1 private data export

A signed-in student can download `/api/account/export` as JSON from the Account page. It fetches all app-owned tables from the current schema under the **same student RLS session** and filters each by the authenticated user ID. No service-role key is used.

Includes: private profile, legacy claimed skills, missions, trusted and legacy assessment attempts, diagnostics reviews if installed, evidence, scenario runs, job analyses and passport settings. Supabase-managed Auth logs, storage objects, email delivery records and third-party provider data are not included; the export explains these exclusions.

No public endpoint includes an untrusted user ID. No-store headers prevent shared caching; an unexpected database error fails the entire export. Pagination caps each table at 10,000 rows to avoid unbounded memory. Full production privacy compliance (including deletion, storage export, retention, notices and verified process) remains a pending release gate.

**QA before release:** verify user A can export only A's data; verify owner RLS and that none of user B's records appear; test empty history, optional Phase D not installed, large export failure and different devices.


P3–P6 addition: when enabled, account JSON exports also include owner-scoped `learning_plan_tasks`, `practice_lab_attempts`, and `mission_work`. Until the hosted migration is approved/applied, these are clearly listed as omitted optional tables. No scores are inferred from this activity.
