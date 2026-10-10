"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AssessmentAttempt, CareerId, SkillMap } from "@/types/domain";
import { clamp } from "@/lib/readiness";

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
  attempts: AssessmentAttempt[];
  setName: (name: string) => void;
  setCareer: (careerId: CareerId) => void;
  setSkill: (skillId: string, value: number) => void;
  completeOnboarding: (name: string, careerId: CareerId, skills: SkillMap) => void;
  recordAssessment: (attempt: AssessmentAttempt) => void;
  resetDemo: () => void;
};
export const useSkillmetry = create<SkillmetryStore>()(persist((set) => ({
  name: "Demo Student", careerId: "ml-engineer", skills: { ...DEMO_SKILLS },
  baselineSource: "demo", attempts: [],
  setName: name => set({ name }),
  setCareer: careerId => set({ careerId }),
  setSkill: (skillId, value) => set(s => ({ skills: { ...s.skills, [skillId]: clamp(value) }, baselineSource: "self-reported" })),
  completeOnboarding: (name, careerId, skills) => set({ name, careerId, skills, baselineSource: "self-reported", attempts: [] }),
  // Assessment attempts are evidence signals only. They never mutate self-reported proficiency.
  recordAssessment: attempt => set(s => ({
    attempts: [...s.attempts, attempt]
  })),
  resetDemo: () => set({ name: "Demo Student", careerId: "ml-engineer", skills: { ...DEMO_SKILLS }, baselineSource: "demo", attempts: [] })
}), { name: "skillmetry-demo-v1", partialize: s => ({ name: s.name, careerId: s.careerId, skills: s.skills, baselineSource: s.baselineSource, attempts: s.attempts }) }));
