export type CareerId = "ml-engineer" | "frontend-developer" | "backend-developer";
export type SkillId = string;
export type Skill = {
  id: SkillId;
  label: string;
  group: "Foundation" | "Core" | "Applied";
  description: string;
  prerequisites: SkillId[];
};
export type WeightedSkill = { skillId: SkillId; weight: number };
export type Career = { id: CareerId; title: string; subtitle: string; icon: string; skills: WeightedSkill[] };
export type SkillMap = Record<SkillId, number>;
export type Mission = {
  id: string;
  roleId: CareerId;
  title: string;
  description: string;
  skillId: SkillId;
  estimatedHours: number;
  simulatedGain: number;
  deliverables: string[];
};
export type QuizQuestion = { id: string; prompt: string; choices: string[]; correctIndex: number };
export type Assessment = { id: string; skillId: SkillId; title: string; questions: QuizQuestion[] };
export type AssessmentAttempt = { assessmentId: string; score: number; passed: boolean; attemptedAt: string };
