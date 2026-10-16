import { describe, expect, it } from "vitest";
import { ASSESSMENT_PASS_THRESHOLD, gradeAnswers } from "@skillmetry/backend/lib/assessments/grading.server";
import { assessmentSnapshot, latestScores, performanceLabel } from "@skillmetry/shared/lib/assessments/grading";
import { selectCareer } from "@skillmetry/shared/lib/readiness";
import type { AssessmentAttempt } from "@skillmetry/shared/types/domain";

const questions = [
  { id: "q1", prompt: "One", choices: ["a", "b", "c", "d"], correctIndex: 1 },
  { id: "q2", prompt: "Two", choices: ["a", "b", "c", "d"], correctIndex: 3 }
] as const;

const attempt = (id: string, score: number, completedAt: string): AssessmentAttempt => ({
  id,
  assessmentId: "python-foundations",
  assessmentVersion: "2026.2",
  skillId: "python",
  score,
  passed: score >= ASSESSMENT_PASS_THRESHOLD,
  passThreshold: ASSESSMENT_PASS_THRESHOLD,
  correctCount: score / 10,
  totalQuestions: 10,
  completedAt
});

describe("server grading rules", () => {
  it("grades exact answers and keeps scores within bounds", () => {
    expect(gradeAnswers(questions, { q1: 1, q2: 3 })).toEqual({ correctCount: 2, totalQuestions: 2, score: 100, passThreshold: 75, passed: true });
    expect(gradeAnswers(questions, { q1: 0, q2: 0 }).score).toBe(0);
  });

  it("rounds a fifteen-question score to database-compatible hundredths", () => {
    const bank = Array.from({ length: 15 }, (_, index) => ({
      id: "f" + index, prompt: "Question", choices: ["a", "b", "c", "d"], correctIndex: 0
    }));
    const answers = Object.fromEntries(bank.map((q, i) => [q.id, i < 10 ? 0 : 1]));
    expect(gradeAnswers(bank, answers)).toMatchObject({
      correctCount: 10, totalQuestions: 15, score: 66.67, passed: false
    });
  });

  it("rejects missing, extra, or replay-shaped answer payloads", () => {
    expect(() => gradeAnswers(questions, { q1: 1 })).toThrow();
    expect(() => gradeAnswers(questions, { q1: 1, q2: 3, forged: 0 })).toThrow();
  });

  it("selects the latest completed result while preserving genuine zero", () => {
    const scores = latestScores([
      attempt("newer", 0, "2026-10-11T10:00:00.000Z"),
      attempt("older", 80, "2026-10-10T10:00:00.000Z")
    ]);
    expect(scores).toHaveProperty("python", 0);
    expect(scores).not.toHaveProperty("sql");
  });

  it("uses the immutable ID as a stable tie-breaker", () => {
    const completedAt = "2026-10-11T10:00:00.000Z";
    expect(latestScores([attempt("attempt-a", 40, completedAt), attempt("attempt-b", 80, completedAt)]).python).toBe(80);
    expect(latestScores([attempt("attempt-b", 80, completedAt), attempt("attempt-a", 40, completedAt)]).python).toBe(80);
  });

  it("separates coverage from performance", () => {
    const snapshot = assessmentSnapshot(selectCareer("ml-engineer"), [attempt("one", 80, "2026-10-11T10:00:00.000Z")]);
    expect(snapshot.assessedCount).toBe(1);
    expect(snapshot.totalCount).toBe(9);
    expect(snapshot.coveragePercent).toBe(11);
    expect(snapshot.measuredPerformance).toBe(80);
  });

  it("uses transparent performance categories", () => {
    expect(performanceLabel(0)).toBe("Needs Improvement");
    expect(performanceLabel(49)).toBe("Needs Improvement");
    expect(performanceLabel(50)).toBe("Developing");
    expect(performanceLabel(74)).toBe("Developing");
    expect(performanceLabel(75)).toBe("Strong Quiz Performance");
    expect(performanceLabel(100)).toBe("Strong Quiz Performance");
  });

  it("uses a documented 75 percent pass threshold", () => {
    const tenQuestions = Array.from({ length: 10 }, (_, index) => ({
      id: `q${index}`,
      prompt: String(index),
      choices: ["a", "b", "c", "d"] as const,
      correctIndex: 0
    }));
    const sevenCorrect = Object.fromEntries(tenQuestions.map((question, index) => [question.id, index < 7 ? 0 : 1]));
    const eightCorrect = Object.fromEntries(tenQuestions.map((question, index) => [question.id, index < 8 ? 0 : 1]));
    expect(gradeAnswers(tenQuestions, sevenCorrect).passed).toBe(false);
    expect(gradeAnswers(tenQuestions, eightCorrect).passed).toBe(true);
  });
});

describe("session-version integrity for resumed assessments", () => {
  it("selects exactly the stored version rather than the current public feature flag", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const route = readFileSync(fileURLToPath(new URL("../frontend/src/app/api/assessments/start/route.ts", import.meta.url)), "utf8");
    expect(route).toContain("getAssessmentDefinition(assessmentId, session.assessment_version)");
  });
});
