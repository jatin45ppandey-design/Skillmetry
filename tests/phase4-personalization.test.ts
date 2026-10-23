import { describe, expect, it } from "vitest";
import { compareCareerCurricula } from "@skillmetry/shared/lib/career-comparison";
import { getCurriculumGuidance, getStudyTaskAction, selectStudentNextAction } from "@skillmetry/shared/lib/student-guidance";
import { buildTutorContext, localTutorGuidance } from "@skillmetry/shared/lib/tutor-guidance";
import type { StudyTask } from "@skillmetry/shared/lib/learning-plan";

const task = (overrides: Partial<StudyTask> = {}): StudyTask => ({
  taskKey: "2026-10-19:javascript:learn", skillId: "javascript", title: "Study JavaScript foundations",
  kind: "learn", status: "todo", estimatedMinutes: 45, plannedDate: "2026-10-19", position: 0, ...overrides
});

describe("Phase 4 personalization keeps activity, curriculum, and evidence distinct", () => {
  it("maps every canonical skill to published curriculum destinations", () => {
    for (const skillId of ["python", "sql", "math", "data-processing", "ml-foundations", "model-evaluation", "rest-api", "docker", "deployment", "html", "css", "javascript", "typescript", "react", "accessibility", "testing", "node", "authentication"]) {
      const guidance = getCurriculumGuidance(skillId);
      expect(guidance?.lessonHref).toMatch(/^\/learn\//);
      expect(guidance?.practiceHref).toMatch(/^\/practice\?topic=/);
    }
  });

  it("uses exact lesson, topic practice, or assessment destinations for planned work", () => {
    expect(getStudyTaskAction(task()).href).toMatch(/^\/learn\//);
    expect(getStudyTaskAction(task({ kind: "practice" })).href).toMatch(/^\/practice\?topic=/);
    expect(getStudyTaskAction(task({ kind: "reassess" })).href).toContain("/assessments?assessment=");
  });

  it("prioritizes due revision, then active work, then a genuinely saved course continuation", () => {
    const revision = selectStudentNextAction({ today: "2026-10-20", hasGoals: true, revisionTasks: [task({ kind: "practice", plannedDate: "2026-10-20" })], tasks: [task({ status: "in_progress" })], resume: { courseTitle: "JavaScript foundations", lessonTitle: "Functions", href: "/courses?course=javascript-foundations" } });
    expect(revision.source).toBe("revision");
    const active = selectStudentNextAction({ today: "2026-10-20", hasGoals: true, tasks: [task({ status: "in_progress" })], resume: { courseTitle: "JavaScript foundations", lessonTitle: "Functions", href: "/courses?course=javascript-foundations" } });
    expect(active.source).toBe("study-task");
    const resume = selectStudentNextAction({ today: "2026-10-20", hasGoals: true, resume: { courseTitle: "JavaScript foundations", lessonTitle: "Functions", href: "/courses?course=javascript-foundations" } });
    expect(resume).toMatchObject({ source: "resume", href: "/courses?course=javascript-foundations" });
  });

  it("compares catalog pathways without inventing a readiness or hiring score", () => {
    const comparison = compareCareerCurricula("frontend-developer", "backend-developer");
    expect(comparison?.shared.length).toBeGreaterThan(0);
    expect(comparison?.primaryOnly.length).toBeGreaterThan(0);
    expect(comparison?.comparedOnly.length).toBeGreaterThan(0);
  });

  it("keeps tutor guidance connected to published lesson and practice links", () => {
    const context = buildTutorContext("javascript");
    expect(context.lesson?.href).toMatch(/^\/learn\//);
    expect(context.practice?.href).toMatch(/^\/practice\?topic=/);
    expect(localTutorGuidance("javascript", "Explain Promise.all").disclaimer).toContain("does not alter assessment scores");
  });
});
