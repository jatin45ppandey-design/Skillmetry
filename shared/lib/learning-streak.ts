import { z } from "zod";

/** Streak is a participation metric, NOT assessed proficiency or a grade. */
export const streakTimeZoneSchema = z.string().trim().min(1).max(64).refine(value => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}, "Use a valid IANA time zone.");

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const learningStreakSummarySchema = z.object({
  timeZone: streakTimeZoneSchema,
  asOfDate: isoDay,
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  totalActiveDays: z.number().int().nonnegative(),
  lastActiveDate: isoDay.nullable(),
  activeToday: z.boolean(),
  dueToday: z.boolean(),
  last7Days: z.array(z.object({
    date: isoDay,
    active: z.boolean()
  }).strict()).length(7)
}).strict();
export type LearningStreakSummary = z.infer<typeof learningStreakSummarySchema>;
