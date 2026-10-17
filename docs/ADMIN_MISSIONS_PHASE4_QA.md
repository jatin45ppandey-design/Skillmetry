# Phase 4 — QA and release handoff (2026-10-17)

## Scope
- [Phase 4 draft PR #21](https://github.com/jatin45ppandey-design/Skillmetry/pull/21)
- [Tracking issue #20](https://github.com/jatin45ppandey-design/Skillmetry/issues/20)
- Source-only fourth Admin Studio tab, mission draft/publish, student published-only catalog, private evidence storage.
- Host and data changes **not performed**.

## Completed automated QA
- [x] Validate starter: typecheck, lint, Vitest, Next.js build, release/security and public HTTP smoke — [run 39028910229](https://github.com/jatin45ppandey-design/Skillmetry/actions/runs/39028910229) passed on `51eb602b`.
- [x] Disposable Supabase: migrations, pgTAP RLS, owner/student two-user publish and evidence E2E — [run 39028910173](https://github.com/jatin45ppandey-design/Skillmetry/actions/runs/39028910173) passed on `51eb602b`.
- [x] Code review found an unsaved-draft loss risk when switching Admin Studio tabs or career. Navigation guard, reload warning and regression source checks committed after that run.
- [x] Both workflows passed again on final feature head `a8275a17`: [Validate starter](https://github.com/jatin45ppandey-design/Skillmetry/actions/runs/39029347127) and [Isolated Supabase](https://github.com/jatin45ppandey-design/Skillmetry/actions/runs/39029347123).

## Explicit infrastructure blocker
On the connected accounts at the time of this review:
- Vercel: the connected Hobby team has **zero linked Git projects**.
- Supabase: separate **Skilllmetry Free** project `qepaepqrhgrejzarqlrd` is now accessible read-only; it contains 7 baseline migrations and existing user/quiz records. It is not yet approved for staging changes.

Do **not** run Skillmetry migrations or tests against SafeRelay-Dev. Do not create a billable Supabase project/branch or link Vercel to a production repo without a dedicated environment choice, any required cost approval and the project owner's decision.

## Manual staging QA — still required
Run only after a dedicated Skillmetry staging URL, isolated database, existing verified admin-owner identity and migrations `202610170001`–`202610170004` are prepared:

- [ ] Real owner/editor/reviewer roles: owner can publish, editor drafts only, reviewer read-only, student cannot see admin pages or drafts.
- [ ] Browser at 1440, 1024, 768, 390 widths; screenshot all main mission editor sections and published student mission cards.
- [ ] Keyboard navigation: visible focus order, buttons, select/input/textarea editing, Escape/confirmation behavior and screen-reader label clarity.
- [ ] Reduced-motion setting, pending save, offline/reconnect, stale revision conflict, failed fetch and malformed payload handling.
- [ ] Switching Admin Studio tabs with unsaved form data warns rather than silently discarding changes.
- [ ] Existing 10 curated missions remain visible and unchanged; newer published CMS missions filter to correct career and appear only after owner publication.
- [ ] Published mission checklists cannot change once evidence may be stored; old student work survives republishes.
- [ ] Two separate staging accounts cannot read or overwrite each other's project evidence; students cannot gain assessed quiz scores/streaks from self-reported missions.
- [ ] Production flags remain OFF until explicit hosted release approval.

## Merge decision
**Source-only merge may proceed after source CI and code review, with all feature flags off.** Manual browser/hosted staging QA remains an explicit prerequisite for *activation*, not a claim of live functionality. Do not apply hosted migrations, enable flags or deploy through this documentation change. Existing Skillmetry user/quiz data must be preserved, and SafeRelay is excluded.
