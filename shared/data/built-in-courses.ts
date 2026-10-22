import { skillById } from "@skillmetry/shared/data/catalog";
import { CURRICULUM_VERSION, getCurriculumForSkill } from "@skillmetry/shared/data/curriculum";
import { coursePayloadSchema, type CoursePayload } from "@skillmetry/shared/lib/admin-courses";
import type { SkillId } from "@skillmetry/shared/types/domain";

export type BuiltInCourse = CoursePayload & {
  slug: string;
  skillId: SkillId;
  version: number;
  source: "skillmetry-curriculum";
};

const sourceAttribution = [{ label: "Skillmetry original curriculum" }];

function buildCourse(skillId: SkillId): BuiltInCourse {
  const path = getCurriculumForSkill(skillId);
  const skill = skillById[skillId];
  if (!path || !skill) throw new Error(`Missing curriculum for ${skillId}`);
  const payload: CoursePayload = {
    title: `${skill.label} learning path`,
    summary: `A three-stage ${skill.label} course with original explanations, practical examples, common mistakes, and reviewed learning references.`,
    modules: path.topics.map(({ topic, subtopics }) => ({
      id: topic.id.split(":topic:")[1],
      title: topic.title,
      lessons: subtopics.flatMap(({ subtopic, lessons }) => lessons.map(lesson => ({
        id: lesson.id.split(":lesson:")[1],
        title: lesson.title,
        summary: lesson.summary,
        kind: "reading" as const,
        notes: [
          lesson.explanation,
          `Worked example: ${lesson.example}`,
          ...lesson.commonMistakes.map(mistake => `Common mistake: ${mistake}`)
        ],
        task: lesson.task,
        estimatedMinutes: lesson.estimatedMinutes,
        curriculum: {
          topicId: topic.id,
          subtopicId: subtopic.id,
          version: CURRICULUM_VERSION,
          learningObjectives: lesson.learningObjectives,
          sourceAttribution
        }
      })))
    }))
  };
  return {
    slug: `skillmetry-${skillId}-path`,
    skillId,
    version: 1,
    source: "skillmetry-curriculum",
    ...coursePayloadSchema.parse(payload)
  };
}

export const builtInCourses = Object.keys(skillById).map(skillId => buildCourse(skillId as SkillId));
export const builtInCourseBySlug = Object.fromEntries(builtInCourses.map(course => [course.slug, course]));
