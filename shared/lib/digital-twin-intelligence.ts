import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import { toolById } from "@skillmetry/shared/data/learning-catalog";
import { performanceLabel } from "@skillmetry/shared/lib/assessments/grading";
import { buildRecommendations } from "@skillmetry/shared/lib/recommendations";
import { getResourceBrowseHref, getResourcesForPhaseARecommendation } from "@skillmetry/shared/lib/resource-intelligence";
import type { AssessmentAttempt, AssessmentRoute, CareerId, LearningPreferences, LearningRecommendation, SkillId } from "@skillmetry/shared/types/domain";

export type TwinEvidenceState = "measured" | "assessment-available-not-taken" | "assessment-unavailable";
export type TwinContext = "authenticated" | "demo";
export type TrustedTwinAttempt = AssessmentAttempt & { gradingMethod?: "server_quiz" | "legacy_untrusted"; source?: "authenticated" | "demo"; valid?: boolean };
export type AssessmentGrowthHistory = { skillId: SkillId; attempts: readonly AssessmentAttempt[]; first: AssessmentAttempt | null; latest: AssessmentAttempt | null; previous: AssessmentAttempt | null; best: AssessmentAttempt | null; latestDelta: number | null; firstToLatestDelta: number | null; crossVersionComparison: boolean; };
export type SkillTwinSnapshot = { skillId: SkillId; label: string; assessment: AssessmentRoute; evidenceState: TwinEvidenceState; score: number | null; band: "Not Assessed" | "Needs Improvement" | "Developing" | "Strong Quiz Performance"; latestAttemptId: string | null; latestCompletedAt: string | null; assessmentVersion: string | null; attemptCount: number; prerequisites: readonly SkillId[]; learningGoal: "career" | "skill" | "tool" | null; history: AssessmentGrowthHistory; };
export type EvidenceCoverage = { measuredSkillCount: number; catalogSkillCount: number; catalogCoveragePercent: number; };
export type CareerAlignmentSnapshot = { careerId: CareerId; careerTitle: string; totalWeight: number; measuredWeight: number; availableUnmeasuredWeight: number; unavailableWeight: number; measuredSkillIds: readonly SkillId[]; availableUnmeasuredSkillIds: readonly SkillId[]; unavailableSkillIds: readonly SkillId[]; weightedEvidenceCoveragePercent: number; assessmentAvailabilityCeilingPercent: number; observedWeightedPerformance: number | null; improvementOpportunities: readonly SkillId[]; limitation: string; };
export type DigitalTwinInsight = { id: string; type: "strong-performance" | "improvement-opportunity" | "reassessment-opportunity" | "assessment-recommended" | "prerequisite-priority" | "resource-suggestion" | "insufficient-evidence"; skillId?: SkillId; toolId?: string; evidenceState: TwinEvidenceState | "tool-unassessed"; attemptId?: string; explanation: string; priority: "now" | "next" | "later"; action: { kind: "assessment" | "resources" | "none"; href?: string }; resourceIds: readonly string[]; };
export type DigitalTwinSnapshot = { context: TwinContext; skills: readonly SkillTwinSnapshot[]; catalogCoverage: EvidenceCoverage; careers: readonly CareerAlignmentSnapshot[]; selectedCareerId: CareerId | null; insights: readonly DigitalTwinInsight[]; };

const assessmentBySkill = new Map<SkillId, (typeof assessmentCatalog)[number]>(assessmentCatalog.map(item => [item.skillId, item]));
const knownSkillIds = new Set(skills.map(skill => skill.id));

