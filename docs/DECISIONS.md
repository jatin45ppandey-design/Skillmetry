# Architecture decision records

## ADR-001 — Next.js + React + TypeScript
One full-stack framework improves hackathon delivery; API route handlers enable server-side controls when persistence/AI arrive.

## ADR-002 — Curated role skill graph
A small, versioned JSON catalog is more predictable than allowing AI to invent a fresh role graph. Future sources may include ESCO/O*NET with attribution and review.

## ADR-003 — Deterministic readiness
Index is a stable calculation on declared proficiencies and role weights. Not a hiring probability. AI may explain, not directly decide scores.

## ADR-004 — Local prototype first
No Supabase or provider keys required for UI demo. Real multiuser experience requires auth, verified evidence and RLS tests.

## ADR-005 — No false integrations
Job parsing, GitHub verification and public passport routes remain explicitly labeled future work instead of simulated live features.

## ADR-006 — Brand as working name
Skillmetry is an internal working name for the project. Domain and trademark checks are needed before external commercialization.

## ADR-007 — Supabase SSR with local-first demo fallback
Authenticated sessions use cookie-based `@supabase/ssr` clients and server-validated JWT claims. Anonymous students keep the dependency-free browser demo. Authenticated cloud data hydrates after the persisted Zustand cache to avoid server/client markup mismatch, and only student-editable claimed profile fields synchronize.

## ADR-008 — Column grants plus RLS for trusted fields
Owner RLS alone is insufficient when trusted and student-editable columns share a row. Phase 2A combines per-operation owner policies with column-level grants: students can write `claimed_proficiency`, while demonstrated proficiency, confidence, verified status, assessment scores and evidence-review decisions remain unavailable to their role.
