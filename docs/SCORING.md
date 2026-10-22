# Assessment scoring and profile semantics

## Trusted score source

A numerical skill score exists only after a valid authenticated quiz session is graded on the server.

```text
score = round(correct_answers / total_questions × 100)
```

The current score for a skill is the latest completed attempt using the active server grading path. Earlier attempts remain available for history and change calculations.

The browser never submits a score, pass status, owner ID, correct count, review state, or assessment version. It submits only the opaque session ID and one selected option index per presented question. The server reloads the owner-bound session and versioned answer key before grading.

## Missing is not zero

- `Not Assessed` means there is no trusted completed quiz for that skill.
- `0%` means a trusted completed quiz had no correct answers.
- Coverage is `assessed target skills / total target skills`.
- Measured performance is the weighted average over assessed target skills only.

These values are displayed separately. Skillmetry does not impute unknown skills as 0% and does not interpret the result as employment probability or full professional readiness.

## Performance categories

The interface uses descriptive bands for communication, not credentials:

- Strong Quiz Performance: 75–100
- Developing: 50–74
- Needs Improvement: 0–49
- Not Assessed: no trusted result

Assessment version `2026.2` uses 75% as its pass threshold. The immutable attempt stores that threshold, and PostgreSQL enforces that `passed` equals `score >= pass_threshold`. Historical `2026.1` attempts retain their original 70% threshold instead of being silently reinterpreted. Passing is a quiz outcome, not human verification or certification.

## Reassessment and history

- A session expires after 30 minutes.
- One active session per user, assessment, and version is enforced by PostgreSQL and reused until submitted or expired.
- A completed session is consumed atomically with its result. Concurrent and sequential API retries return the original row and cannot create or alter a grade.
- Immediate serial retakes are allowed by default. Optional server-only window values may enable a longer-window cap, which PostgreSQL enforces atomically.
- Improvement or decline is the difference between the two newest valid attempts for that skill.

## Hypothetical scenarios

Scenario gains are illustrative planning assumptions. They apply only to an in-memory copy and only where a trusted baseline score exists. They never write an assessment attempt or change My Skill Progress.

## Legacy compatibility

Historical `user_skills.claimed_proficiency` data is retained but cannot produce a trusted score. Pre-milestone assessment rows are labeled `legacy_untrusted` and excluded from the current assessment profile. No legacy value is silently converted.

## Integrity tests

- Scores remain integers in [0, 100].
- Exact answer coverage is required; missing or extra answers fail validation.
- Answer keys exist only in a server-only module and are absent from browser-safe catalogs.
- Latest-attempt selection preserves a genuine 0% and distinguishes it from missing data.
- Duplicate submission, forged insert/update/delete, cross-owner reads, and direct student RPC execution fail.
- Scenario calculations do not mutate trusted results.
