import type { AssessmentId, CareerId, SkillId } from "@skillmetry/shared/types/domain";

export type CurriculumDifficulty = "beginner" | "intermediate" | "advanced";
export type CurriculumSourceKind = "internal-catalog" | "curated-resource" | "publisher";
export type CurriculumTopicId = `${string}:topic:${string}`;
export type CurriculumSubtopicId = `${string}:subtopic:${string}`;
export type CurriculumLessonId = `${string}:lesson:${string}`;
export type CurriculumPracticeId = `assessment:${AssessmentId}` | `topic-practice:${CurriculumTopicId}`;

export type CurriculumSource = {
  kind: CurriculumSourceKind;
  label: string;
  url?: string;
};

export type CurriculumCareer = {
  careerId: CareerId;
  skillIds: SkillId[];
};

export type CurriculumSkill = {
  skillId: SkillId;
  prerequisiteSkillIds: SkillId[];
  topicIds: CurriculumTopicId[];
};

export type CurriculumTopic = {
  id: CurriculumTopicId;
  skillIds: SkillId[];
  title: string;
  description: string;
  prerequisiteTopicIds: CurriculumTopicId[];
  difficulty: CurriculumDifficulty;
  order: number;
  learningObjectives: string[];
  learningOutcomes: string[];
  primaryResourceIds: string[];
  recommendedResourceIds: string[];
  version: string;
  sources: CurriculumSource[];
};

export type CurriculumSubtopic = {
  id: CurriculumSubtopicId;
  topicId: CurriculumTopicId;
  title: string;
  description: string;
  difficulty: CurriculumDifficulty;
  order: number;
  learningObjectives: string[];
  learningOutcomes: string[];
  version: string;
  sources: CurriculumSource[];
};

export type CurriculumLesson = {
  id: CurriculumLessonId;
  subtopicId: CurriculumSubtopicId;
  title: string;
  summary: string;
  explanation: string;
  example: string;
  commonMistakes: string[];
  task: string;
  estimatedMinutes: number;
  difficulty: CurriculumDifficulty;
  order: number;
  learningObjectives: string[];
  learningOutcomes: string[];
  resourceIds: string[];
  practiceIds: CurriculumPracticeId[];
  version: string;
  sources: CurriculumSource[];
};

export type CurriculumPractice = {
  id: CurriculumPracticeId;
  skillId: SkillId;
  title: string;
  href: string;
  availability: "available";
} & ({
  kind: "assessment";
  assessmentId: AssessmentId;
} | {
  kind: "topic-practice";
  topicId: CurriculumTopicId;
});

export type CurriculumCatalog = {
  version: string;
  careers: CurriculumCareer[];
  skills: CurriculumSkill[];
  topics: CurriculumTopic[];
  subtopics: CurriculumSubtopic[];
  lessons: CurriculumLesson[];
  practices: CurriculumPractice[];
};

export type CurriculumValidationIssueCode =
  | "schema"
  | "duplicate-id"
  | "invalid-reference"
  | "circular-prerequisite"
  | "missing-relationship";

export type CurriculumValidationIssue = {
  code: CurriculumValidationIssueCode;
  path: string;
  message: string;
};

export type CurriculumValidationResult =
  | { success: true; data: CurriculumCatalog; issues: [] }
  | { success: false; issues: CurriculumValidationIssue[] };
