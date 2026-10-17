# Skillmetry — loading and motion design (source release)

A task-first feedback system, not a fake progress animation. **No backend, scoring,
database migration, hosted service, deployment, authentication contract or secrets changed.**

## Motion rules
- Small, fast interactions stay instant. No artificial wait or fake percentage.
- Slow navigation gets an indeterminate thin brand progress bar. Stops when URL changes;
  includes an automatic 12-second safety timeout so it never spins endlessly.
- Server route Suspense/loading boundaries use content-shaped skeletons rather than blank areas.
- Auth and account actions show what is occurring (checking credentials, creating account,
  verifying email, requesting reset, updating password, restoring session, signing out).
  The form continues to enforce pending-disabled submission and handles errors; success is
  never shown before the API returns.
- Assessments expose actual start-session and server-grading states. Saved study tasks,
  practice, missions, job summaries, tutor, Passport sharing and topic diagnostics expose
  network-bound pending states; errors stay visible.
- Landing/step/graph/carousel changes use short opacity-and-position transitions without
  faking network activity.
- CSS honors `prefers-reduced-motion: reduce`; all loading is conveyed in text and
  semantic `role=status` regions. No animations are relied on to express critical information.
- Genuine session progress, grading, activity, and skill scores remain strictly separate.

## Source coverage
- Auth: sign in, sign up, OAuth begin, confirmation code/resend, recovery email/password,
  account session restore/sign out.
- Landing and onboarding: root route loading, subtle first impression, intent-step feedback,
  navigation into the student home.
- Workspace: shared loading route, navigation progress and 15 student pages.
- Data-bound tools: Dashboard, Twin, diagnostics, streak calendar, assessments and results,
  planner, lab, missions, targeted practice, job analysis, tutor and Passport sharing.
- Instant state changes: career choice, resources tabs, roadmap details, what-if comparison.
- Public Passport sharing: no streaming route-level loader; revoked links retain a genuine HTTP 404 response and private tokens never enter logs.

## Verification and release gates
- [x] Source implementation of reusable components and all listed feedback states.
- [ ] GitHub CI typecheck, lint, tests, build, privacy static checks, public-route smoke
      all green on **final** branch commit.
- [ ] Visual browser QA on desktop/tablet/phone; confirm layout skeletons are representative,
      toolbars stay visible, no layout shift, and tab navigation works.
- [ ] Real slow 3G/poor connectivity and API error simulations in staging.
- [ ] Keyboard, screen reader and reduced-motion device validation.
- [ ] Staging Supabase login, sign-up/confirmation, password reset, OAuth,
      long-running quiz grading and saving checks with independent accounts.

## Principle
There is never a reason to show an indefinite blocking loader, a fake 0–100% bar,
a fictitious success animation or an invented proficiency score.
