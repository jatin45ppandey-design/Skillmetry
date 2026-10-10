import { describe, expect, it } from "vitest";
import { cloudProfileInputSchema, safeInternalPath } from "@/lib/profile-schema";

const validProfile = {
  displayName: "Jatin",
  careerId: "backend-developer",
  onboardingCompleted: true,
  preferences: { hoursPerWeek: 8, roadmapView: "graph" },
  claimedSkills: { javascript: 60, node: 40 }
};

describe("cloud profile validation", () => {
  it("accepts only canonical claimed profile data", () => {
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

  it("rejects unknown skill IDs and out-of-range claims", () => {
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, claimedSkills: { "invented-skill": 100 } }).success).toBe(false);
    expect(cloudProfileInputSchema.safeParse({ ...validProfile, claimedSkills: { node: 101 } }).success).toBe(false);
  });

  it("permits only same-origin redirect paths", () => {
    expect(safeInternalPath("/dashboard")).toBe("/dashboard");
    expect(safeInternalPath("https://attacker.example")).toBe("/account");
    expect(safeInternalPath("//attacker.example")).toBe("/account");
    expect(safeInternalPath("/\\attacker.example")).toBe("/account");
  });
});
