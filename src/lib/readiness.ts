import { careers, skills } from "@/data/catalog";
import type { Career, CareerId, Mission, SkillMap } from "@/types/domain";

export function clamp(n: number, low = 0, high = 100): number {
  return Math.min(high, Math.max(low, Number.isFinite(n) ? n : 0));
}
export function readiness(career: Career, proficiency: SkillMap): number {
  const weighted = career.skills.reduce((sum, { skillId, weight }) => sum + weight * clamp(proficiency[skillId] ?? 0) / 100, 0);
  return Math.round(weighted);
}
export function applyScenario(proficiency: SkillMap, missions: Mission[]): SkillMap {
  const result = { ...proficiency };
  for (const mission of missions) result[mission.skillId] = clamp((result[mission.skillId] ?? 0) + mission.simulatedGain);
  return result;
}
export function selectCareer(id: CareerId): Career {
  return careers.find(c => c.id === id) ?? careers[0];
}
export function getSkillGaps(career: Career, proficiency: SkillMap) {
  return career.skills.map(({ skillId, weight }) => ({
    skillId,
    weight,
    proficiency: clamp(proficiency[skillId] ?? 0),
    // Higher weighted and less-developed skills come first.
    priority: weight * (100 - clamp(proficiency[skillId] ?? 0)) / 100
  })).sort((a, b) => b.priority - a.priority);
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
