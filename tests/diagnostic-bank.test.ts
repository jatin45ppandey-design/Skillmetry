import { describe, expect, it } from "vitest";
import { getAssessmentDefinition, isDiagnosticDefinition } from "@skillmetry/backend/lib/assessments/question-bank.server";
import { selectDiagnosticQuestionIds } from "@skillmetry/backend/lib/assessments/diagnostic-selection.server";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";

const ids = Object.keys(diagnosticTopics) as AssessmentId[];
describe("D1 assessment blueprint", () => {
  it.each(ids)("keeps 2026.2 and provides 30 versioned questions for %s", id => {
    const legacy = getAssessmentDefinition(id, "2026.2");
    const diagnostic = getAssessmentDefinition(id, "2026.3");
    expect(legacy.questions).toHaveLength(10);
    expect(diagnostic.questions).toHaveLength(30);
    expect(diagnostic.version).toBe("2026.3");
    expect(isDiagnosticDefinition(diagnostic)).toBe(true);
  });
  it.each(ids)("draws exactly one item per topic and tier for %s", id => {
    const def = getAssessmentDefinition(id, "2026.3");
    if (!isDiagnosticDefinition(def)) throw new Error("Expected diagnostics");
    const selected = selectDiagnosticQuestionIds(id, def.questions, () => 0);
    expect(selected).toHaveLength(15);
    expect(new Set(selected).size).toBe(15);
    const result = selected.map(key => def.questions.find(q => q.id === key)!);
    for (const topic of diagnosticTopics[id]) {
      expect(result.filter(q => q.topicId === topic.id).map(q => q.difficulty).sort())
        .toEqual(["advanced", "beginner", "intermediate"]);
    }
    expect(selectDiagnosticQuestionIds(id, def.questions, max => max - 1)).not.toEqual(selected);
  });
});
