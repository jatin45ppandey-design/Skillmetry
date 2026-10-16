import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { learningStreakSummarySchema, streakTimeZoneSchema } from "@skillmetry/shared/lib/learning-streak";
const read = (relative: string) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

describe("backend learning streak boundary", () => {
  it("validates IANA time zones without trusting an arbitrary offset", () => {
    expect(streakTimeZoneSchema.safeParse("Asia/Kolkata").success).toBe(true);
    expect(streakTimeZoneSchema.safeParse("America/New_York").success).toBe(true);
    expect(streakTimeZoneSchema.safeParse("Mars/Phobos").success).toBe(false);
    expect(streakTimeZoneSchema.safeParse("A".repeat(65)).success).toBe(false);
  });
  it("enforces a bounded, unscored daily summary response", () => {
    const days = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-10-${String(10 + i)}`, active: i === 6
    }));
    const summary = { timeZone: "Asia/Kolkata", asOfDate: "2026-10-16",
      currentStreak: 1, longestStreak: 5, totalActiveDays: 13,
      lastActiveDate: "2026-10-16", activeToday: true, dueToday: false,
      last7Days: days };
    expect(learningStreakSummarySchema.safeParse(summary).success).toBe(true);
    expect(learningStreakSummarySchema.safeParse({ ...summary, score: 90 }).success).toBe(false);
    expect(learningStreakSummarySchema.safeParse({ ...summary, currentStreak: -1 }).success).toBe(false);
  });
  it("derives activity from trusted, immutable server events", () => {
    const sql = read("../database/supabase/migrations/202610160006_learning_streak.sql");
    expect(sql).toContain("security invoker");
    expect(sql).not.toContain("pg_catalog.coalesce");
    expect(sql).toContain("a.grading_method = 'server_quiz'");
    expect(sql).toContain("public.practice_lab_attempts");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("revoke execute");
    expect(sql).not.toContain("public.learning_plan_tasks");
    expect(sql).not.toContain("public.mission_work");
    expect(sql).toContain("where end_day = v_today or end_day = v_today - 1");
  });
  it("never accepts client-forged streak counts or owners", () => {
    const route = read("../frontend/src/app/api/learning/streak/route.ts");
    expect(route).toContain("authenticatedRequest()");
    expect(route).toContain("SKILLMETRY_STREAKS_ENABLED");
    expect(route).toContain('.rpc("get_learning_streak", { p_timezone: parsed.data })');
    expect(route).toContain("private, no-store");
    expect(route).not.toContain("request.json()");
    expect(route).not.toContain("createAdminClient");
  });
});
