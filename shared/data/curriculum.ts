import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import {
  curriculumBlueprintBySkill,
  curriculumLessonId,
  curriculumSubtopicId,
  curriculumTopicId,
  skillCurriculumBlueprints
} from "@skillmetry/shared/data/curriculum-blueprints";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { assertValidCurriculumCatalog } from "@skillmetry/shared/lib/curriculum";
import type { CurriculumCatalog, CurriculumLessonId, CurriculumTopicId } from "@skillmetry/shared/types/curriculum";
import type { SkillId } from "@skillmetry/shared/types/domain";

export const CURRICULUM_VERSION = "2026.2";
const internalSource = [{ kind: "internal-catalog" as const, label: "Skillmetry original curriculum" }];

function supplementalVideoIds(skillId: SkillId) {
  return learningResources
    .filter(resource => resource.type === "video" && resource.target.kind === "skill" && resource.target.skillId === skillId)
    .slice(0, 1)
    .map(resource => resource.id);
}

export function topicIdForSkill(skillId: SkillId): CurriculumTopicId {
  return curriculumTopicId(skillId, curriculumBlueprintBySkill[skillId].topics[0].slug);
}

export function subtopicIdForSkill(skillId: SkillId) {
  return curriculumSubtopicId(skillId, curriculumBlueprintBySkill[skillId].topics[0].slug);
}

export function lessonIdForSkill(skillId: SkillId): CurriculumLessonId {
  return curriculumLessonId(skillId, curriculumBlueprintBySkill[skillId].topics[0].lesson.slug);
}

const assessmentPractices = assessmentCatalog.map(assessment => ({
  id: `assessment:${assessment.id}` as const,
  assessmentId: assessment.id,
  skillId: assessment.skillId,
  title: assessment.title,
  href: `/assessments?assessment=${encodeURIComponent(assessment.id)}`,
  kind: "assessment" as const,
  availability: "available" as const
}));

const topicPractices = skillCurriculumBlueprints.flatMap(skill => skill.topics.map(entry => {
  const topicId = curriculumTopicId(skill.skillId, entry.slug);
  return {
    id: `topic-practice:${topicId}` as const,
    topicId,
    skillId: skill.skillId,
    title: `${entry.title} practice`,
    href: `/practice?topic=${encodeURIComponent(topicId)}`,
    kind: "topic-practice" as const,
    availability: "available" as const
  };
}));

const practices = [...topicPractices, ...assessmentPractices];

const topics = skillCurriculumBlueprints.flatMap(skill => skill.topics.map((entry, order) => ({
  id: curriculumTopicId(skill.skillId, entry.slug),
  skillIds: [skill.skillId],
  title: entry.title,
  description: entry.description,
  prerequisiteTopicIds: order === 0
    ? (skills.find(item => item.id === skill.skillId)?.prerequisites ?? []).map(prerequisite => topicIdForSkill(prerequisite))
    : [curriculumTopicId(skill.skillId, skill.topics[order - 1].slug)],
  difficulty: entry.difficulty,
  order,
  learningObjectives: [...entry.objectives],
  learningOutcomes: [...entry.outcomes],
  primaryResourceIds: [entry.resourceIds[0]],
  recommendedResourceIds: [...new Set([...entry.resourceIds.slice(1), ...supplementalVideoIds(skill.skillId)])],
  version: CURRICULUM_VERSION,
  sources: internalSource
})));

const subtopics = skillCurriculumBlueprints.flatMap(skill => skill.topics.map((entry, order) => ({
  id: curriculumSubtopicId(skill.skillId, entry.slug),
  topicId: curriculumTopicId(skill.skillId, entry.slug),
  title: entry.subtopicTitle,
  description: entry.description,
  difficulty: entry.difficulty,
  order,
  learningObjectives: [...entry.objectives],
  learningOutcomes: [...entry.outcomes],
  version: CURRICULUM_VERSION,
  sources: internalSource
})));