function routeFor(skillId: SkillId): AssessmentRoute { const assessment = assessmentBySkill.get(skillId); return assessment ? { available: true, assessmentId: assessment.id, href: "/assessments" } : { available: false }; }
function ordered(attempts: readonly AssessmentAttempt[]) { return [...attempts].sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.id.localeCompare(b.id)); }
function trustedAttempts(input: readonly TrustedTwinAttempt[], context: TwinContext): AssessmentAttempt[] {
  const ids = new Set<string>();
  const trusted: AssessmentAttempt[] = [];

  for (const attempt of input) {
    const assessment = assessmentBySkill.get(attempt.skillId);
    const belongsToOtherContext = context === "authenticated"
      ? attempt.source === "demo"
      : attempt.source === "authenticated";

    if (
      ids.has(attempt.id)
      || !knownSkillIds.has(attempt.skillId)
      || !assessment
      || attempt.assessmentId !== assessment.id
      || attempt.gradingMethod === "legacy_untrusted"
      || attempt.valid === false
      || belongsToOtherContext
      || !Number.isInteger(attempt.score)
      || attempt.score < 0
      || attempt.score > 100
      || Number.isNaN(Date.parse(attempt.completedAt))
    ) continue;

    ids.add(attempt.id);
    trusted.push(attempt);
  }

  return ordered(trusted);
}
function historyFor(skillId: SkillId, attempts: readonly AssessmentAttempt[]): AssessmentGrowthHistory {
  const points = ordered(attempts.filter(attempt => attempt.skillId === skillId));
  const first = points[0] ?? null, latest = points.at(-1) ?? null, previous = points.length > 1 ? points.at(-2) ?? null : null;
  const best = points.reduce<AssessmentAttempt | null>((current, attempt) => !current || attempt.score > current.score || attempt.score === current.score && (Date.parse(attempt.completedAt) > Date.parse(current.completedAt) || attempt.completedAt === current.completedAt && attempt.id > current.id) ? attempt : current, null);
  return { skillId, attempts: points, first, latest, previous, best, latestDelta: latest && previous ? latest.score - previous.score : null, firstToLatestDelta: latest && first && latest.id !== first.id ? latest.score - first.score : null, crossVersionComparison: Boolean(latest && previous && latest.assessmentVersion !== previous.assessmentVersion) };
}
function band(score: number | null): SkillTwinSnapshot["band"] { return score === null ? "Not Assessed" : performanceLabel(score); }

export function buildSkillTwinSnapshots(input: { attempts: readonly TrustedTwinAttempt[]; learning: LearningPreferences; context?: TwinContext }): SkillTwinSnapshot[] {
  const context = input.context ?? "authenticated";
  const attempts = trustedAttempts(input.attempts, context);
  return skills.map(skill => {
    const history = historyFor(skill.id, attempts), latest = history.latest, assessment = routeFor(skill.id);
    const learningGoal = input.learning.selectedSkillIds.includes(skill.id) ? "skill" : input.learning.selectedToolIds.some(toolId => toolById[toolId]?.canonicalSkillId === skill.id) ? "tool" : careers.find(career => career.id === input.learning.primaryCareerId)?.skills.some(item => item.skillId === skill.id) ? "career" : null;
    return { skillId: skill.id, label: skill.label, assessment, evidenceState: latest ? "measured" : assessment.available ? "assessment-available-not-taken" : "assessment-unavailable", score: latest?.score ?? null, band: band(latest?.score ?? null), latestAttemptId: latest?.id ?? null, latestCompletedAt: latest?.completedAt ?? null, assessmentVersion: latest?.assessmentVersion ?? null, attemptCount: history.attempts.length, prerequisites: skill.prerequisites, learningGoal, history };
  });
}

export function buildCareerAlignment(careerId: CareerId, skillSnapshots: readonly SkillTwinSnapshot[], recommendations: readonly LearningRecommendation[] = []): CareerAlignmentSnapshot {
  const career = careers.find(item => item.id === careerId)!;
  const bySkill = new Map(skillSnapshots.map(snapshot => [snapshot.skillId, snapshot]));
  const measured = career.skills.filter(item => bySkill.get(item.skillId)?.evidenceState === "measured");
  const available = career.skills.filter(item => bySkill.get(item.skillId)?.evidenceState === "assessment-available-not-taken");
  const unavailable = career.skills.filter(item => bySkill.get(item.skillId)?.evidenceState === "assessment-unavailable");
  const totalWeight = career.skills.reduce((sum, item) => sum + item.weight, 0);
  const measuredWeight = measured.reduce((sum, item) => sum + item.weight, 0);
  const availableUnmeasuredWeight = available.reduce((sum, item) => sum + item.weight, 0);
  const unavailableWeight = unavailable.reduce((sum, item) => sum + item.weight, 0);
  const observedWeightedPerformance = measuredWeight ? Math.round(measured.reduce((sum, item) => sum + item.weight * (bySkill.get(item.skillId)?.score ?? 0), 0) / measuredWeight) : null;
  const improvementOpportunities = recommendations.filter(item => item.skillId && career.skills.some(requirement => requirement.skillId === item.skillId)).map(item => item.skillId!).filter((id, index, items) => items.indexOf(id) === index);
  return { careerId, careerTitle: career.title, totalWeight, measuredWeight, availableUnmeasuredWeight, unavailableWeight, measuredSkillIds: measured.map(item => item.skillId), availableUnmeasuredSkillIds: available.map(item => item.skillId), unavailableSkillIds: unavailable.map(item => item.skillId), weightedEvidenceCoveragePercent: Math.round(measuredWeight * 100 / totalWeight), assessmentAvailabilityCeilingPercent: Math.round((measuredWeight + availableUnmeasuredWeight) * 100 / totalWeight), observedWeightedPerformance, improvementOpportunities, limitation: "Observed quiz performance covers measured career skills only; unavailable or unmeasured requirements are not treated as zero." };
}

