import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import { builtInCourses } from "@skillmetry/shared/data/built-in-courses";
import {
  curriculumCatalog,
  curriculumTopicById,
  getCurriculumForCareer,
  getCurriculumForSkill,
  getCurriculumLessonByRoute,
  getCurriculumLessonRoute
} from "@skillmetry/shared/data/curriculum";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { getCurriculumCoverageReport } from "@skillmetry/shared/lib/curriculum-coverage";
import { filterLearningResources } from "@skillmetry/shared/lib/resource-intelligence";

const root = fileURLToPath(new URL("..", import.meta.url));

describe("Phase 2 complete learning system", () => {
  it("provides an ordered beginner-to-advanced path for all 18 canonical skills and all four careers", () => {
    expect(skills).toHaveLength(18);
    expect(careers).toHaveLength(4);
    expect(curriculumCatalog.topics).toHaveLength(54);
    expect(curriculumCatalog.subtopics).toHaveLength(54);
    expect(curriculumCatalog.lessons).toHaveLength(54);

    for (const skill of skills) {
      const path = getCurriculumForSkill(skill.id);
      expect(path?.topics).toHaveLength(3);
      expect(path?.topics.map(entry => entry.topic.difficulty)).toEqual(["beginner", "intermediate", "advanced"]);
      expect(path?.topics.flatMap(entry => entry.subtopics)).toHaveLength(3);
      expect(path?.topics.flatMap(entry => entry.subtopics.flatMap(item => item.lessons))).toHaveLength(3);
      expect(path?.topics.every(entry => entry.topic.primaryResourceIds.length >= 1)).toBe(true);
    }

    for (const career of careers) {
      const path = getCurriculumForCareer(career.id);
      expect(path?.skills).toHaveLength(career.skills.length);
      expect(path?.topics).toHaveLength(career.skills.length * 3);
    }
  });

  it("ships 18 navigable built-in courses without presenting staged activity as saved progress", () => {
    expect(builtInCourses).toHaveLength(18);
    for (const course of builtInCourses) {
      expect(course.source).toBe("skillmetry-curriculum");
      expect(course.modules).toHaveLength(3);
      expect(course.modules.flatMap(module => module.lessons)).toHaveLength(3);
      for (const lesson of course.modules.flatMap(module => module.lessons)) {
        expect(lesson.curriculum).toBeDefined();
        expect(getCurriculumLessonRoute(`${course.skillId}:lesson:${lesson.id}`)).toMatch(/^\/learn\//);
      }
    }

    const progressApi = readFileSync(`${root}/frontend/src/app/api/learning/course-progress/route.ts`, "utf8");
    expect(progressApi).toContain('SKILLMETRY_COURSE_PROGRESS_ENABLED==="true"');
    expect(progressApi).toContain("builtInCourseBySlug");
    expect(progressApi).not.toMatch(/skill[_-]?score|assessment_results|quiz_attempts/);
  });

  it("normalizes, deduplicates, filters, and maps the preserved catalog plus reviewed Phase 2 additions", () => {
    expect(learningResources).toHaveLength(83);
    expect(new Set(learningResources.map(resource => resource.id)).size).toBe(83);
    expect(new Set(learningResources.map(resource => resource.url)).size).toBe(83);
    for (const resource of learningResources) {
      expect(resource.url).toMatch(/^https:\/\//);
      expect(resource.availabilityStatus).toMatch(/^(available|unverified|unavailable)$/);
      expect(resource.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(resource.topicIds?.every(topicId => Boolean(curriculumTopicById[topicId]))).toBe(true);
      if (resource.target.kind === "skill") expect(resource.topicIds?.length).toBeGreaterThan(0);
    }

    const hindi = filterLearningResources({ languages: ["Hindi"] });
    expect(hindi).toHaveLength(4);
    expect(hindi.every(resource => resource.type === "video")).toBe(true);
    const pythonTopic = curriculumCatalog.topics.find(topic => topic.skillIds.includes("python"));
    expect(pythonTopic).toBeDefined();
    expect(filterLearningResources({ topicId: pythonTopic?.id }).every(resource => resource.topicIds?.includes(pythonTopic!.id))).toBe(true);
  });

  it("reports coverage honestly and resolves lesson routes with sequence navigation", () => {
    const report = getCurriculumCoverageReport();
    expect(report.totals).toEqual(expect.objectContaining({ careers: 4, skills: 18, topics: 54, subtopics: 54, lessons: 54, resourcesReviewed: 83 }));
    expect(report.totals.resourcesAccepted + report.totals.resourcesUnverified + report.totals.resourcesUnavailable).toBe(83);
    expect(report.skills.every(skill => skill.topics === 3 && skill.subtopics === 3 && skill.lessons === 3)).toBe(true);
    expect(report.topics.every(topic => topic.missing.length === 0)).toBe(true);

    const python = getCurriculumForSkill("python");
    const lessons = python?.topics.flatMap(entry => entry.subtopics.flatMap(item => item.lessons)) ?? [];
    expect(lessons).toHaveLength(3);
    const middle = lessons[1];
    const route = getCurriculumLessonRoute(middle.id);
    expect(route).toBeTruthy();
    const [, , skillId, topicSlug, lessonSlug] = route!.split("/");
    const context = getCurriculumLessonByRoute(skillId, topicSlug, lessonSlug);
    expect(context?.previous?.id).toBe(lessons[0].id);
    expect(context?.next?.id).toBe(lessons[2].id);
    expect(context?.resources.length).toBeGreaterThanOrEqual(2);
  });
});
