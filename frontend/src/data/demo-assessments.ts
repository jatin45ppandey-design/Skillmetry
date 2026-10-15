import type { AssessmentAttempt } from "@skillmetry/shared/types/domain";

// Fixed, illustrative records for anonymous product exploration. They are never
// uploaded, mixed with authenticated history, or described as the current user's results.
export const demoAssessmentHistory: readonly AssessmentAttempt[] = [
  { id: "demo-python-1", assessmentId: "python-foundations", assessmentVersion: "demo", skillId: "python", score: 60, passed: false, passThreshold: 75, correctCount: 6, totalQuestions: 10, completedAt: "2026-08-12T09:00:00.000Z" },
  { id: "demo-python-2", assessmentId: "python-foundations", assessmentVersion: "demo", skillId: "python", score: 80, passed: true, passThreshold: 75, correctCount: 8, totalQuestions: 10, completedAt: "2026-09-05T09:00:00.000Z" },
  { id: "demo-sql-1", assessmentId: "sql-foundations", assessmentVersion: "demo", skillId: "sql", score: 50, passed: false, passThreshold: 75, correctCount: 5, totalQuestions: 10, completedAt: "2026-09-07T09:00:00.000Z" }
];
