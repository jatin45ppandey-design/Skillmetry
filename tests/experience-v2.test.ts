import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("Connected learning experience source contracts", () => {
  it("keeps first-time onboarding minimal and advanced skill choices optional", () => {
    const page = read("../frontend/src/app/onboarding/page.tsx");
    expect(page).toContain("What brings you here?");
    expect(page).toContain('Intent = "career" | "explore" | "skill"');
    expect(page).toContain("setAdvanced(!advanced)");
    expect(page).toContain("LearningGoalEditor");
    expect(page).toContain('primaryCareerId: null');
    expect(page).toContain("completeOnboarding(");
  });
  it("makes the homepage outcome-first with a catalog-backed career demo", () => {
    const page = read("../frontend/src/app/page.tsx");
    const gallery = read("../frontend/src/components/career-chapter-gallery.tsx");
    expect(page).toContain("Not sure ");
    expect(page).toContain("what to learn");
    expect(page).toContain("EXAMPLE ONLY");
    expect(gallery).toContain("careers.map");
  });
  it("uses only trusted quiz results for measured skill states", () => {
    const home = read("../frontend/src/app/(workspace)/dashboard/page.tsx");
    const streak = read("../frontend/src/components/learning-streak-card.tsx");
    expect(home).toContain("buildDigitalTwinSnapshot");
    expect(home).toContain("useAssessmentProfile");
    expect(home).toContain("Object.hasOwn(scores,item.skillId)");
    expect(streak).toContain("NEXT_PUBLIC_LEARNING_STREAK_ENABLED");
    expect(streak).toContain("/api/learning/streak");
    expect(streak).not.toContain("localStorage.setItem");
    expect(streak).not.toContain("localStorage.getItem");
    expect(streak).toContain("Demo quiz results never count");
  });
  it("connects assessments, roadmap, resources and practice without altering scoring", () => {
    const assessment = read("../frontend/src/app/(workspace)/assessments/page.tsx");
    const roadmap = read("../frontend/src/app/(workspace)/roadmap/page.tsx");
    expect(assessment).toContain('href="/lab"');
    expect(assessment).toContain('"/resources?skill="');
    expect(assessment).toContain("View my progress");
    expect(roadmap).toContain('href="/lab"');
    expect(roadmap).not.toContain("scores[selectedSkill.id] =");
  });
  it("organizes advanced features without removing route access", () => {
    const shell = read("../frontend/src/components/workspace-shell.tsx");
    for (const category of ["LEARN & PRACTICE", "BUILD & EXPLORE", "MY SPACE"]) {
      expect(shell).toContain(category);
    }
    for (const route of ["/lab", "/planner", "/missions", "/tutor", "/passport"]) {
      expect(shell).toContain('href: "' + route + '"');
    }
  });
});
