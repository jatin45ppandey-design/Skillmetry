import { describe, expect, it } from "vitest";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import {
  buildCareerAlignment,
  buildDigitalTwinSnapshot,
  buildSkillTwinSnapshots,
  type TrustedTwinAttempt
} from "@skillmetry/shared/lib/digital-twin-intelligence";
import type { AssessmentId, LearningPreferences, SkillId } from "@skillmetry/shared/types/domain";

const noGoals: LearningPreferences = { primaryCareerId: null, selectedSkillIds: [], selectedToolIds: [] };

const assessmentForSkill: Record<string, AssessmentId> = {
  python: "python-foundations",
  sql: "sql-foundations",
  javascript: "javascript-foundations",
  html: "html-foundations"
};

function attempt(
  id: string,
  skillId: SkillId,
  score: number,
  completedAt: string,
  assessmentVersion = "2026.3",
  extras: Partial<TrustedTwinAttempt> = {}
): TrustedTwinAttempt {
  return {
    id,
    skillId,
    assessmentId: assessmentForSkill[skillId] ?? "python-foundations",
    assessmentVersion,
    score,
    passed: score >= 75,
    passThreshold: 75,
    correctCount: Math.round(score / 10),
    totalQuestions: 10,
    completedAt,
    gradingMethod: "server_quiz",
    source: "authenticated",
    ...extras
  };
}

describe("digital twin evidence boundary", () => {
  it("keeps an actual zero distinct from unknown evidence and excludes legacy, invalid, duplicate, and demo attempts", () => {
    const snapshots = buildSkillTwinSnapshots({
      learning: noGoals,
      attempts: [
        attempt("python-zero", "python", 0, "2026-10-01T00:00:00.000Z"),
        attempt("python-legacy", "python", 100, "2026-10-02T00:00:00.000Z", "2026.2", { gradingMethod: "legacy_untrusted" }),
        attempt("python-invalid", "python", 100, "2026-10-03T00:00:00.000Z", "2026.3", { valid: false }),
        attempt("python-demo", "python", 100, "2026-10-04T00:00:00.000Z", "2026.3", { source: "demo" }),
        attempt("python-zero", "python", 100, "2026-10-05T00:00:00.000Z"),
        attempt("forged-react", "react", 100, "2026-10-06T00:00:00.000Z")
      ]
    });

    const python = snapshots.find(snapshot => snapshot.skillId === "python");
    const sql = snapshots.find(snapshot => snapshot.skillId === "sql");
    const react = snapshots.find(snapshot => snapshot.skillId === "react");

    expect(python).toMatchObject({ evidenceState: "measured", score: 0, band: "Needs Improvement", attemptCount: 1 });
    expect(sql).toMatchObject({ evidenceState: "assessment-available-not-taken", score: null, band: "Not Assessed" });
    expect(react).toMatchObject({ evidenceState: "assessment-unavailable", score: null, band: "Not Assessed" });
  });

  it("uses completedAt and a stable id as the latest-attempt ordering", () => {
    const snapshots = buildSkillTwinSnapshots({
      learning: noGoals,
      attempts: [
        attempt("a", "python", 20, "2026-10-01T00:00:00.000Z"),
        attempt("b", "python", 80, "2026-10-01T00:00:00.000Z")
      ]
    });

    const python = snapshots.find(snapshot => snapshot.skillId === "python");
    expect(python?.latestAttemptId).toBe("b");
    expect(python?.score).toBe(80);
    expect(python?.history.attempts.map(item => item.id)).toEqual(["a", "b"]);
  });
});

