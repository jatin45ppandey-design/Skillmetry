# Architecture decision records

## ADR-001 — Next.js + React + TypeScript

One full-stack framework supports the workspace and server-controlled API boundaries.

## ADR-002 — Curated career skill graph

A small, versioned catalog is more predictable than allowing generated content to invent a role graph. Every career skill and prerequisite uses canonical IDs.

## ADR-003 — Assessment-derived profile

Numerical skill values come only from server-graded quizzes. Coverage and weighted measured performance are shown separately and are not hiring probabilities. Missing results remain unknown rather than being imputed as zero.

## ADR-004 — Local demo fallback

No Supabase key is required for the illustrative anonymous workspace. Demo data is isolated and never becomes trusted account data.

## ADR-005 — No false integrations

Job parsing, GitHub scoring, human verification, AI grading, and public passports remain unavailable instead of being simulated as live features.

## ADR-006 — Brand as working name

Skillmetry is a working name. Domain and trademark checks are needed before commercialization.

## ADR-007 — Supabase SSR authentication

Authenticated sessions use cookie-based `@supabase/ssr` clients and server-validated JWT claims. Authenticated cloud state loads after browser hydration; profile fields and trusted history remain separate.

## ADR-008 — Explicit grants plus RLS

Owner RLS alone is insufficient for trusted records. Per-operation policies and column/table grants preserve legacy data while denying students direct graded-result, review-state, and claimed-proficiency writes.

## ADR-009 — Session-bound server grading

The browser receives public questions but never answer keys. A validated user starts an expiring owner-bound versioned session and submits only answer choices. The server grades against a `server-only` bank; a service-role-only atomic database function consumes the session and appends one immutable result. The latest valid result is current and older results remain history.
