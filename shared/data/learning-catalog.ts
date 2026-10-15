import { skills } from "@skillmetry/shared/data/catalog";
import type { SkillId, ToolId } from "@skillmetry/shared/types/domain";

export type LearningTool = {
  id: ToolId;
  label: string;
  description: string;
  /** A tool may reinforce a canonical skill without creating a separate score. */
  canonicalSkillId?: SkillId;
};

export const learningTools: readonly LearningTool[] = [
  { id: "git", label: "Git", description: "Track changes and collaborate safely." },
  { id: "github", label: "GitHub", description: "Share code and collaborate on reviews." },
  { id: "docker", label: "Docker", description: "Containerize services reproducibly.", canonicalSkillId: "docker" },
  { id: "postman", label: "Postman", description: "Inspect and test HTTP APIs." }
];

export const canonicalSkillIds = skills.map(skill => skill.id) as [SkillId, ...SkillId[]];
export const toolIds = learningTools.map(tool => tool.id) as [ToolId, ...ToolId[]];
export const toolById = Object.fromEntries(learningTools.map(tool => [tool.id, tool])) as Record<ToolId, LearningTool>;

export function isCanonicalSkillId(value: string): value is SkillId {
  return canonicalSkillIds.includes(value);
}

export function isToolId(value: string): value is ToolId {
  return toolIds.includes(value as ToolId);
}
