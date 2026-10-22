import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { assertValidCurriculumCatalog } from "@skillmetry/shared/lib/curriculum";
import type {
  CurriculumCatalog,
  CurriculumDifficulty,
  CurriculumLessonId,
  CurriculumSubtopicId,
  CurriculumTopicId
} from "@skillmetry/shared/types/curriculum";
import type { SkillId } from "@skillmetry/shared/types/domain";

export const CURRICULUM_VERSION = "2026.1";
const internalSource = [{ kind: "internal-catalog" as const, label: "Skillmetry canonical catalog" }];

export function topicIdForSkill(skillId: SkillId): CurriculumTopicId {
  return `${skillId}:topic:foundations`;
}

export function subtopicIdForSkill(skillId: SkillId): CurriculumSubtopicId {
  return `${skillId}:subtopic:core-concepts`;
}

export function lessonIdForSkill(skillId: SkillId): CurriculumLessonId {
  return `${skillId}:lesson:foundations-overview`;
}

function difficultyForGroup(group: "Foundation" | "Core" | "Applied"): CurriculumDifficulty {
  if (group === "Foundation") return "beginner";
  if (group === "Core") return "intermediate";
  return "advanced";
}

const practices = assessmentCatalog.map(assessment => ({
  id: `assessment:${assessment.id}` as const,
  assessmentId: assessment.id,
  skillId: assessment.skillId,
  title: assessment.title,
  href: `/assessments?assessment=${encodeURIComponent(assessment.id)}`,
  kind: "assessment" as const,
  availability: "available" as const
}));

const rawCatalog = {
  version: CURRICULUM_VERSION,
  careers: careers.map(career => ({ careerId: career.id, skillIds: career.skills.map(item => item.skillId) })),
  skills: skills.map(skill => ({
    skillId: skill.id,
    prerequisiteSkillIds: [...skill.prerequisites],
    topicIds: [topicIdForSkill(skill.id)]
  })),
  topics: skills.map((skill, order) => ({
    id: topicIdForSkill(skill.id),
    skillIds: [skill.id],
    title: `${skill.label} foundations`,
    description: skill.description,
    prerequisiteTopicIds: skill.prerequisites.map(topicIdForSkill),
    difficulty: difficultyForGroup(skill.group),
    order,
    learningObjectives: [skill.description],
    version: CURRICULUM_VERSION,
    sources: internalSource
  })),
  subtopics: skills.map((skill, order) => ({
    id: subtopicIdForSkill(skill.id),
    topicId: topicIdForSkill(skill.id),
    title: `${skill.label} core concepts`,
    description: `Study the concepts and vocabulary needed to apply ${skill.label} in the existing Skillmetry learning path.`,
    difficulty: difficultyForGroup(skill.group),
    order,
    learningObjectives: [skill.description],
    version: CURRICULUM_VERSION,
    sources: internalSource
  })),
  lessons: skills.map((skill, order) => ({
    id: lessonIdForSkill(skill.id),
    subtopicId: subtopicIdForSkill(skill.id),
    title: `${skill.label} foundations overview`,
    summary: `Use the existing curated material to build a practical foundation in ${skill.label}.`,
    difficulty: difficultyForGroup(skill.group),
    order,
    learningObjectives: [skill.description],
    resourceIds: learningResources.filter(resource =>
      (resource.target.kind === "skill" && resource.target.skillId === skill.id)
      || resource.relatedSkillIds?.includes(skill.id)
    ).map(resource => resource.id),
    practiceIds: practices.filter(practice => practice.skillId === skill.id).map(practice => practice.id),
    version: CURRICULUM_VERSION,
    sources: internalSource
  })),
  practices
} satisfies CurriculumCatalog;

export const curriculumCatalog = assertValidCurriculumCatalog(
  rawCatalog,
  new Set(learningResources.map(resource => resource.id))
);

export const curriculumTopicById = Object.fromEntries(curriculumCatalog.topics.map(topic => [topic.id, topic]));
export const curriculumSubtopicById = Object.fromEntries(curriculumCatalog.subtopics.map(subtopic => [subtopic.id, subtopic]));
export const curriculumLessonById = Object.fromEntries(curriculumCatalog.lessons.map(lesson => [lesson.id, lesson]));

export function getCurriculumForCareer(careerId: string) {
  const career = curriculumCatalog.careers.find(entry => entry.careerId === careerId);
  if (!career) return null;
  const curriculumSkills = career.skillIds.flatMap(skillId => {
    const skill = curriculumCatalog.skills.find(entry => entry.skillId === skillId);
    return skill ? [skill] : [];
  });
  const topics = curriculumSkills.flatMap(skill => skill.topicIds).flatMap(topicId => {
    const topic = curriculumCatalog.topics.find(entry => entry.id === topicId);
    return topic ? [topic] : [];
  });
  return {
    career,
    skills: curriculumSkills,
    topics
  };
}

export function getCurriculumLessonResources(lessonId: string) {
  const lesson = curriculumCatalog.lessons.find(entry => entry.id === lessonId);
  if (!lesson) return [];
  const resourceIds = new Set(lesson.resourceIds);
  return learningResources.filter(resource => resourceIds.has(resource.id));
}