describe("digital twin career evidence", () => {
  it("partitions every career's canonical weight without substituting missing evidence for zero", () => {
    const snapshots = buildSkillTwinSnapshots({
      learning: noGoals,
      attempts: [attempt("javascript-zero", "javascript", 0, "2026-10-01T00:00:00.000Z")]
    });
    const backend = buildCareerAlignment("backend-developer", snapshots);

    expect(backend.totalWeight).toBe(100);
    expect(backend.measuredWeight + backend.availableUnmeasuredWeight + backend.unavailableWeight).toBe(100);
    expect(backend.measuredSkillIds).toEqual(["javascript"]);
    expect(backend.observedWeightedPerformance).toBe(0);
    expect(backend.weightedEvidenceCoveragePercent).toBe(10);
    expect(backend.assessmentAvailabilityCeilingPercent).toBe(25);
    expect(backend.availableUnmeasuredSkillIds).toContain("sql");

    for (const career of careers) {
      const alignment = buildCareerAlignment(career.id, buildSkillTwinSnapshots({ learning: noGoals, attempts: [] }));
      expect(alignment.totalWeight).toBe(100);
      expect(alignment.measuredWeight + alignment.availableUnmeasuredWeight + alignment.unavailableWeight).toBe(100);
      expect(alignment.observedWeightedPerformance).toBeNull();
    }
  });
});

describe("digital twin growth and recommendations", () => {
  it("preserves chronological trusted history, pass metadata, and cross-version comparison context", () => {
    const twin = buildDigitalTwinSnapshot({
      learning: { ...noGoals, selectedSkillIds: ["python"] },
      attempts: [
        attempt("first", "python", 80, "2026-09-01T00:00:00.000Z", "2026.2"),
        attempt("latest", "python", 60, "2026-10-01T00:00:00.000Z", "2026.3")
      ]
    });
    const history = twin.skills.find(snapshot => snapshot.skillId === "python")?.history;

    expect(history?.first).toMatchObject({ id: "first", score: 80, passed: true, passThreshold: 75 });
    expect(history?.latest).toMatchObject({ id: "latest", score: 60, passed: false, passThreshold: 75 });
    expect(history?.best?.id).toBe("first");
    expect(history?.latestDelta).toBe(-20);
    expect(history?.firstToLatestDelta).toBe(-20);
    expect(history?.crossVersionComparison).toBe(true);
  });

  it("reuses Phase A recommendations and B1 resources without assigning a tool a score or action that cannot resolve", () => {
    const toolOnly = buildDigitalTwinSnapshot({
      learning: { ...noGoals, selectedToolIds: ["git"] },
      attempts: []
    });
    expect(toolOnly.insights).toHaveLength(1);
    expect(toolOnly.insights[0]).toMatchObject({ type: "resource-suggestion", evidenceState: "tool-unassessed", action: { kind: "resources", href: "/resources?tool=git" } });
    expect(toolOnly.insights[0]?.resourceIds.length).toBeGreaterThan(0);

    const selectedSkill = buildDigitalTwinSnapshot({
      learning: { ...noGoals, selectedSkillIds: ["sql"] },
      attempts: []
    });
    expect(selectedSkill.insights.some(insight => insight.type === "assessment-recommended" && insight.action.kind === "assessment" && insight.action.href?.includes("sql-foundations"))).toBe(true);

    const combined = buildDigitalTwinSnapshot({
      learning: { primaryCareerId: "backend-developer", selectedSkillIds: ["sql"], selectedToolIds: ["postman"] },
      attempts: [attempt("sql-developing", "sql", 60, "2026-10-01T00:00:00.000Z")]
    });
    expect(combined.insights.every(insight => insight.action.kind === "none" || Boolean(insight.action.href))).toBe(true);
    expect(combined.skills).toHaveLength(skills.length);
    expect(combined.skills).toHaveLength(18);
    expect(combined.careers).toHaveLength(4);
  });

  it("records an improvement separately from a cross-version comparison", () => {
    const twin = buildDigitalTwinSnapshot({
      learning: { ...noGoals, selectedSkillIds: ["sql"] },
      attempts: [
        attempt("first", "sql", 40, "2026-09-01T00:00:00.000Z", "2026.2"),
        attempt("previous", "sql", 60, "2026-10-01T00:00:00.000Z"),
        attempt("latest", "sql", 80, "2026-10-02T00:00:00.000Z")
      ]
    });
    const history = twin.skills.find(snapshot => snapshot.skillId === "sql")?.history;

    expect(history?.latestDelta).toBe(20);
    expect(history?.firstToLatestDelta).toBe(40);
    expect(history?.crossVersionComparison).toBe(false);
    expect(history?.latest?.passed).toBe(true);
  });
});
