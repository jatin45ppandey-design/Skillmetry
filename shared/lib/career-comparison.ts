import { careers, skillById } from "@skillmetry/shared/data/catalog";

export type CareerComparison = {
  primaryId: string;
  comparedId: string;
  shared: { skillId: string; label: string }[];
  primaryOnly: { skillId: string; label: string }[];
  comparedOnly: { skillId: string; label: string }[];
};

function entries(skillIds: readonly string[]) {
  return skillIds.map(skillId => ({ skillId, label: skillById[skillId]?.label ?? skillId }));
}

/** A catalog comparison only; it makes no claim about hiring fit or proficiency. */
export function compareCareerCurricula(primaryId: string, comparedId: string): CareerComparison | null {
  const primary = careers.find(career => career.id === primaryId);
  const compared = careers.find(career => career.id === comparedId);
  if (!primary || !compared || primary.id === compared.id) return null;
  const primarySkills = new Set(primary.skills.map(skill => skill.skillId));
  const comparedSkills = new Set(compared.skills.map(skill => skill.skillId));
  return {
    primaryId,
    comparedId,
    shared: entries([...primarySkills].filter(skillId => comparedSkills.has(skillId))).sort((a, b) => a.label.localeCompare(b.label)),
    primaryOnly: entries([...primarySkills].filter(skillId => !comparedSkills.has(skillId))).sort((a, b) => a.label.localeCompare(b.label)),
    comparedOnly: entries([...comparedSkills].filter(skillId => !primarySkills.has(skillId))).sort((a, b) => a.label.localeCompare(b.label))
  };
}
