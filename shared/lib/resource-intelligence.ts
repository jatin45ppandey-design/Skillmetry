import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { curriculumCatalog } from "@skillmetry/shared/data/curriculum";
import { isCanonicalSkillId, isToolId, toolById } from "@skillmetry/shared/data/learning-catalog";
import { buildRecommendations } from "@skillmetry/shared/lib/recommendations";
import type {
  AssessmentRoute,
  CareerId,
  LearningPreferences,
  LearningRecommendationPlan,
  LearningResource,
  LearningResourceTarget,
  ResourceAvailability,
  ResourceDifficulty,
  ResourceFilter,
  ResourceRecommendation,
  SkillId,
  SkillMap,
  ToolId
} from "@skillmetry/shared/types/domain";

const approvedUrls = new Set(learningResources.map(resource => new URL(resource.url).href));
const assessmentBySkill = new Map<SkillId, (typeof assessmentCatalog)[number]>(assessmentCatalog.map(assessment => [assessment.skillId, assessment]));
const difficultyOrder: Record<ResourceDifficulty, readonly ResourceDifficulty[]> = {
  beginner: ["beginner", "intermediate", "advanced"],
  intermediate: ["intermediate", "beginner", "advanced"],
  advanced: ["advanced", "intermediate", "beginner"]
};
const slotPriority = { now: 300, next: 220, later: 140 } as const;

type TargetCandidate = {
  target: LearningResourceTarget;
  priority: number;
  reasons: string[];
};

export type PersonalizedResourceInput = {
  learning: LearningPreferences;
  /** Must contain only current trusted, server-graded skill scores. */
  trustedScores: Readonly<SkillMap>;
  /** Reuses the A1 plan when a caller already computed it. */
  phaseAPlan?: LearningRecommendationPlan;
  maxResults?: number;
};

function targetKey(target: LearningResourceTarget) {
  return target.kind === "skill" ? `skill:${target.skillId}` : `tool:${target.toolId}`;
}

function normalizeTarget(target: LearningResourceTarget): LearningResourceTarget {
  if (target.kind === "tool" || target.skillId !== "docker") return target;
  return target;
}

function assessmentRoute(skillId: SkillId): AssessmentRoute {
  const assessment = assessmentBySkill.get(skillId);
  return assessment ? { available: true, assessmentId: assessment.id, href: "/assessments" } : { available: false };
}

function finiteScore(scores: Readonly<SkillMap>, skillId: SkillId): number | null {
  const score = scores[skillId];
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null;
}

function preferredDifficulty(scores: Readonly<SkillMap>, target: LearningResourceTarget): ResourceDifficulty {
  if (target.kind === "tool") return "beginner";
  const score = finiteScore(scores, target.skillId);
  if (score === null || score < 50) return "beginner";
  if (score < 75) return "intermediate";
  return "advanced";
}

function reasonForTarget(target: LearningResourceTarget, scores: Readonly<SkillMap>, phaseAReason?: string) {
  if (target.kind === "tool") return `${toolById[target.toolId].label} is a selected tool focus. It has no Skillmetry assessment, so no score is inferred.`;
  const score = finiteScore(scores, target.skillId);
  const label = skillById[target.skillId]?.label ?? target.skillId;
  const scoreReason = score === null
    ? `${label} has no trusted quiz result yet, so introductory material is prioritized${assessmentRoute(target.skillId).available ? "; a baseline assessment is available when you are ready." : "."}`
    : score < 50
      ? `Your latest trusted ${label} assessment is ${score}%, so foundational revision is prioritized.`
      : score < 75
        ? `Your latest trusted ${label} assessment is ${score}%, so applied intermediate learning is prioritized.`
        : `Your latest trusted ${label} assessment is ${score}%, so intermediate and advanced material is prioritized without claiming mastery.`;
  return phaseAReason ? `${scoreReason} ${phaseAReason}` : scoreReason;
}

function addCandidate(candidates: Map<string, TargetCandidate>, target: LearningResourceTarget, priority: number, reason: string) {
  const normalized = normalizeTarget(target);
  const key = targetKey(normalized);
  const existing = candidates.get(key);
  if (existing) {
    existing.priority = Math.max(existing.priority, priority);
    if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    return;
  }
  candidates.set(key, { target: normalized, priority, reasons: [reason] });
}

function addPrerequisites(candidates: Map<string, TargetCandidate>, skillId: SkillId, score: number, visited = new Set<SkillId>()) {
  if (visited.has(skillId)) return;
  visited.add(skillId);
  for (const prerequisite of skillById[skillId]?.prerequisites ?? []) {
    addCandidate(candidates, { kind: "skill", skillId: prerequisite }, score, `${skillById[prerequisite]?.label ?? prerequisite} is a prerequisite for a selected learning target.`);
    addPrerequisites(candidates, prerequisite, score - 5, visited);
  }
}

