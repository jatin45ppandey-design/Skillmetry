import { z } from "zod";
import { careers, skills } from "@/data/catalog";

const careerIds = careers.map(career => career.id) as [string, ...string[]];
const skillIds = skills.map(skill => skill.id) as [string, ...string[]];

export const careerIdSchema = z.enum(careerIds);
export const canonicalSkillIdSchema = z.enum(skillIds);

export const onboardingPreferencesSchema = z.object({
  hoursPerWeek: z.number().int().min(1).max(80),
  roadmapView: z.enum(["graph", "list"])
}).strict();

export const cloudProfileInputSchema = z.object({
  displayName: z.string().trim().min(1).max(64),
  careerId: careerIdSchema,
  onboardingCompleted: z.boolean(),
  preferences: onboardingPreferencesSchema,
  claimedSkills: z.record(canonicalSkillIdSchema, z.number().int().min(0).max(100))
    .refine(value => Object.keys(value).length <= skills.length, "Too many skill entries")
}).strict();

export type OnboardingPreferences = z.infer<typeof onboardingPreferencesSchema>;
export type CloudProfileInput = z.infer<typeof cloudProfileInputSchema>;

export const trustedSkillSignalSchema = z.object({
  skillId: canonicalSkillIdSchema,
  demonstratedProficiency: z.number().int().min(0).max(100).nullable(),
  evidenceConfidence: z.number().min(0).max(1).nullable(),
  verified: z.boolean()
}).strict();
export type TrustedSkillSignal = z.infer<typeof trustedSkillSignalSchema>;

export const authCredentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
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
