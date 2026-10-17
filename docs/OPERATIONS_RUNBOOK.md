# Skillmetry operational readiness and incident runbook (draft)

Source-only implementation, not a production operations guarantee.

## Probes

- `GET /api/health`: cheap process liveness only. It does **not** mean database, Auth, mail or model provider readiness.
- `GET /api/health/ready`: guarded Postgres readiness check with `Authorization: Bearer <SKILLMETRY_HEALTHCHECK_TOKEN>`.
- If the monitor token is unset or incorrect, ready returns 404. When authorized, it returns 200 for healthy database connectivity or 503 otherwise. No passwords, connection hosts or account data are returned.
- Use a secret store, HTTPS and a private monitoring service. Set an uptime alert for repeat 503/timeouts and add platform-level health probes.

## Launch controls

Before production:
1. Review and approve migrations 001–006, in order; execute against disposable staging and run all pgTAP RLS suites.
2. Test real auth, reset, retakes, job analysis, consented AI, share revocation/expiry, private exports and cross-user isolation in staging.
3. Keep provider secrets and probe token server-only, and set authenticated service monitoring.
4. Enable staged feature flags only after owner approval; test rate-limit cleanup, email deliverability and AI spend alerts.
5. Implement backup/restore tests, account deletion + retention policy, legal/privacy notices, dependency audit, incident contact and user support route.
6. Perform keyboard/screen-reader, mobile and desktop browser QA and performance audits. The CI build does **not** replace these.

## Incidents

- **AI anomaly / unexpected spend**: turn off `SKILLMETRY_AI_TUTOR_ENABLED`, rotate provider key if needed, inspect provider billing/usage; keep core quizzes available.
- **Sharing data leak**: turn off `SKILLMETRY_PASSPORT_SHARING_ENABLED` immediately, revoke affected tokens, rotate elevated credentials if exposed, preserve sanitized audit evidence and begin notification assessment.
- **Database unavailable**: keep the trusted assessment system fail-closed; check readiness probe and provider status, restore from verified backups if needed, do not alter scores or force migrations.
- **Compromised secrets**: rotate at secret store and deployment, invalidate where appropriate, never commit keys or paste into issue comments.
- Document incident start time, affected systems, resolution and required retrospective without collecting unnecessary student information.

Owner, retention windows, alert thresholds and legal notice remain **not configured** until explicitly decided.