/** Returns only catalog targets; Docker remains the canonical docker skill. */
function collectTargets(input: PersonalizedResourceInput) {
  const candidates = new Map<string, TargetCandidate>();
  const learning = input.learning;
  if (learning.primaryCareerId) {
    const career = careers.find(item => item.id === learning.primaryCareerId);
    for (const item of career?.skills ?? []) {
      addCandidate(candidates, { kind: "skill", skillId: item.skillId }, 100 + item.weight, `Relevant to your selected ${career?.title ?? "career"} goal.`);
      addPrerequisites(candidates, item.skillId, 85 + item.weight);
    }
  }
  for (const skillId of learning.selectedSkillIds.filter(isCanonicalSkillId)) {
    addCandidate(candidates, { kind: "skill", skillId }, 190, "Explicitly selected as a learning goal.");
    addPrerequisites(candidates, skillId, 175);
  }
  for (const toolId of learning.selectedToolIds) {
    const tool = toolById[toolId];
    if (tool.canonicalSkillId) {
      addCandidate(candidates, { kind: "skill", skillId: tool.canonicalSkillId }, 180, `${tool.label} maps to the canonical ${skillById[tool.canonicalSkillId]?.label ?? tool.canonicalSkillId} skill.`);
      addPrerequisites(candidates, tool.canonicalSkillId, 165);
    } else if (toolId !== "docker") {
      addCandidate(candidates, { kind: "tool", toolId }, 180, "Explicitly selected as a tool goal.");
    }
  }
  const plan = input.phaseAPlan ?? buildRecommendations({ learning, trustedScores: input.trustedScores });
  for (const recommendation of plan.recommendations) {
    const reason = `Prioritized by your ${recommendation.slot.toUpperCase()} Phase A learning recommendation.`;
    if (recommendation.kind === "tool" && recommendation.toolId && recommendation.toolId !== "docker") {
      addCandidate(candidates, { kind: "tool", toolId: recommendation.toolId }, slotPriority[recommendation.slot], reason);
    } else if (recommendation.skillId && isCanonicalSkillId(recommendation.skillId)) {
      addCandidate(candidates, { kind: "skill", skillId: recommendation.skillId }, slotPriority[recommendation.slot], reason);
    }
  }
  return [...candidates.values()];
}

export function getResourcesForSkill(skillId: SkillId) {
  return learningResources.filter(resource => (resource.target.kind === "skill" && resource.target.skillId === skillId) || resource.relatedSkillIds?.includes(skillId));
}

/** Resolves the normalized curriculum relationship without duplicating resource records. */
export function getResourcesForCurriculumLesson(lessonId: string) {
  const lesson = curriculumCatalog.lessons.find(entry => entry.id === lessonId);
  if (!lesson) return [];
  const resourceIds = new Set(lesson.resourceIds);
  return learningResources.filter(resource => resourceIds.has(resource.id));
}

/** Returns resources for every lesson under a topic, retaining catalog order. */
export function getResourcesForCurriculumTopic(topicId: string) {
  const subtopicIds = new Set(curriculumCatalog.subtopics.filter(entry => entry.topicId === topicId).map(entry => entry.id));
  const resourceIds = new Set(curriculumCatalog.lessons
    .filter(entry => subtopicIds.has(entry.subtopicId))
    .flatMap(entry => entry.resourceIds));
  return learningResources.filter(resource => resourceIds.has(resource.id));
}

/** Docker intentionally returns the canonical Docker skill resources. */
export function getResourcesForTool(toolId: ToolId) {
  const tool = toolById[toolId];
  return tool.canonicalSkillId ? getResourcesForSkill(tool.canonicalSkillId) : learningResources.filter(resource => (resource.target.kind === "tool" && resource.target.toolId === toolId) || resource.relatedToolIds?.includes(toolId));
}

function resourceMatchesCareer(resource: LearningResource, careerId: CareerId): boolean {
  // Explicit curator assignments are authoritative for external roadmaps.
  if (resource.careerIds) return resource.careerIds.includes(careerId);
  // The original 50 learning resources predate career tags; infer relevance
  // from the canonical career skill map so filtering never hides core guides.
  const career = careers.find(item => item.id === careerId);
  return Boolean(career?.skills.some(({ skillId }) =>
    (resource.target.kind === "skill" && resource.target.skillId === skillId)
    || resource.relatedSkillIds?.includes(skillId)
  ));
}

export function filterLearningResources(filter: ResourceFilter = {}) {
  return learningResources.filter(resource => {
    if (filter.target) {
      const match = filter.target.kind === "skill"
        ? (resource.target.kind === "skill" && resource.target.skillId === filter.target.skillId) || Boolean(resource.relatedSkillIds?.includes(filter.target.skillId))
        : (resource.target.kind === "tool" && resource.target.toolId === filter.target.toolId) || Boolean(resource.relatedToolIds?.includes(filter.target.toolId));
      if (!match) return false;
    }
    if (filter.careerId && !resourceMatchesCareer(resource, filter.careerId)) return false;
    if (filter.difficulties && !filter.difficulties.includes(resource.difficulty)) return false;
    if (filter.types && !filter.types.includes(resource.type)) return false;
    return !(filter.costs && !filter.costs.includes(resource.cost));
  });
}

/** Rejects non-HTTPS, credentialed, unknown-host, malformed, and non-catalog URLs. */
export function isSafeResourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && approvedUrls.has(url.href);
  } catch {
    return false;
  }
}

