import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { isCanonicalSkillId, isToolId, toolById } from "@skillmetry/shared/data/learning-catalog";
import type {
  AssessmentAttempt,
  AssessmentRoute,
  CareerId,
  LearningPreferences,
  LearningRecommendation,
  LearningRecommendationPlan,
  RecommendationAction,
  RecommendationEvidence,
  SkillId,
  SkillMap,
  ToolId
} from "@skillmetry/shared/types/domain";

export type RecommendationInput = {
  learning: LearningPreferences;
  /** Caller-supplied scores must be the latest trusted, server-graded results. */
  trustedScores: Readonly<SkillMap>;
  /** Used only to make reassessment suggestions from real completed history. */
  trustedAttempts?: readonly Pick<AssessmentAttempt, "id" | "skillId" | "completedAt">[];
};

type SkillCandidate = {
  skillId: SkillId;
  importance: number;
  careerGoals: Map<CareerId, number>;
  selected: boolean;
  selectedTools: Set<ToolId>;
  prerequisiteFor: Set<SkillId>;
};

type CandidateRecommendation = Omit<LearningRecommendation, "slot">;

const slotOrder = ["now", "next", "later"] as const;
const careerById = new Map(careers.map(career => [career.id, career]));
const assessmentBySkill = new Map<SkillId, (typeof assessmentCatalog)[number]>(assessmentCatalog.map(assessment => [assessment.skillId, assessment]));

function dedupe<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function knownLearningContext(learning: LearningPreferences): LearningPreferences {
  return {
    primaryCareerId: learning.primaryCareerId && careerById.has(learning.primaryCareerId) ? learning.primaryCareerId : null,
    selectedSkillIds: dedupe(learning.selectedSkillIds.filter(isCanonicalSkillId)),
    selectedToolIds: dedupe(learning.selectedToolIds.filter(isToolId))
  };
}

function safeScore(scores: Readonly<SkillMap>, skillId: SkillId): number | null {
  if (!Object.hasOwn(scores, skillId) || !Number.isFinite(scores[skillId])) return null;
  return Math.min(100, Math.max(0, scores[skillId]));
}

function assessmentRoute(skillId: SkillId): AssessmentRoute {
  const assessment = assessmentBySkill.get(skillId);
  return assessment ? { available: true, assessmentId: assessment.id, href: "/assessments" } : { available: false };
}

function addCandidate(candidates: Map<SkillId, SkillCandidate>, skillId: SkillId, importance: number): SkillCandidate {
  const existing = candidates.get(skillId);
  if (existing) {
    existing.importance = Math.max(existing.importance, importance);
    return existing;
  }
  const candidate: SkillCandidate = { skillId, importance, careerGoals: new Map(), selected: false, selectedTools: new Set(), prerequisiteFor: new Set() };
  candidates.set(skillId, candidate);
  return candidate;
}

/** Adds prerequisite candidates defensively, including protection from accidental catalog cycles. */
function addPrerequisites(candidates: Map<SkillId, SkillCandidate>, skillId: SkillId, importance: number, visiting = new Set<SkillId>()) {
  if (visiting.has(skillId)) return;
  visiting.add(skillId);
  const skill = skillById[skillId];
  for (const prerequisiteId of skill?.prerequisites ?? []) {
    if (!isCanonicalSkillId(prerequisiteId)) continue;
    const prerequisite = addCandidate(candidates, prerequisiteId, importance + 20);
    prerequisite.prerequisiteFor.add(skillId);
    addPrerequisites(candidates, prerequisiteId, importance + 20, visiting);
  }
  visiting.delete(skillId);
}

