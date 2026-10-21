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
    expect(page).toContain("onboardingCompleted ? preferences.learning");
    expect(page).toContain("LearningGoalEditor");
    expect(page).toContain('primaryCareerId: null');
    expect(page).toContain("completeOnboarding(");
  });
  it("makes the homepage outcome-first with a catalog-backed career demo", () => {
    const page = read("../frontend/src/app/page.tsx");
    const atlas = read("../frontend/src/components/landing-atlas-v4.tsx");
    expect(page).toContain("LandingAtlasV4");
    expect(atlas).toContain('from "@skillmetry/shared/data/catalog"');
    expect(atlas).toContain('from "@skillmetry/shared/data/assessment-catalog"');
    expect(atlas).toContain("careers.map");
    expect(atlas).toContain("No imaginary scores.");
    expect(atlas).toContain("aria-pressed={career.id===careerId}");
    expect(atlas).toContain("Not assessed");
  });
  it("uses only trusted quiz results for measured skill states", () => {
    const home = read("../frontend/src/app/(workspace)/dashboard/page.tsx");
    const streak = read("../frontend/src/components/learning-streak-card.tsx");
    expect(home).toContain("buildDigitalTwinSnapshot");
    expect(home).toContain("useAssessmentProfile");
    expect(home).toContain('typeof score === "number" && Number.isFinite(score)');
    expect(home).toContain('state="unavailable"');
    expect(streak).toContain("NEXT_PUBLIC_LEARNING_STREAK_ENABLED");
    expect(streak).toContain("/api/learning/streak");
    expect(streak).not.toContain("localStorage.setItem");
    expect(streak).not.toContain("localStorage.getItem");
    expect(streak).toContain("Demo quiz results never count");
    expect(streak).toContain("result?.ownerId === ownerId");
  });
  it("connects assessments, roadmap, resources and practice without altering scoring", () => {
    const assessment = read("../frontend/src/app/(workspace)/assessments/page.tsx");
    const roadmap = read("../frontend/src/app/(workspace)/roadmap/page.tsx");
    expect(assessment).toContain('href={"/lab?skill="+encodeURIComponent(safeResult.attempt.skillId)}');
    expect(assessment).toContain('"/resources?skill="');
    expect(assessment).toContain("View my progress");
    expect(roadmap).toContain('href="/lab"');
    expect(roadmap).not.toContain("scores[selectedSkill.id] =");
  });
  it("organizes advanced features without removing route access", () => {
    const shell = read("../frontend/src/components/workspace-shell.tsx");
    for (const category of ["Path & learning", "Planning & advanced tools", "Settings"]) {
      expect(shell).toContain(category);
    }
    for (const route of ["/lab", "/planner", "/missions", "/tutor", "/passport"]) {
      expect(shell).toContain('href: "' + route + '"');
    }
  });

  it("carries a selected landing career into onboarding", () => {
    const gallery = read("../frontend/src/components/landing-atlas-v4.tsx");
    const onboarding = read("../frontend/src/app/onboarding/page.tsx");
    expect(gallery).toContain('"/onboarding?career=" + encodeURIComponent(selectedCareer.id)');
    expect(onboarding).toContain('new URLSearchParams(window.location.search).get("career")');
    expect(onboarding).toContain("careers.find(item => item.id === requestedCareer)");
  });
});
