import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { learningStreakSummarySchema, streakTimeZoneSchema } from "@skillmetry/shared/lib/learning-streak";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(request: Request) {
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") {
    return NextResponse.json({ error: auth.status === "unconfigured"
      ? "Cloud streaks are unavailable." : "Sign in to view learning consistency." },
      { status: auth.status === "unconfigured" ? 503 : 401, headers: privateHeaders });
  }
  if (process.env.SKILLMETRY_STREAKS_ENABLED !== "true") {
    return NextResponse.json({ error: "Streak tracking is staged pending a reviewed database migration." },
      { status: 503, headers: privateHeaders });
  }

  const params = new URL(request.url).searchParams;
  if ([...params.keys()].some(key => key !== "timeZone") || params.getAll("timeZone").length > 1) {
    return NextResponse.json({ error: "Unexpected streak query parameter." },
      { status: 400, headers: privateHeaders });
  }
  const parsed = streakTimeZoneSchema.safeParse(params.get("timeZone") ?? "Asia/Kolkata");
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid IANA time zone." },
      { status: 400, headers: privateHeaders });
  }

  // SECURITY INVOKER SQL + auth.uid(); no owner ID, event dates or score supplied by browser.
  // If the migration or RLS is missing, fail closed instead of inventing activity.
  const { data, error } = await auth.supabase.rpc("get_learning_streak", { p_timezone: parsed.data });
  if (error) {
    return NextResponse.json({ error: "Learning streak is temporarily unavailable." },
      { status: 503, headers: privateHeaders });
  }
  const result = learningStreakSummarySchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json({ error: "Learning activity could not be verified." },
      { status: 503, headers: privateHeaders });
  }
  return NextResponse.json({
    ...result.data,
    source: "server-graded-learning-activity",
    note: "A participation streak, not a skill score. Only completed trusted quizzes and graded lab attempts count; one active day at most.",
    missingToday: !result.data.activeToday
  }, { headers: privateHeaders });
}
