"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AssessmentAttempt, CareerId, SkillMap } from "@/types/domain";
import { clamp } from "@/lib/readiness";
import type { OnboardingPreferences } from "@/lib/profile-schema";

export const DEMO_SKILLS: SkillMap = {
  python: 80, sql: 45, math: 60, "data-processing": 65, "ml-foundations": 50,
  "model-evaluation": 40, "rest-api": 25, docker: 10, deployment: 10,
  html: 45, css: 40, javascript: 50, typescript: 20, react: 35,
  accessibility: 10, testing: 15, node: 30, authentication: 10
};

type SkillmetryStore = {
  name: string;
  careerId: CareerId;
  skills: SkillMap;
  baselineSource: "demo" | "self-reported";
  preferences: OnboardingPreferences;
  attempts: AssessmentAttempt[];
  cloudOwnerId: string | null;
  hasHydrated: boolean;
  setName: (name: string) => void;
  setCareer: (careerId: CareerId) => void;
  setSkill: (skillId: string, value: number) => void;
  setPreferences: (preferences: OnboardingPreferences) => void;
  completeOnboarding: (name: string, careerId: CareerId, skills: SkillMap) => void;
  replaceClaimedProfile: (profile: { name: string; careerId: CareerId; skills: SkillMap; preferences: OnboardingPreferences; cloudOwnerId: string }) => void;
  setCloudOwner: (cloudOwnerId: string) => void;
  recordAssessment: (attempt: AssessmentAttempt) => void;
  markHydrated: () => void;
  resetDemo: () => void;
};
export const useSkillmetry = create<SkillmetryStore>()(persist((set) => ({
  name: "Demo Student", careerId: "ml-engineer", skills: { ...DEMO_SKILLS },
  baselineSource: "demo", preferences: { hoursPerWeek: 6, roadmapView: "graph" }, attempts: [], cloudOwnerId: null, hasHydrated: false,
  setName: name => set({ name }),
  setCareer: careerId => set({ careerId }),
  setSkill: (skillId, value) => set(s => ({ skills: { ...s.skills, [skillId]: clamp(value) }, baselineSource: "self-reported" })),
  setPreferences: preferences => set({ preferences }),
  completeOnboarding: (name, careerId, skills) => set({ name, careerId, skills, baselineSource: "self-reported", attempts: [] }),
  replaceClaimedProfile: profile => set({ ...profile, baselineSource: "self-reported", attempts: [] }),
  setCloudOwner: cloudOwnerId => set({ cloudOwnerId }),
  // Assessment attempts are evidence signals only. They never mutate self-reported proficiency.
  recordAssessment: attempt => set(s => ({
    attempts: [...s.attempts, attempt]
  })),
  markHydrated: () => set({ hasHydrated: true }),
  resetDemo: () => set({ name: "Demo Student", careerId: "ml-engineer", skills: { ...DEMO_SKILLS }, baselineSource: "demo", preferences: { hoursPerWeek: 6, roadmapView: "graph" }, attempts: [], cloudOwnerId: null })
}), {
  name: "skillmetry-demo-v1",
  skipHydration: true,
  partialize: s => ({ name: s.name, careerId: s.careerId, skills: s.skills, baselineSource: s.baselineSource, preferences: s.preferences, attempts: s.attempts, cloudOwnerId: s.cloudOwnerId }),
  onRehydrateStorage: () => state => state?.markHydrated()
}));