export function getResourceAvailability(resource: LearningResource): ResourceAvailability {
  if (!isSafeResourceUrl(resource.url)) return { available: false, fallbackMessage: "This resource URL is unavailable. Choose another curated resource for this learning target." };
  if (resource.verificationStatus === "unavailable") return { available: false, fallbackMessage: "This resource is currently unavailable. Choose another curated resource for this learning target." };
  return { available: true };
}

export function getResourcesForPhaseARecommendation(recommendation: LearningRecommendationPlan["now"]) {
  if (!recommendation) return [];
  if (recommendation.kind === "tool" && recommendation.toolId) return getResourcesForTool(recommendation.toolId);
  return recommendation.skillId ? getResourcesForSkill(recommendation.skillId) : [];
}

/** Career-level entry point for supporting paths; the personalized internal roadmap remains primary. */
export function getCareerRoadmapBrowseHref(careerId: CareerId) {
  return careers.some(career => career.id === careerId)
    ? `/resources?career=${encodeURIComponent(careerId)}&format=roadmap`
    : "/resources";
}

/** Creates an internal, validated resource-discovery route without exposing external URLs. */
export function getResourceBrowseHref(target: { kind: "skill"; skillId: SkillId } | { kind: "tool"; toolId: ToolId }) {
  const params = new URLSearchParams();
  if (target.kind === "skill" && isCanonicalSkillId(target.skillId)) params.set("skill", target.skillId);
  if (target.kind === "tool" && isToolId(target.toolId)) {
    const canonicalSkillId = toolById[target.toolId].canonicalSkillId;
    if (canonicalSkillId) params.set("skill", canonicalSkillId);
    else params.set("tool", target.toolId);
  }
  return params.size ? `/resources?${params.toString()}` : "/resources";
}

/**
 * Deterministic, score-aware curation for B2. It does not calculate a new
 * proficiency value or infer subtopic weakness from the baseline quiz.
 */
export function getPersonalizedResources(input: PersonalizedResourceInput): ResourceRecommendation[] {
  const candidates = collectTargets(input);
  // Explicit curator career tags must also apply to recommendations, not only browsing.
  // Do not recommend an ML-only roadmap to a backend learner merely because both use SQL.
  // Unavailable URLs are never featured when selecting personalized learning actions.
  const ranked = candidates.flatMap(candidate => getResourcesForTarget(candidate.target)
    .filter(resource =>
      getResourceAvailability(resource).available
      && (!input.learning.primaryCareerId || !resource.careerIds || resource.careerIds.includes(input.learning.primaryCareerId))
    )
    .map(resource => ({
    candidate,
    resource,
    score: candidate.priority
      + (3 - difficultyOrder[preferredDifficulty(input.trustedScores, candidate.target)].indexOf(resource.difficulty)) * 20
      + (resource.verificationStatus === "verified" ? 5 : -12)
      + (input.learning.primaryCareerId && resource.careerIds?.includes(input.learning.primaryCareerId) ? 26 : 0)
      + (resource.type === "roadmap" ? 12 : 0)
  }))).sort((a, b) => b.score - a.score || a.resource.id.localeCompare(b.resource.id));
  const results: ResourceRecommendation[] = [];
  const usedTypes = new Set<string>();
  const limit = Math.max(1, Math.min(input.maxResults ?? 6, 12));
  const preferredRoadmapLimit = Math.max(1, Math.ceil(limit / 3));
  let selectedRoadmaps = 0;
  while (ranked.length && results.length < limit) {
    let index = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    let foundWithinMix = false;
    for (let candidateIndex = 0; candidateIndex < ranked.length; candidateIndex += 1) {
      const candidate = ranked[candidateIndex];
      if (candidate.resource.type === "roadmap" && selectedRoadmaps >= preferredRoadmapLimit) continue;
      const diverseScore = candidate.score + (usedTypes.has(candidate.resource.type) ? 0 : 6);
      if (diverseScore > bestScore) {
        bestScore = diverseScore;
        index = candidateIndex;
        foundWithinMix = true;
      }
    }
    // If a very narrow goal only has roadmaps, use them rather than return fewer
    // recommendations. Otherwise keep learning material alongside broad roadmaps.
    const [item] = ranked.splice(foundWithinMix ? index : 0, 1);
    if (results.some(result => result.resource.id === item.resource.id)) continue;
    const target = item.candidate.target;
    results.push({
      resource: item.resource,
      ...(target.kind === "skill" ? { relatedSkillId: target.skillId, assessment: assessmentRoute(target.skillId) } : { relatedToolId: target.toolId, assessment: { available: false } }),
      availability: getResourceAvailability(item.resource),
      reason: reasonForTarget(target, input.trustedScores, item.candidate.reasons.find(reason => reason.startsWith("Prioritized by")))
    });
    usedTypes.add(item.resource.type);
    if (item.resource.type === "roadmap") selectedRoadmaps += 1;
  }
  return results;
}

function getResourcesForTarget(target: LearningResourceTarget) {
  return target.kind === "skill" ? getResourcesForSkill(target.skillId) : getResourcesForTool(target.toolId);
}
