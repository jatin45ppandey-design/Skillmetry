import { careers, skills } from "@skillmetry/shared/data/catalog";
import type { Career, CareerId, Mission, SkillMap } from "@skillmetry/shared/types/domain";

export type SkillState = "strong" | "developing" | "unassessed" | "blocked";
export type PrerequisiteEvidence = "met" | "not-assessed" | "below-threshold";

/** Prerequisite evidence is advisory: missing a quiz is never proof of failure. */
export function getPrerequisiteEvidence(skillId: string, proficiency: SkillMap) {
  const skill = skills.find(item => item.id === skillId);
  return (skill?.prerequisites ?? []).map(id => ({
    skillId: id,
    state: !Object.hasOwn(proficiency, id)
      ? "not-assessed" as const
      : clamp(proficiency[id]) >= 50
        ? "met" as const
        : "below-threshold" as const
  }));
}
export type SkillRecommendation = "assessment-recommended" | "skill-development";

export function clamp(n: number, low = 0, high = 100): number {
  return Math.min(high, Math.max(low, Number.isFinite(n) ? n : 0));
}
export function readiness(career: Career, proficiency: SkillMap): number | null {
  const assessed = career.skills.filter(({ skillId }) => Object.hasOwn(proficiency, skillId));
  const assessedWeight = assessed.reduce((sum, { weight }) => sum + weight, 0);
  if (assessedWeight === 0) return null;
  const weighted = assessed.reduce((sum, { skillId, weight }) => sum + weight * clamp(proficiency[skillId]) / 100, 0);
  return Math.round(weighted * 100 / assessedWeight);
}
export function applyScenario(proficiency: SkillMap, missions: Mission[]): SkillMap {
  const result = { ...proficiency };
  for (const mission of missions) {
    if (Object.hasOwn(result, mission.skillId)) {
      result[mission.skillId] = clamp(result[mission.skillId] + mission.simulatedGain);
    }
  }
  return result;
}
export function selectCareer(id: CareerId): Career {
  return careers.find(c => c.id === id) ?? careers[0];
}
export function getSkillGaps(career: Career, proficiency: SkillMap) {
  return career.skills.map(({ skillId, weight }) => ({
    skillId,
    weight,
    proficiency: Object.hasOwn(proficiency, skillId) ? clamp(proficiency[skillId]) : null,
    recommendation: Object.hasOwn(proficiency, skillId)
      ? "skill-development" as const
      : "assessment-recommended" as const,
    // Unknown performance has no numeric gap. Role weight orders assessment
    // recommendations without pretending that an unassessed skill scored 0%.
    priority: Object.hasOwn(proficiency, skillId)
      ? weight * (100 - clamp(proficiency[skillId])) / 100
      : null
  })).sort((a, b) => {
    if (a.recommendation !== b.recommendation) {
      return a.recommendation === "assessment-recommended" ? -1 : 1;
    }
    if (a.priority === null && b.priority === null) return b.weight - a.weight;
    return (b.priority ?? Number.NEGATIVE_INFINITY) - (a.priority ?? Number.NEGATIVE_INFINITY);
  });
}

export function getSkillState(skillId: string, proficiency: SkillMap): SkillState {
  const skill = skills.find(item => item.id === skillId);
  const assessed = Object.hasOwn(proficiency, skillId);
  const score = assessed ? clamp(proficiency[skillId]) : null;
  if (score !== null && score >= 75) return "strong";
  // An unavailable or untaken prerequisite assessment must never be an
  // artificial permanent lock on the learning roadmap.
  const blocked = skill?.prerequisites.some(id =>
    Object.hasOwn(proficiency, id) && clamp(proficiency[id]) < 50
  ) ?? false;
  if (blocked) return "blocked";
  if (score !== null) return "developing";
  return "unassessed";
}

export function getNextSkills(career: Career, proficiency: SkillMap, max = 3) {
  return getSkillGaps(career, proficiency)
    .filter(gap => getSkillState(gap.skillId, proficiency) !== "blocked" && (gap.proficiency === null || gap.proficiency < 75))
    .slice(0, max);
}
export function catalogIsValid() {
  const ids = new Set(skills.map(s => s.id));
  const knownSkills = skills.every(s => s.prerequisites.every(p => ids.has(p)));
  const sums = careers.every(c => c.skills.reduce((n, s) => n + s.weight, 0) === 100 && c.skills.every(s => ids.has(s.skillId)));
  const visiting = new Set<string>(), visited = new Set<string>();
  const graph = new Map(skills.map(s => [s.id, s.prerequisites]));
  const dfs = (id: string): boolean => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const child of graph.get(id) ?? []) if (!dfs(child)) return false;
    visiting.delete(id); visited.add(id); return true;
  };
  return knownSkills && sums && skills.every(s => dfs(s.id));
}
