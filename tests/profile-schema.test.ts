import { describe, expect, it } from "vitest";
import { cloudProfileInputSchema, normalizeOnboardingPreferences, safeInternalPath } from "@skillmetry/shared/lib/profile-schema";

const validProfile = {
  displayName: "Jatin",
  careerId: "backend-developer",
  onboardingCompleted: true,
  preferences: { hoursPerWeek: 8, roadmapView: "graph", learning: { primaryCareerId: null, selectedSkillIds: ["react"], selectedToolIds: ["git", "github"] } }
};

describe("cloud profile validation", () => {
  it("accepts only name, career, onboarding state, and preferences", () => {
    expect(cloudProfileInputSchema.safeParse(validProfile).success).toBe(true);
  });

  it.each([
    { userId: "22222222-2222-4222-8222-222222222222" },
    { demonstratedProficiency: 100 },
    { verifiedStatus: true },
    { assessmentScore: 100 },
    { reviewStatus: "accepted" }
  ])("rejects a client-supplied trusted or identity field: %o", forbidden => {
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, ...forbidden }).success).toBe(false);
  });

  it("rejects legacy or fabricated skill ratings", () => {
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, claimedSkills: { javascript: 60 } }).success).toBe(false);
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, skills: { node: 100 } }).success).toBe(false);
  });

  it("accepts combined learning preferences without accepting unknown catalog values", () => {
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, preferences: { ...validProfile.preferences, learning: { primaryCareerId: "full-stack-developer", selectedSkillIds: ["react", "node"], selectedToolIds: ["docker", "postman"] } } }).success).toBe(true);
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, preferences: { ...validProfile.preferences, learning: { primaryCareerId: null, selectedSkillIds: ["invented-skill"], selectedToolIds: [] } } }).success).toBe(false);
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, preferences: { ...validProfile.preferences, learning: { primaryCareerId: null, selectedSkillIds: ["react", "react"], selectedToolIds: [] } } }).success).toBe(false);
  });

  it("restores a pre-A1 profile with its existing career as the compatible learning goal", () => {
    expect(normalizeOnboardingPreferences({ hoursPerWeek: 8, roadmapView: "list" }, "backend-developer")).toEqual({
      hoursPerWeek: 8,
      roadmapView: "list",
      learning: { primaryCareerId: "backend-developer", selectedSkillIds: [], selectedToolIds: [] }
    });
  });

  it("permits only same-origin redirect paths", () => {
    expect(safeInternalPath("/dashboard")).toBe("/dashboard");
    expect(safeInternalPath("https://attacker.example")).toBe("/account");
    expect(safeInternalPath("//attacker.example")).toBe("/account");
    expect(safeInternalPath("/\\attacker.example")).toBe("/account");
  });
});
