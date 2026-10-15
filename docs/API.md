# API contract

All JSON input schemas are strict. Private endpoints validate a Supabase Auth claim server-side and return private, non-cacheable data.

## Assessment routes

### `POST /api/assessments/start`

Authentication and the server-only service credential are required.

```json
{"assessmentId":"javascript-foundations"}
```

Returns an opaque session ID, assessment/version metadata, expiry, and ten ordered public questions. A question contains `id`, `prompt`, and four `choices`; it never contains a correct index. PostgreSQL atomically expires stale sessions and creates or reuses exactly one active session for the same owner/assessment/version, including under concurrent requests. Immediate serial retakes are allowed by default. An optional server-only completion-window policy returns 429 when explicitly configured and reached.

### `POST /api/assessments/submit`

```json
{
  "sessionId":"00000000-0000-0000-0000-000000000000",
  "answers":{"javascript-01":1,"javascript-02":0}
}
```

The real submission must answer every presented question exactly once. The server verifies owner, status, expiry, version, and question set; grades with server-only keys; and atomically stores the result. The client cannot provide user ID, score, pass status, counts, or version. Retrying a completed session returns the original immutable attempt with `replayed: true`; it never regrades or creates another row.

Successful response:

```json
{
  "attempt": {
    "id":"uuid",
    "assessmentId":"javascript-foundations",
    "assessmentVersion":"2026.2",
    "skillId":"javascript",
    "score":80,
    "passed":true,
    "passThreshold":75,
    "correctCount":8,
    "totalQuestions":10,
    "completedAt":"ISO-8601 timestamp"
  }
}
```

### `GET /api/assessments/history`

Returns up to 100 of the authenticated student's `server_quiz` attempts, ordered by completion time and then immutable attempt ID. It never returns another owner's rows or legacy untrusted results.

## Profile routes

### `GET /api/profile`

Returns the current user's display name, target career, onboarding completion, hours/week, roadmap view, and update timestamp. Numerical skill state is not part of this contract.

### `PUT /api/profile`

Accepts only:

```json
{
  "displayName":"Student",
  "careerId":"frontend-developer",
  "onboardingCompleted":true,
  "preferences":{"hoursPerWeek":6,"roadmapView":"graph"}
}
```

The owner comes from the validated claim. Unknown fields—including user IDs, scores, claims, demonstrated/verified states, and review decisions—are rejected.

## Authentication routes

- `POST /api/auth/sign-up`: validated email/password; may require confirmation.
- `POST /api/auth/sign-in`: exchanges credentials for SSR cookie state without account-enumerating errors.
- `POST /api/auth/sign-out`: clears the local cookie session.
- `GET /auth/callback`: exchanges a valid PKCE code and allows only safe internal next paths.

## Other routes

- `GET /api/health`: application health metadata.
- `POST /api/simulate`: Zod-validated hypothetical scenario. It never persists or creates a score.
- `POST /api/jobs/analyze`: 501 placeholder.
- `POST /api/ai/missions`: 501 placeholder.
