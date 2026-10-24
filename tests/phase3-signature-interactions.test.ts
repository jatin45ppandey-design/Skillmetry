import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("Phase 3 signature learning interactions", () => {
  it("keeps lesson navigation direction-aware and activity confirmation honest", () => {
    const lesson = source("frontend/src/components/curriculum-lesson-reader.tsx");
    expect(lesson).toContain("skillmetry-lesson-direction");
    expect(lesson).toContain('rememberLessonDirection("back")');
    expect(lesson).toContain('rememberLessonDirection("forward")');
    expect(lesson).toContain("p3-confirmed");
    expect(lesson).toContain("Practice this topic");
  });

  it("uses real practice and assessment navigation state without changing grading", () => {
    const practice = source("frontend/src/app/(workspace)/practice/page.tsx");
    const assessments = source("frontend/src/app/(workspace)/assessments/page.tsx");
    expect(practice).toContain("function moveToQuestion");
    expect(practice).toContain("p3-practice-question");
    expect(practice).toContain("p3-feedback-enter");
    expect(assessments).toContain("function moveToQuestion");
    expect(assessments).toContain("p3-assessment-question");
    expect(assessments).toContain('fetch("/api/assessments/submit"');
  });

  it("adds disclosure and confirmation motion with a reduced-motion escape hatch", () => {
    const courses = source("frontend/src/app/(workspace)/courses/page.tsx");
    const missions = source("frontend/src/app/(workspace)/missions/page.tsx");
    const revision = source("frontend/src/app/(workspace)/revision/page.tsx");
    const styles = source("frontend/src/app/phase3-practice.css");
    expect(courses).toContain('data-phase3-motion="course-module"');
    expect(missions).toContain('data-phase3-motion="project-disclosure"');
    expect(revision).toContain("p3-confirmed");
    expect(styles).toContain("p3-enter-forward");
    expect(styles).toContain("prefers-reduced-motion:reduce");
  });
});
