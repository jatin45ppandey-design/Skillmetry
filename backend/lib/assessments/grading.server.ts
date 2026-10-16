import "server-only";

import type { PublicQuizQuestion } from "@skillmetry/shared/types/domain";

export const ASSESSMENT_PASS_THRESHOLD = 75;

export type GradedQuestion = PublicQuizQuestion & { correctIndex: number; topicId?: string; difficulty?: "beginner" | "intermediate" | "advanced"; explanation?: string };

export function gradeAnswers(
  questions: readonly GradedQuestion[],
  answers: Record<string, number>
) {
  const expectedIds = new Set(questions.map(question => question.id));
  const suppliedIds = Object.keys(answers);
  if (suppliedIds.length !== questions.length || suppliedIds.some(id => !expectedIds.has(id))) {
    throw new Error("Every assessment question must be answered exactly once.");
  }

  const correctCount = questions.reduce(
    (total, question) => total + (answers[question.id] === question.correctIndex ? 1 : 0),
    0
  );
  const score = Math.round((correctCount * 10000) / questions.length) / 100;
  return {
    correctCount,
    totalQuestions: questions.length,
    score,
    passThreshold: ASSESSMENT_PASS_THRESHOLD,
    passed: score >= ASSESSMENT_PASS_THRESHOLD
  };
}
