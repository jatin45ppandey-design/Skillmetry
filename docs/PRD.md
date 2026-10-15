# Skillmetry — Product Requirements

## Product vision

Skillmetry is a quiz-driven career digital twin that helps students measure foundational skills, understand career-aligned gaps, and observe progress across reassessments.

**Promise:** *Measure Your Skills. Shape Your Future.*

### Primary user

Students and early-career learners who can identify a target role but need a truthful view of what has and has not been assessed.

### Core jobs

1. Select a target career without providing unnecessary personal data.
2. Complete a short, objective foundational assessment.
3. See the latest trusted score for each assessed skill.
4. Distinguish assessment coverage from performance.
5. Review previous attempts and improvement or decline.
6. Explore prerequisites and hypothetical learning scenarios without changing real scores.

## MVP journey

Sign in → choose a career → start an authenticated quiz → submit one answer per question → receive a server-graded result → view the updated Digital Twin → retake → see the latest score and preserved history.

Anonymous visitors may use an explicitly illustrative demo. Demo results are isolated from authenticated cloud data.

## P0 requirements

- Onboarding asks only for display name and one of the three supported careers.
- Python, SQL, JavaScript, and HTML each have one versioned ten-question, four-option assessment.
- Question order is randomized per session; answer keys never enter browser bundles or API responses.
- Sessions expire after 30 minutes and are bound to the authenticated owner and assessment version.
- A completed session produces at most one result. Concurrent and sequential retries return that original result without regrading or inserting another row. Immediate serial retakes are allowed; only one session per owner/assessment/version may remain active. Any longer-window cap is optional, server-configured, and atomically enforced.
- The latest valid completed attempt determines the displayed skill score; all prior attempts remain immutable history.
- A genuine server-graded 0% is distinct from an unassessed skill.
- Dashboard and twin show coverage separately from average measured performance.
- Roadmap, careers, simulator, and related views consume the trusted assessment profile. Hypothetical gains never create assessment data.
- Loading, unauthenticated, unavailable, empty, error, and retry states use the existing design system.
- Desktop, tablet, mobile, keyboard, and touch interactions remain usable.

## Explicit non-goals for this milestone

- Manual skill ratings or self-reported numerical proficiency
- Human verification or reviewer portals
- Project, repository, resume, or GitHub-derived scoring
- AI grading, chatbot, placement prediction, or job-board ingestion
- Roadmap resource recommendations or external resource navigation
- Employment probability, eligibility, or professional certification claims

## Trust and privacy requirements

- Every private route validates the server-side Supabase claim.
- Owner IDs and scores are never accepted from a client.
- Student database roles may read only their own graded results and cannot insert, update, delete, or self-approve them.
- Trusted writes use a server-only credential and an atomic database function with replay protection.
- Legacy claimed proficiency remains preserved for compatibility but is excluded from the trusted twin.
- Hosted migrations require review and explicit approval; no reset of cloud data is permitted.

## Success criteria

- The full authenticated MVP journey succeeds against local Supabase.
- Scores are bounded to 0–100 and derived only from server-side keys.
- Missing assessments never reduce a displayed average by being treated as zero.
- Cross-account data access and forged result writes fail in executable RLS tests.
- Retakes update the current value without erasing history.
- Refresh and sign-out/sign-in restore the profile and results from PostgreSQL.
- Typecheck, lint, unit tests, database tests, and production build pass.

## Future scope

Additional assessment domains, question-author review workflows, operational rate limiting, account export/deletion, and richer longitudinal analytics may follow only after this assessment loop is production-operated safely.

## Brand notice

"Skillmetry" is the preferred working name. Perform domain and trademark checks before public commercialization.
