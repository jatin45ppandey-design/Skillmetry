"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CareerId } from "@skillmetry/shared/types/domain";
import { defaultLearningPreferences, type OnboardingPreferences } from "@skillmetry/shared/lib/profile-schema";

function defaultPreferences(careerId: CareerId): OnboardingPreferences {
  return { hoursPerWeek: 6, roadmapView: "graph", learning: defaultLearningPreferences(careerId) };
}

type SkillmetryStore = {
  name: string;
  careerId: CareerId;
  profileSource: "demo" | "student";
  onboardingCompleted: boolean;
  preferences: OnboardingPreferences;
  cloudOwnerId: string | null;
  hasHydrated: boolean;
  setName: (name: string) => void;
  setCareer: (careerId: CareerId) => void;
  setPreferences: (preferences: OnboardingPreferences) => void;
  completeOnboarding: (name: string, careerId: CareerId, preferences?: OnboardingPreferences) => void;
  replaceCloudProfile: (profile: { name: string; careerId: CareerId; preferences: OnboardingPreferences; cloudOwnerId: string }) => void;
  setCloudOwner: (cloudOwnerId: string) => void;
  markHydrated: () => void;
  resetDemo: () => void;
};
export const useSkillmetry = create<SkillmetryStore>()(persist((set) => ({
  name: "Demo Student", careerId: "ml-engineer", profileSource: "demo", onboardingCompleted: false,
  preferences: defaultPreferences("ml-engineer"), cloudOwnerId: null, hasHydrated: false,
  setName: name => set({ name }),
  setCareer: careerId => set(state => ({
    careerId,
    preferences: { ...state.preferences, learning: { ...state.preferences.learning, primaryCareerId: careerId } }
  })),
  setPreferences: preferences => set(state => ({
    preferences,
    careerId: preferences.learning.primaryCareerId ?? state.careerId
  })),
  completeOnboarding: (name, careerId, preferences) => set(state => ({
    name,
    careerId: preferences?.learning.primaryCareerId ?? careerId,
    profileSource: "student",
    onboardingCompleted: true,
    preferences: preferences ?? { ...state.preferences, learning: { ...state.preferences.learning, primaryCareerId: careerId } }
  })),
  replaceCloudProfile: profile => set({ ...profile, profileSource: "student", onboardingCompleted: true }),
  setCloudOwner: cloudOwnerId => set({ cloudOwnerId }),
  markHydrated: () => set({ hasHydrated: true }),
  resetDemo: () => set({ name: "Demo Student", careerId: "ml-engineer", profileSource: "demo", onboardingCompleted: false, preferences: defaultPreferences("ml-engineer"), cloudOwnerId: null })
}), {
  name: "skillmetry-demo-v2",
  version: 2,
  migrate: persistedState => {
    const persisted = persistedState as Partial<SkillmetryStore>;
    const careerId = persisted.careerId ?? "ml-engineer";
    const savedPreferences = persisted.preferences as Partial<OnboardingPreferences> | undefined;
    return {
      ...persisted,
      preferences: {
        ...defaultPreferences(careerId),
        ...savedPreferences,
        learning: {
          ...defaultLearningPreferences(careerId),
          ...savedPreferences?.learning
        }
      }
    } as SkillmetryStore;
  },
  skipHydration: true,
  partialize: s => ({ name: s.name, careerId: s.careerId, profileSource: s.profileSource, onboardingCompleted: s.onboardingCompleted, preferences: s.preferences, cloudOwnerId: s.cloudOwnerId }),
  onRehydrateStorage: () => state => state?.markHydrated()
}));
