# Readiness scoring: transparent and non-predictive

## Formula
Given a target role with skill weights `w_i` that sum to 100 (points), and the user's estimated proficiency `p_i` in the range 0–100:

```
readiness = round(sum(w_i * clamp(p_i, 0, 100) / 100))
```

Example: 20 weight on ML Fundamentals and 50 proficiency means **10 points** of contribution.

**Interpretation:** role-specific weighted *skill coverage index*. It is NOT (1) probability of employment, (2) probability of interview success, (3) a verified skill certificate, or (4) an official labor-market benchmark.

## Prototype limitations
Current local code stores a single `skills` map. New Codex work must separately track:
- `claimed_proficiency` from onboarding;
- `assessment_signals` with passed/failed timestamps;
- `demonstrated_proficiency` estimated by reviewed objective evidence;
- `evidence_confidence` with clear explanation;
- `verified_status` only after trusted rubric/assessment review.

**Never silently turn a self-rating into verified proficiency.** The current `recordAssessment` +10 demo adjustment is a temporary illustrative shortcut and should be replaced in P0-03.

## Scenarios
`projected = readiness(role, applyScenario(current, selectedApprovedMissions))`

The `applyScenario` function clones the map and caps each skill to 100; actual stored map is unchanged. Gains in fixture missions are illustrative development assumptions. A mature product should model hours and prerequisite effects, show ranges/uncertainty and avoid overstating forecast precision.

## Ordering next-best actions
For a simple MVP gap priority:

```
priority(skill) = role_weight(skill) * (100 - current_proficiency(skill)) / 100
```

Then enforce prerequisites, time budget and mission availability. A blocked prerequisite may need to be recommended before a higher-priority downstream topic.

## Integrity tests
- All role weights sum exactly to 100.
- Every skill/prerequisite exists.
- Graph has no cycles.
- Score always lies within [0,100].
- Same inputs produce same result.
- Scenario has no side effects on real proficiency.
- Clamps multiple improvements at 100.
