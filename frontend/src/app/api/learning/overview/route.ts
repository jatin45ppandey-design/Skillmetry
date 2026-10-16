import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { buildRecommendations } from "@skillmetry/shared/lib/recommendations";
import { resolveNextLearningAction } from "@skillmetry/shared/lib/next-learning-action";
import { careerIdSchema, normalizeOnboardingPreferences } from "@skillmetry/shared/lib/profile-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

/** Read-only personalized starting point for a future, simpler dashboard. */
export async function GET() {
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") return NextResponse.json({
    error: auth.status === "unconfigured" ?
      "Learning history is not configured." : "Sign in for personalized next steps."
  }, { status: auth.status === "unconfigured" ? 503 : 401, headers });

  const { data: profile, error: profileError } = await auth.supabase.from("profiles")
    .select("target_career_id,onboarding_preferences,onboarding_completed,hours_per_week")
    .eq("id", auth.userId).maybeSingle();
  if (profileError) return NextResponse.json({ error: "Your learning profile is unavailable." },
    { status: 503, headers });
  if (!profile || !profile.onboarding_completed) return NextResponse.json({
    state: "onboarding-required",
    nextAction: { kind: "choose-goals", title: "Let's find your direction",
      label: "Complete onboarding", href: "/onboarding",
      explanation: "Set learning goals to receive a grounded next step." }
  }, { headers });

  const career = careerIdSchema.safeParse(profile.target_career_id);
  if (!career.success) return NextResponse.json({ error: "Saved career direction is invalid." },
    { status: 503, headers });
  const preferences = normalizeOnboardingPreferences({
    ...((typeof profile.onboarding_preferences === "object" &&
      profile.onboarding_preferences !== null && !Array.isArray(profile.onboarding_preferences))
        ? profile.onboarding_preferences : {}),
    hoursPerWeek: profile.hours_per_week
  }, career.data);

  const { data: attempts, error: attemptsError } = await auth.supabase.from("assessment_attempts")
    .select("id,skill_id,score,completed_at")
    .eq("user_id", auth.userId).eq("grading_method", "server_quiz")
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false }).limit(1000);
  if (attemptsError) return NextResponse.json({ error: "Trusted assessment evidence is temporarily unavailable." },
    { status: 503, headers });

  const scores: Record<string, number> = {};
  for (const attempt of attempts ?? []) if (!Object.hasOwn(scores, attempt.skill_id))
    scores[attempt.skill_id] = Number(attempt.score);
  const recommendation = buildRecommendations({
    learning: preferences.learning, trustedScores: scores,
    trustedAttempts: (attempts ?? []).map(attempt => ({
      id: attempt.id, skillId: attempt.skill_id, completedAt: attempt.completed_at
    }))
  });
  return NextResponse.json({
    state: "ready",
    measuredSkillCount: Object.keys(scores).length,
    trustedEvidenceOnly: true,
    nextAction: resolveNextLearningAction(recommendation),
    upcoming: [recommendation.next, recommendation.later].filter(Boolean).map(item => ({
      action: item?.action, skillId: item?.skillId ?? null, toolId: item?.toolId ?? null,
      explanation: item?.explanation
    })),
    limitations: "Quizzes measure foundational evidence only. Learning tasks, missions and activity never manufacture skill scores."
  }, { headers });
}
