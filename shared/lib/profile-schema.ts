import { z } from "zod";
import { careers } from "@skillmetry/shared/data/catalog";
import { canonicalSkillIds, toolIds } from "@skillmetry/shared/data/learning-catalog";
import type { CareerId, LearningPreferences } from "@skillmetry/shared/types/domain";

const careerIds = careers.map(career => career.id) as [CareerId, ...CareerId[]];

export const careerIdSchema = z.enum(careerIds);
const uniqueItems = <T>(items: T[]) => new Set(items).size === items.length;
export const learningPreferencesSchema = z.object({
  primaryCareerId: careerIdSchema.nullable(),
  selectedSkillIds: z.array(z.enum(canonicalSkillIds)).max(canonicalSkillIds.length).refine(uniqueItems, "Skills must not contain duplicates"),
  selectedToolIds: z.array(z.enum(toolIds)).max(toolIds.length).refine(uniqueItems, "Tools must not contain duplicates")
}).strict();

export function defaultLearningPreferences(primaryCareerId: CareerId | null = null): LearningPreferences {
  return { primaryCareerId, selectedSkillIds: [], selectedToolIds: [] };
}

export const onboardingPreferencesSchema = z.object({
  hoursPerWeek: z.number().int().min(1).max(80),
  roadmapView: z.enum(["graph", "list"]),
  learning: learningPreferencesSchema.default(defaultLearningPreferences())
}).strict();

export const cloudProfileInputSchema = z.object({
  displayName: z.string().trim().min(1).max(64),
  careerId: careerIdSchema,
  onboardingCompleted: z.boolean(),
  preferences: onboardingPreferencesSchema
}).strict();

export type OnboardingPreferences = z.infer<typeof onboardingPreferencesSchema>;
export type CloudProfileInput = z.infer<typeof cloudProfileInputSchema>;

/** Restores pre-A1 profiles without changing their established career selection. */
export function normalizeOnboardingPreferences(value: unknown, fallbackCareerId: CareerId): OnboardingPreferences {
  const parsed = onboardingPreferencesSchema.safeParse(value);
  const fallback: OnboardingPreferences = {
    hoursPerWeek: 6,
    roadmapView: "graph",
    learning: defaultLearningPreferences(fallbackCareerId)
  };
  if (!parsed.success) return fallback;
  const hasLearning = typeof value === "object" && value !== null && !Array.isArray(value) && Object.hasOwn(value, "learning");
  return hasLearning
    ? parsed.data
    : { ...parsed.data, learning: defaultLearningPreferences(fallbackCareerId) };
}

export const authCredentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  next: z.string().max(256).optional()
}).strict();

/** User-entered signup confirmation code; never accepts score/identity fields. */
export const emailConfirmationOtpSchema = z.object({
  email: z.string().trim().email().max(254),
  token: z.string().regex(/^\d{6}$/, "Enter the six-digit email confirmation code."),
  next: z.string().max(256).optional()
}).strict();

export const resendSignupConfirmationSchema = z.object({
  email: z.string().trim().email().max(254),
  next: z.string().max(256).optional()
}).strict();

export function safeInternalPath(value: string | undefined, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const base = new URL("https://skillmetry.local");
    const destination = new URL(value, base);
    if (destination.origin !== base.origin) return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
