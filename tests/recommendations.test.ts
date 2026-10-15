import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@skillmetry/shared/lib/recommendations";
import type { LearningPreferences } from "@skillmetry/shared/types/domain";

const emptyLearning: LearningPreferences = { primaryCareerId: null, selectedSkillIds: [], selectedToolIds: [] };

describe("adaptive recommendation engine", () => {
  it("returns an empty plan when no career, skills, or tools have been selected", () => {
    expect(buildRecommendations({ learning: emptyLearning, trustedScores: {} })).toEqual({ now: null, next: null, later: null, recommendations: [] });
  });

  it("keeps an unassessed skill distinct from an actual 0% trusted result", () => {
    const unassessed = buildRecommendations({ learning: { ...emptyLearning, selectedSkillIds: ["python"] }, trustedScores: {} });
    const zero = buildRecommendations({ learning: { ...emptyLearning, selectedSkillIds: ["python"] }, trustedScores: { python: 0 } });
    expect(unassessed.now?.action).toBe("take-assessment");
    expect(unassessed.now?.evidence).toContainEqual({ type: "not-assessed" });
    expect(unassessed.now?.evidence.some(item => item.type === "trusted-assessment")).toBe(false);
    expect(zero.now?.action).toBe("strengthen-skill");
    expect(zero.now?.evidence).toContainEqual({ type: "trusted-assessment", score: 0 });
  });

  it("prioritizes an unknown prerequisite before a selected downstream skill", () => {
    const plan = buildRecommendations({ learning: { ...emptyLearning, selectedSkillIds: ["react"] }, trustedScores: {} });
    expect(["html", "css", "javascript"]).toContain(plan.now?.skillId);
    expect(plan.now?.action).toBe("take-assessment");
    expect(plan.now?.evidence.some(item => item.type === "prerequisite")).toBe(true);
  });

  it("deduplicates combined career, standalone-skill, and canonical-tool context", () => {
    const plan = buildRecommendations({ learning: { primaryCareerId: "backend-developer", selectedSkillIds: ["docker"], selectedToolIds: ["docker"] }, trustedScores: {} });
    expect(plan.recommendations.filter(item => item.skillId === "docker")).toHaveLength(1);
    expect(plan.recommendations.find(item => item.skillId === "docker")?.evidence).toContainEqual({ type: "selected-tool", toolId: "docker" });
  });

  it("keeps standalone tools scoreless", () => {
    const plan = buildRecommendations({ learning: { ...emptyLearning, selectedToolIds: ["git", "postman"] }, trustedScores: {} });
    expect(plan.recommendations).toHaveLength(2);
    expect(plan.recommendations.every(item => item.kind === "tool" && item.action === "explore-tool" && item.assessment.available === false)).toBe(true);
  });

  it("is deterministic and suggests reassessment only from trusted history", () => {
    const input = { learning: { ...emptyLearning, selectedSkillIds: ["python"] }, trustedScores: { python: 90 } };
    expect(buildRecommendations(input).recommendations).toEqual([]);
    const withHistory = buildRecommendations({ ...input, trustedAttempts: [{ id: "attempt-1", skillId: "python", completedAt: "2026-10-12T00:00:00.000Z" }] });
    expect(withHistory.now?.action).toBe("reassess");
    expect(buildRecommendations({ ...input, trustedAttempts: [{ id: "attempt-1", skillId: "python", completedAt: "2026-10-12T00:00:00.000Z" }] })).toEqual(withHistory);
  });
});
