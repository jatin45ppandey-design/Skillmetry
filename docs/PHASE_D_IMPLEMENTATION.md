# Phase D implementation — code handoff and deployment gates

Last reviewed: 2026-10-16. Code is committed directly to the `main` branch. **Do not interpret passing code CI as a successful hosted Phase D rollout.**

## Scope

| Phase | Code implemented | Caveats |
| --- | --- | --- |
| D1 | 30 versioned items per supported skill; 15 drawn per attempt across five topics × three tiers; 2026.2 retained | Questions need additional educator review; pool variation is modest |
| D2 | Topic-based evidence, atomic review SQL RPC and table, deterministic weakness categories and curated resources | Hosted DB migration pending; five independently authored practice questions per topic |
| D3 | Question navigation/palette, flags, local draft recovery, countdown, diagnostic review, answer explanations, practice page, Twin insights | Manual browser/mobile QA and hosted end-to-end testing pending |

### Security and score invariants

- No correct answer leaves the backend before an assessment is completed. The dedicated practice pool is separate from the scored bank.
- Question-level review appears only for a completed, owner-validated attempt.
- Practice is unscored and never changes official skill scores, immutable attempt history or the Twin's trusted performance.
- Less than three question results in a topic means `insufficient-evidence`. A genuine 0% topic score is distinct from unknown.
- Version `2026.2` remains the default until the new database migration is approved and applied.
- The 75% threshold and two-decimal grade arithmetic match the database's score invariant.
- The additive migration preserves existing user profiles, existing attempts and existing RLS policies.

## How to verify in a disposable staging project

1. Confirm staging has the seven previously applied migrations. Review `202610160001_phase_d_diagnostics.sql` for new table, RLS grants and RPC behavior.
2. Apply that migration **to disposable staging only** after approval; do not reset hosted or production databases.
3. Run `npm run test:rls` against staging/local Supabase and review all pgTAP suites, including `diagnostics_rls.test.sql`.
4. Set `NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=true` for this staging frontend (or `frontend/.env.local`), then restart/build.
5. Sign in with a disposable user; take JavaScript 2026.3 quiz (15 questions) and submit. Confirm it persists one immutable attempt and exactly 15 question reviews.
6. Verify topic diagnosis: three questions per topic, unknown vs zero, recommended resources, five targeted separate practice questions, feedback and return to assessment.
7. Refresh during an active attempt, choose **Start assessment** again, confirm same server session resumes with local draft answers and server expiration still enforced.
8. Confirm answer review is unavailable before submission, and another signed-in user cannot retrieve someone else's review. Check retry/replay, wrong question IDs, score rounding, expiring sessions, and two simultaneous submissions.
9. Verify latest diagnostic recommendations in `/twin` and that practice never changes the official score or attempt history.
10. Test mobile, keyboard-only navigation, screen-reader labels, error states and long question text.

### Deployment gate

**Not approved/applied:** New SQL migration `202610160001_phase_d_diagnostics.sql`. Do not enable the diagnostic flag in hosted production until an owner explicitly approves and the SQL/RLS tests pass against staging. CI checks source/type/build but do not apply migrations.

### Remaining content and UX work

Continue educator-led editorial review of the diagnostic questions and detailed solution explanations, validate longitudinal topic changes with real user sessions, and complete human QA. These are tracked openly rather than claimed completed.
