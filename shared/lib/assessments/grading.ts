import type { AssessmentAttempt, AssessmentId, Career, SkillMap } from "@skillmetry/shared/types/domain";

export function latestAttemptsBySkill(attempts: readonly AssessmentAttempt[]) {
  const latest = new Map<string, AssessmentAttempt>();
  for (const attempt of attempts) {
    const current = latest.get(attempt.skillId);
    const attemptTime = Date.parse(attempt.completedAt);
    const currentTime = current ? Date.parse(current.completedAt) : Number.NEGATIVE_INFINITY;
    if (!current || attemptTime > currentTime || attemptTime === currentTime && attempt.id > current.id) {
      latest.set(attempt.skillId, attempt);
    }
  }
  return latest;
}

export function latestScores(attempts: readonly AssessmentAttempt[]): SkillMap {
  return Object.fromEntries(
    [...latestAttemptsBySkill(attempts)].map(([skillId, attempt]) => [skillId, attempt.score])
  );
}

export function assessmentSnapshot(career: Career, attempts: readonly AssessmentAttempt[]) {
  const latest = latestAttemptsBySkill(attempts);
  const assessed = career.skills.filter(({ skillId }) => latest.has(skillId));
  const assessedWeight = assessed.reduce((sum, item) => sum + item.weight, 0);
  const measuredPerformance = assessedWeight === 0
    ? null
    : Math.round(assessed.reduce((sum, item) => sum + latest.get(item.skillId)!.score * item.weight, 0) / assessedWeight);

  return {
    assessedCount: assessed.length,
    totalCount: career.skills.length,
    coveragePercent: Math.round((assessed.length / career.skills.length) * 100),
    measuredPerformance
  };
}

export function performanceLabel(score: number) {
  if (score >= 75) return "Strong Quiz Performance";
  if (score >= 50) return "Developing";
  return "Needs Improvement";
}

export function previousAttemptForSkill(attempts: readonly AssessmentAttempt[], skillId: string) {
  const ordered = attempts
    .filter(attempt => attempt.skillId === skillId)
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || b.id.localeCompare(a.id));
  return ordered.length > 1 ? ordered[1] : null;
}

export function isAssessmentId(value: string): value is AssessmentId {
  return ["python-foundations", "sql-foundations", "javascript-foundations", "html-foundations", "css-foundations", "typescript-foundations", "react-foundations", "node-foundations", "rest-api-foundations"].includes(value);
}
