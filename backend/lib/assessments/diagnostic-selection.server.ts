import "server-only";
import { randomInt } from "node:crypto";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";
import type { DiagnosticQuestion } from "@skillmetry/backend/lib/assessments/diagnostic-bank.server";

/** Fifteen random unique questions with one from each topic/difficulty cell. */
export function selectDiagnosticQuestionIds(
  assessmentId: AssessmentId,
  questions: readonly DiagnosticQuestion[],
  index: (max: number) => number = randomInt
) {
  const chosen: string[] = [];
  for (const topic of diagnosticTopics[assessmentId]) {
    for (const difficulty of ["beginner", "intermediate", "advanced"] as const) {
      const pool = questions.filter(q => q.topicId === topic.id && q.difficulty === difficulty);
      if (!pool.length) throw new Error("Question blueprint is missing "+topic.id+" "+difficulty);
      const n = index(pool.length);
      if (!Number.isInteger(n) || n < 0 || n >= pool.length) throw new Error("Invalid random index");
      chosen.push(pool[n].id);
    }
  }
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = index(i + 1);
    if (!Number.isInteger(j) || j < 0 || j > i) throw new Error("Invalid shuffle index");
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  if (chosen.length !== 15 || new Set(chosen).size !== 15) throw new Error("Invalid diagnostic selection");
  return chosen;
}
