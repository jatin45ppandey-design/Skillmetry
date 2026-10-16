import { describe, expect, it } from "vitest";
import { getAssessmentDefinition, publicQuestions } from "@skillmetry/backend/lib/assessments/question-bank.server";
import { gradeAnswers } from "@skillmetry/backend/lib/assessments/grading.server";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { isAssessmentId } from "@skillmetry/shared/lib/assessments/grading";

const newIds = ["css-foundations","typescript-foundations","react-foundations","node-foundations","rest-api-foundations"] as const;
describe("staged P2 foundational assessments", () => {
  it.each(newIds)("holds a valid secure ten-question bank for %s", id => {
    expect(isAssessmentId(id)).toBe(true);
    const definition = getAssessmentDefinition(id);
    expect(definition.version).toBe("2026.2");
    expect(definition.questions).toHaveLength(10);
    expect(new Set(definition.questions.map(q => q.id)).size).toBe(10);
    for (const q of definition.questions) {
      expect(q.prompt.length).toBeGreaterThan(12);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
    const publicQuiz = publicQuestions(definition, definition.questions.map(q => q.id));
    expect(JSON.stringify(publicQuiz)).not.toContain("correctIndex");
    const answers = Object.fromEntries(definition.questions.map(q => [q.id, q.correctIndex]));
    expect(gradeAnswers(definition.questions, answers)).toMatchObject({score:100,passed:true});
    expect(() => getAssessmentDefinition(id, "2026.3")).toThrow("Unknown assessment version");
  });
  it("does not display expanded quizzes until explicitly enabled", () => {
    expect(assessmentCatalog.some(item => item.id === "css-foundations"))
      .toBe(process.env.NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED === "true");
  });
});
