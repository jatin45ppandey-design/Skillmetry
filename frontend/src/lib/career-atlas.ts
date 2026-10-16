import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { skillById } from "@skillmetry/shared/data/catalog";
import type { Career } from "@skillmetry/shared/types/domain";

export type AtlasNode = {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  required: boolean;
  assessmentId: string | null;
};
export type AtlasEdge = { from: string; to: string };

// A presentation-only layout for the canonical catalog. Never fabricate
// relationships, assessment results, skill states, or proficiency levels.
export function buildCareerAtlas(career: Career) {
  const required = new Set(career.skills.map(item => item.skillId));
  const included = new Set<string>();
  function add(id: string) {
    const skill = skillById[id];
    if (!skill || included.has(id)) return;
    included.add(id);
    skill.prerequisites.forEach(add);
  }
  career.skills.forEach(item => add(item.skillId));

  const depthMemo = new Map<string, number>();
  function depth(id: string, visiting = new Set<string>()): number {
    const cached = depthMemo.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;
    const skill = skillById[id];
    if (!skill) return 0;
    visiting.add(id);
    const parents = skill.prerequisites.filter(parent => included.has(parent));
    const value = parents.length ? 1 + Math.max(...parents.map(parent => depth(parent, visiting))) : 0;
    visiting.delete(id);
    depthMemo.set(id, value);
    return value;
  }
  const levels = new Map<number, string[]>();
  for (const id of included) {
    const tier = depth(id);
    levels.set(tier, [...(levels.get(tier) ?? []), id]);
  }
  const maxDepth = Math.max(1, ...levels.keys());
  const quizzes = new Map<string, string>(assessmentCatalog.map(quiz => [quiz.skillId, quiz.id]));
  const nodes: AtlasNode[] = [];
  for (const [tier, ids] of [...levels.entries()].sort(([a], [b]) => a - b)) {
    ids.forEach((id, index) => {
      nodes.push({
        id,
        label: skillById[id].label,
        group: skillById[id].group,
        x: 12 + (tier / maxDepth) * 76,
        y: 12 + ((index + .5) / ids.length) * 76,
        required: required.has(id),
        assessmentId: quizzes.get(id) ?? null
      });
    });
  }
  const edges: AtlasEdge[] = [];
  for (const id of included) {
    for (const parent of skillById[id].prerequisites) {
      if (included.has(parent)) edges.push({ from: parent, to: id });
    }
  }
  return { nodes, edges };
}
