import { skillById } from "@skillmetry/shared/data/catalog";
import { curriculumCatalog, curriculumSubtopicById, curriculumTopicById } from "@skillmetry/shared/data/curriculum";
import { learningResources } from "@skillmetry/shared/data/learning-resources";

const documentationTypes = new Set(["documentation", "tutorial", "course", "roadmap"]);

export function getCurriculumCoverageReport() {
  const resourceById = new Map(learningResources.map(resource => [resource.id, resource]));
  const topicCoverage = curriculumCatalog.topics.map(topic => {
    const resources = [...topic.primaryResourceIds, ...topic.recommendedResourceIds]
      .flatMap(id => resourceById.get(id) ?? []);
    const available = resources.filter(resource => resource.availabilityStatus === "available");
    const subtopicIds = new Set(curriculumCatalog.subtopics.filter(entry => entry.topicId === topic.id).map(entry => entry.id));
    const lessons = curriculumCatalog.lessons.filter(lesson => subtopicIds.has(lesson.subtopicId));
    return {
      topicId: topic.id,
      skillId: topic.skillIds[0],
      lessons: lessons.length,
      primaryResources: topic.primaryResourceIds.length,
      availableResources: available.length,
      documentation: available.filter(resource => documentationTypes.has(resource.type)).length,
      videos: available.filter(resource => resource.type === "video").length,
      practice: available.filter(resource => resource.type === "practice").length + lessons.filter(lesson => lesson.task.trim().length > 0).length + lessons.reduce((count, lesson) => count + lesson.practiceIds.length, 0),
      missing: [
        ...(topic.primaryResourceIds.length ? [] : ["primary-resource"]),
        ...(lessons.length ? [] : ["lesson"]),
        ...(available.some(resource => documentationTypes.has(resource.type)) ? [] : ["documentation"]),
        ...(available.some(resource => resource.type === "video") ? [] : ["video"]),
        ...(available.some(resource => resource.type === "practice") || lessons.some(lesson => lesson.practiceIds.length || lesson.task.trim().length > 0) ? [] : ["practice"])
      ]
    };
  });
  const skills = curriculumCatalog.skills.map(skill => {
    const topics = topicCoverage.filter(topic => topic.skillId === skill.skillId);
    const subtopics = curriculumCatalog.subtopics.filter(subtopic => curriculumTopicById[subtopic.topicId]?.skillIds.includes(skill.skillId));
    const subtopicIds = new Set(subtopics.map(subtopic => subtopic.id));
    const lessons = curriculumCatalog.lessons.filter(lesson => subtopicIds.has(lesson.subtopicId));
    return {
      skillId: skill.skillId,
      skill: skillById[skill.skillId]?.label ?? skill.skillId,
      topics: topics.length,
      subtopics: subtopics.length,
      lessons: lessons.length,
      resources: new Set(topics.flatMap(topic => {
        const catalogTopic = curriculumTopicById[topic.topicId];
        return catalogTopic ? [...catalogTopic.primaryResourceIds, ...catalogTopic.recommendedResourceIds] : [];
      })).size,
      missing: topics.flatMap(topic => topic.missing.map(kind => `${topic.topicId}:${kind}`))
    };
  });
  return {
    version: curriculumCatalog.version,
    totals: {
      careers: curriculumCatalog.careers.length,
      skills: curriculumCatalog.skills.length,
      topics: curriculumCatalog.topics.length,
      subtopics: curriculumCatalog.subtopics.length,
      lessons: curriculumCatalog.lessons.length,
      resourcesReviewed: learningResources.length,
      resourcesAccepted: learningResources.filter(resource => resource.availabilityStatus === "available").length,
      resourcesUnverified: learningResources.filter(resource => resource.availabilityStatus === "unverified").length,
      resourcesUnavailable: learningResources.filter(resource => resource.availabilityStatus === "unavailable").length
    },
    skills,
    topics: topicCoverage,
    unresolved: topicCoverage.flatMap(topic => topic.missing.map(kind => ({ topicId: topic.topicId, kind })))
  };
}

export function getLessonContext(lessonId: string) {
  const lesson = curriculumCatalog.lessons.find(entry => entry.id === lessonId);
  const subtopic = lesson ? curriculumSubtopicById[lesson.subtopicId] : null;
  const topic = subtopic ? curriculumTopicById[subtopic.topicId] : null;
  return lesson && subtopic && topic ? { lesson, subtopic, topic } : null;
}
