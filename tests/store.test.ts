import { beforeEach, describe, expect, it } from "vitest";
import { useSkillmetry } from "@/store/use-skillmetry";

describe("local career profile trust boundaries", () => {
  beforeEach(() => {
    useSkillmetry.setState({
      name: "Demo Student",
      careerId: "ml-engineer",
      profileSource: "demo",
      onboardingCompleted: false,
      cloudOwnerId: null
    });
  });

  it("completes onboarding without creating numerical skill data", () => {
    useSkillmetry.getState().completeOnboarding("Jatin", "backend-developer");
    const state = useSkillmetry.getState();
    expect(state.name).toBe("Jatin");
    expect(state.careerId).toBe("backend-developer");
    expect(state.profileSource).toBe("student");
    expect(state.preferences.learning.primaryCareerId).toBe("backend-developer");
    expect(state).not.toHaveProperty("skills");
    expect(state).not.toHaveProperty("attempts");
  });

  it("allows skill and tool goals without forcing a primary career", () => {
    useSkillmetry.getState().completeOnboarding("Jatin", "ml-engineer", {
      hoursPerWeek: 6,
      roadmapView: "graph",
      learning: { primaryCareerId: null, selectedSkillIds: ["python", "react"], selectedToolIds: ["git", "docker"] }
    });
    const state = useSkillmetry.getState();
    expect(state.preferences.learning.primaryCareerId).toBeNull();
    expect(state.preferences.learning.selectedSkillIds).toEqual(["python", "react"]);
    expect(state.preferences.learning.selectedToolIds).toEqual(["git", "docker"]);
  });
});