const lessons = skillCurriculumBlueprints.flatMap(skill => skill.topics.map((entry, order) => ({
  id: curriculumLessonId(skill.skillId, entry.lesson.slug),
  subtopicId: curriculumSubtopicId(skill.skillId, entry.slug),
  title: entry.lesson.title,
  summary: entry.lesson.summary,
  explanation: entry.lesson.explanation,
  example: entry.lesson.example,
  commonMistakes: [...entry.lesson.commonMistakes],
  task: entry.lesson.task,
  estimatedMinutes: entry.lesson.estimatedMinutes,
  difficulty: entry.difficulty,
  order,
  learningObjectives: [...entry.objectives],
  learningOutcomes: [...entry.outcomes],
  resourceIds: [...new Set([...entry.resourceIds, ...supplementalVideoIds(skill.skillId)])],
  practiceIds: [
    `topic-practice:${curriculumTopicId(skill.skillId, entry.slug)}` as const,
    ...(order === skill.topics.length - 1
      ? assessmentPractices.filter(practice => practice.skillId === skill.skillId).map(practice => practice.id)
      : [])
  ],
  version: CURRICULUM_VERSION,
  sources: internalSource
})));

const rawCatalog = {
  version: CURRICULUM_VERSION,
  careers: careers.map(career => ({ careerId: career.id, skillIds: career.skills.map(item => item.skillId) })),
  skills: skills.map(skill => ({
    skillId: skill.id,
    prerequisiteSkillIds: [...skill.prerequisites],
    topicIds: curriculumBlueprintBySkill[skill.id].topics.map(entry => curriculumTopicId(skill.id, entry.slug))
  })),
  topics,
  subtopics,
  lessons,
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
  const careerTopics = curriculumSkills.flatMap(skill => skill.topicIds).flatMap(topicId => {
    const entry = curriculumTopicById[topicId];
    return entry ? [entry] : [];
  });
  return { career, skills: curriculumSkills, topics: careerTopics };
}

export function getCurriculumForSkill(skillId: string) {
  const skill = curriculumCatalog.skills.find(entry => entry.skillId === skillId);
  if (!skill) return null;
  const skillTopics = skill.topicIds.flatMap(topicId => {
    const entry = curriculumTopicById[topicId];
    return entry ? [entry] : [];
  });
  const path = skillTopics.map(topic => {
    const topicSubtopics = curriculumCatalog.subtopics.filter(subtopic => subtopic.topicId === topic.id);
    return {
      topic,
      subtopics: topicSubtopics.map(subtopic => ({
        subtopic,
        lessons: curriculumCatalog.lessons.filter(lesson => lesson.subtopicId === subtopic.id)
      }))
    };
  });
  return { skill, topics: path };
}

export function getCurriculumLessonResources(lessonId: string) {
  const lesson = curriculumCatalog.lessons.find(entry => entry.id === lessonId);
  if (!lesson) return [];
  const resourceIds = new Set(lesson.resourceIds);
  return learningResources.filter(resource => resourceIds.has(resource.id));
}

export function getCurriculumLessonRoute(lessonId: string) {
  const lesson = curriculumLessonById[lessonId];
  if (!lesson) return null;
  const subtopic = curriculumSubtopicById[lesson.subtopicId];
  const topic = subtopic ? curriculumTopicById[subtopic.topicId] : null;
  const skillId = topic?.skillIds[0];
  if (!topic || !skillId) return null;
  return `/learn/${encodeURIComponent(skillId)}/${encodeURIComponent(topic.id.split(":topic:")[1])}/${encodeURIComponent(lesson.id.split(":lesson:")[1])}`;
}

export function getCurriculumLessonByRoute(skillId: string, topicSlug: string, lessonSlug: string) {
  const topic = curriculumTopicById[`${skillId}:topic:${topicSlug}`];
  const lesson = curriculumLessonById[`${skillId}:lesson:${lessonSlug}`];
  if (!topic || !lesson || !topic.skillIds.includes(skillId)) return null;
  const subtopic = curriculumSubtopicById[lesson.subtopicId];
  if (!subtopic || subtopic.topicId !== topic.id) return null;
  const resources = getCurriculumLessonResources(lesson.id);
  const skillPath = getCurriculumForSkill(skillId);
  const orderedLessons = skillPath?.topics.flatMap(entry => entry.subtopics.flatMap(item => item.lessons)) ?? [];
  const index = orderedLessons.findIndex(entry => entry.id === lesson.id);
  return {
    topic,
    subtopic,
    lesson,
    resources,
    previous: index > 0 ? orderedLessons[index - 1] : null,
    next: index >= 0 && index < orderedLessons.length - 1 ? orderedLessons[index + 1] : null,
    position: index + 1,
    total: orderedLessons.length
  };
}