function insightsFor(learning: LearningPreferences, snapshots: readonly SkillTwinSnapshot[], attempts: readonly AssessmentAttempt[]) {
  const scores = Object.fromEntries(snapshots.flatMap(snapshot => snapshot.score === null ? [] : [[snapshot.skillId, snapshot.score]]));
  const plan = buildRecommendations({ learning, trustedScores: scores, trustedAttempts: attempts });
  const bySkill = new Map(snapshots.map(snapshot => [snapshot.skillId, snapshot]));
  return plan.recommendations.map<DigitalTwinInsight>(recommendation => {
    const snapshot = recommendation.skillId ? bySkill.get(recommendation.skillId) : undefined;
    const resources = getResourcesForPhaseARecommendation(recommendation);
    const isAssessment = recommendation.action === "take-assessment" || recommendation.action === "reassess";
    const href = isAssessment && recommendation.assessment.available ? `/assessments?assessment=${recommendation.assessment.assessmentId}` : recommendation.kind === "tool" && recommendation.toolId ? getResourceBrowseHref({ kind: "tool", toolId: recommendation.toolId }) : recommendation.skillId ? getResourceBrowseHref({ kind: "skill", skillId: recommendation.skillId }) : undefined;
    const type = recommendation.action === "reassess" ? "reassessment-opportunity" : recommendation.action === "take-assessment" ? "assessment-recommended" : recommendation.action === "review-prerequisite" ? "prerequisite-priority" : recommendation.action === "explore-tool" ? "resource-suggestion" : snapshot?.score !== null && snapshot?.score !== undefined && snapshot.score >= 75 ? "strong-performance" : "improvement-opportunity";
    return { id: `insight:${recommendation.id}`, type, skillId: recommendation.skillId, toolId: recommendation.toolId, evidenceState: snapshot?.evidenceState ?? "tool-unassessed", ...(snapshot?.latestAttemptId ? { attemptId: snapshot.latestAttemptId } : {}), explanation: recommendation.explanation, priority: recommendation.slot, action: href ? { kind: isAssessment ? "assessment" : "resources", href } : { kind: "none" }, resourceIds: resources.map(resource => resource.id) };
  });
}

export function buildDigitalTwinSnapshot(input: { attempts: readonly TrustedTwinAttempt[]; learning: LearningPreferences; context?: TwinContext }): DigitalTwinSnapshot {
  const context = input.context ?? "authenticated";
  const attempts = trustedAttempts(input.attempts, context);
  const skills = buildSkillTwinSnapshots({ attempts, learning: input.learning, context });
  const catalogCoverage = { measuredSkillCount: skills.filter(skill => skill.evidenceState === "measured").length, catalogSkillCount: skills.length, catalogCoveragePercent: Math.round(skills.filter(skill => skill.evidenceState === "measured").length * 100 / skills.length) };
  const scores = Object.fromEntries(skills.flatMap(skill => skill.score === null ? [] : [[skill.skillId, skill.score]]));
  const plan = buildRecommendations({ learning: input.learning, trustedScores: scores, trustedAttempts: attempts });
  return { context, skills, catalogCoverage, careers: careers.map(career => buildCareerAlignment(career.id, skills, plan.recommendations)), selectedCareerId: input.learning.primaryCareerId, insights: insightsFor(input.learning, skills, attempts) };
}