function skillEvidence(candidate: SkillCandidate, score: number | null): RecommendationEvidence[] {
  const evidence: RecommendationEvidence[] = [];
  for (const [careerId, weight] of [...candidate.careerGoals.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    evidence.push({ type: "career-goal", careerId, weight });
  }
  if (candidate.selected) evidence.push({ type: "selected-skill" });
  for (const toolId of [...candidate.selectedTools].sort()) evidence.push({ type: "selected-tool", toolId });
  for (const forSkillId of [...candidate.prerequisiteFor].sort()) evidence.push({ type: "prerequisite", forSkillId });
  evidence.push(score === null ? { type: "not-assessed" } : { type: "trusted-assessment", score });
  return evidence;
}

function skillRecommendation(candidate: SkillCandidate, scores: Readonly<SkillMap>, hasTrustedHistory: Set<SkillId>): CandidateRecommendation | null {
  const skill = skillById[candidate.skillId];
  if (!skill) return null;
  const score = safeScore(scores, candidate.skillId);
  const assessment = assessmentRoute(candidate.skillId);
  const prerequisiteNames = [...candidate.prerequisiteFor].map(id => skillById[id]?.label ?? id).sort();
  const isToolOnly = !candidate.selected && candidate.careerGoals.size === 0 && candidate.selectedTools.size > 0;
  let action: RecommendationAction;
  let priority: number;
  let explanation: string;

  if (score === null) {
    if (assessment.available) {
      action = "take-assessment";
      priority = candidate.importance + (candidate.prerequisiteFor.size ? 60 : 40);
      explanation = prerequisiteNames.length
        ? `Assess ${skill.label} before progressing with ${prerequisiteNames.join(" and ")}.`
        : `Assess ${skill.label} to replace an unknown skill state with a trusted result.`;
    } else if (isToolOnly) {
      action = "explore-tool";
      priority = candidate.importance + 35;
      const selectedToolId = [...candidate.selectedTools].sort()[0];
      const selectedTool = selectedToolId ? toolById[selectedToolId] : null;
      explanation = `${selectedTool?.label ?? skill.label} maps to ${skill.label}; it has no separate assessment score.`;
    } else {
      action = candidate.prerequisiteFor.size ? "review-prerequisite" : "explore-skill";
      priority = candidate.importance + (candidate.prerequisiteFor.size ? 45 : 25);
      explanation = prerequisiteNames.length
        ? `Build ${skill.label} as a prerequisite for ${prerequisiteNames.join(" and ")}; it is not assessed yet.`
        : `${skill.label} is a selected learning area without an available assessment.`;
    }
  } else if (score < 50) {
    action = candidate.prerequisiteFor.size ? "review-prerequisite" : "strengthen-skill";
    priority = candidate.importance + 70 + (50 - score);
    explanation = prerequisiteNames.length
      ? `Trusted quiz performance is ${score}% in ${skill.label}; strengthen this prerequisite before ${prerequisiteNames.join(" and ")}.`
      : `Trusted quiz performance is ${score}% in ${skill.label}; focus on the underlying concepts before advancing.`;
  } else if (score < 75) {
    action = "strengthen-skill";
    priority = candidate.importance + 35 + (75 - score);
    explanation = `Trusted quiz performance is ${score}% in ${skill.label}; targeted practice can move it from developing to strong.`;
  } else if (assessment.available && hasTrustedHistory.has(candidate.skillId)) {
    action = "reassess";
    priority = candidate.importance + 5;
    explanation = `Your latest trusted ${skill.label} result is ${score}%; reassessment is available when you are ready to measure retained knowledge.`;
  } else {
    return null;
  }

  return {
    id: `skill:${candidate.skillId}`,
    kind: isToolOnly ? "tool" : "skill",
    skillId: candidate.skillId,
    ...(isToolOnly ? { toolId: [...candidate.selectedTools].sort()[0] } : {}),
    action,
    priority,
    explanation,
    evidence: skillEvidence(candidate, score),
    assessment
  };
}

function standaloneToolRecommendation(toolId: ToolId): CandidateRecommendation {
  const tool = toolById[toolId];
  return {
    id: `tool:${toolId}`,
    kind: "tool",
    toolId,
    action: "explore-tool",
    priority: 110,
    explanation: `${tool.label} is a selected tool focus. It does not create or imply a skill score.`,
    evidence: [{ type: "selected-tool", toolId }],
    assessment: { available: false }
  };
}

/**
 * Produces a stable, non-mutating Now/Next/Later plan. It has no persistence
 * side effects and never turns unknown skill state into a numeric score.
 */
export function buildRecommendations(input: RecommendationInput): LearningRecommendationPlan {
  const learning = knownLearningContext(input.learning);
  const candidates = new Map<SkillId, SkillCandidate>();

  if (learning.primaryCareerId) {
    const career = careerById.get(learning.primaryCareerId)!;
    for (const { skillId, weight } of career.skills) {
      const candidate = addCandidate(candidates, skillId, 100 + weight);
      candidate.careerGoals.set(career.id, weight);
      addPrerequisites(candidates, skillId, 100 + weight);
    }
  }
  for (const skillId of learning.selectedSkillIds) {
    const candidate = addCandidate(candidates, skillId, 180);
    candidate.selected = true;
    addPrerequisites(candidates, skillId, 180);
  }
  for (const toolId of learning.selectedToolIds) {
    const tool = toolById[toolId];
    if (!tool.canonicalSkillId) continue;
    const candidate = addCandidate(candidates, tool.canonicalSkillId, 160);
    candidate.selectedTools.add(toolId);
    addPrerequisites(candidates, tool.canonicalSkillId, 160);
  }

  const historySkills = new Set((input.trustedAttempts ?? []).filter(attempt => isCanonicalSkillId(attempt.skillId)).map(attempt => attempt.skillId));
  const recommendations: CandidateRecommendation[] = [];
  for (const candidate of candidates.values()) {
    const recommendation = skillRecommendation(candidate, input.trustedScores, historySkills);
    if (recommendation) recommendations.push(recommendation);
  }
  for (const toolId of learning.selectedToolIds) {
    if (!toolById[toolId].canonicalSkillId) recommendations.push(standaloneToolRecommendation(toolId));
  }

  const ordered = recommendations
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
    .slice(0, slotOrder.length)
    .map((recommendation, index) => ({ ...recommendation, slot: slotOrder[index] }));

  return {
    now: ordered[0] ?? null,
    next: ordered[1] ?? null,
    later: ordered[2] ?? null,
    recommendations: ordered
  };
}
