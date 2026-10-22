import { describe, expect, it } from "vitest";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import {
  CURRICULUM_VERSION,
  curriculumCatalog,
  getCurriculumForCareer,
  lessonIdForSkill,
  topicIdForSkill
} from "@skillmetry/shared/data/curriculum";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { validateCurriculumCatalog } from "@skillmetry/shared/lib/curriculum";
import {
  getResourcesForCurriculumLesson,
  getResourcesForCurriculumTopic
} from "@skillmetry/shared/lib/resource-intelligence";

const resourceIds = new Set(learningResources.map(resource => resource.id));

describe("normalized curriculum architecture", () => {
  it("connects every existing career and skill to a versioned topic, subtopic, lesson, and real resource", () => {
    expect(CURRICULUM_VERSION).toBe("2026.1");
    expect(curriculumCatalog.careers).toHaveLength(careers.length);
    expect(curriculumCatalog.skills).toHaveLength(skills.length);
    expect(curriculumCatalog.topics).toHaveLength(skills.length);
    expect(curriculumCatalog.subtopics).toHaveLength(skills.length);
    expect(curriculumCatalog.lessons).toHaveLength(skills.length);

    for (const skill of skills) {
      const curriculumSkill = curriculumCatalog.skills.find(entry => entry.skillId === skill.id);
      const lesson = curriculumCatalog.lessons.find(entry => entry.id === lessonIdForSkill(skill.id));
      expect(curriculumSkill?.prerequisiteSkillIds).toEqual(skill.prerequisites);
      expect(curriculumSkill?.topicIds).toContain(topicIdForSkill(skill.id));
      expect(lesson?.learningObjectives).toContain(skill.description);
      expect(lesson?.resourceIds.length).toBeGreaterThanOrEqual(2);
      expect(lesson?.resourceIds.every(id => resourceIds.has(id))).toBe(true);
      expect(getResourcesForCurriculumLesson(lessonIdForSkill(skill.id)).map(resource => resource.id)).toEqual(lesson?.resourceIds);
      expect(getResourcesForCurriculumTopic(topicIdForSkill(skill.id)).length).toBeGreaterThanOrEqual(2);
    }

    for (const career of careers) {
      const path = getCurriculumForCareer(career.id);
      expect(path?.skills.map(skill => skill.skillId)).toEqual(career.skills.map(skill => skill.skillId));
      expect(path?.topics).toHaveLength(career.skills.length);
    }
  });

  it("rejects duplicate IDs", () => {
    const invalid = structuredClone(curriculumCatalog);
    invalid.topics.push(structuredClone(invalid.topics[0]));
    const result = validateCurriculumCatalog(invalid, resourceIds);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.issues.some(issue => issue.code === "duplicate-id" && issue.message.includes(invalid.topics[0].id))).toBe(true);
  });

  it("rejects invalid references and missing relationships", () => {
    const invalid = structuredClone(curriculumCatalog);
    invalid.skills[0].topicIds = ["missing:topic:foundations"];
    invalid.lessons[0].resourceIds = ["missing-resource"];
    invalid.lessons = invalid.lessons.filter(lesson => lesson.subtopicId !== invalid.subtopics[1].id);
    const result = validateCurriculumCatalog(invalid, resourceIds);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some(issue => issue.code === "invalid-reference" && issue.message.includes("missing:topic:foundations"))).toBe(true);
      expect(result.issues.some(issue => issue.code === "invalid-reference" && issue.message.includes("missing-resource"))).toBe(true);
      expect(result.issues.some(issue => issue.code === "missing-relationship" && issue.message.includes(invalid.subtopics[1].id))).toBe(true);
    }
  });

  it("rejects circular skill and topic prerequisites", () => {
    const invalid = structuredClone(curriculumCatalog);
    invalid.skills[0].prerequisiteSkillIds = [invalid.skills[1].skillId];
    invalid.skills[1].prerequisiteSkillIds = [invalid.skills[0].skillId];
    invalid.topics[0].prerequisiteTopicIds = [invalid.topics[1].id];
    invalid.topics[1].prerequisiteTopicIds = [invalid.topics[0].id];
    const result = validateCurriculumCatalog(invalid, resourceIds);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.issues.filter(issue => issue.code === "circular-prerequisite")).toHaveLength(2);
  });
});
