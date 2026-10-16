# C02 — 140 unpublished foundation questions

Authoring progress: **14 canonical skills × 10 distinct foundational questions = 140 draft items**, grouped into 5 topic headings per skill. The items include source-side explanations, and four randomized-position choices. Code is deliberately server-only.

**NOT RELEASED OR EDUCATOR-REVIEWED**. The official assessment catalog continues to expose only 4 working skills. The final 18/18 acceptance checker correctly reports NOT COMPLETE. Source authored ≠ content quality certified.

Still required within this *same* C02 bucket: editorial correction/sign-off; complete 30-item diagnostic banks per skill with beginner/intermediate/advanced coverage; independently authored unscored practice pools (5 per topic), detailed explanations; version compatibility, UI integration, server grading tests, database policy tests and staged Auth E2E. Never expose answer keys to browser or misstate progress.

## Code wiring progress — C02 still open

- All 14 new subjects now have 10 foundational and 20 additional server-only diagnostic questions (420 total) mapped to the original 18-skill catalog.
- All 14 also have a separate 25-item unscored practice pool (350 total).
- Source grading, random topic/tier selection, review and practice APIs are integrated, and added diagnostic/practice tests validate bank structure and score integrity.
- Production/normal default still presents the original 4 assessments.
- `NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=true` + `NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED=true` must BOTH be configured for discovery.
- `SKILLMETRY_ASSESSMENT_CONTENT_APPROVED=true` is a separate **server-only** start-route gate. Set it only after actual qualified question review and isolated staging database migration and E2E. Simply setting the flag is NOT evidence of review.
- Official skill scores still derive only from immutable server-graded quiz submissions; new practice scores are deliberately discarded.
- Future launch cannot claim 18/18 released or educator-reviewed until C02 editorial sign-off, schema rollout and authenticated tests are complete.
