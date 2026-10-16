import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud learning records are not configured." }, { status: 503 });
  if (auth.status === "unauthorized") return NextResponse.json({ error: "Sign in to export your own records." }, { status: 401 });

  const profile = await auth.supabase.from("profiles")
    .select("display_name,target_career_id,hours_per_week,onboarding_completed,onboarding_preferences,updated_at")
    .eq("id", auth.userId).maybeSingle();
  if (profile.error) return NextResponse.json({ error: "Your profile export is temporarily unavailable." }, { status: 503 });

  // Paginate instead of silently truncating assessment history to the normal UI limit.
  const attemptRows: Record<string, unknown>[] = [];
  const batchSize = 500;
  for (let offset = 0; ; offset += batchSize) {
    const result = await auth.supabase.from("assessment_attempts")
      .select("id,assessment_id,assessment_version,skill_id,score,passed,pass_threshold,correct_count,total_questions,completed_at")
      .eq("user_id", auth.userId).eq("grading_method", "server_quiz")
      .order("completed_at", { ascending: false }).order("id", { ascending: false })
      .range(offset, offset + batchSize - 1);
    if (result.error) return NextResponse.json({ error: "Assessment history could not be exported." }, { status: 503 });
    attemptRows.push(...(result.data ?? []));
    if ((result.data?.length ?? 0) < batchSize) break;
  }

  // The new mission table may not exist until its approved migration is applied.
  // Never silently claim that all mission records were exported when unavailable.
  const projectResult = await auth.supabase.from("mission_submissions")
    .select("mission_id,status,checked_deliverables,reflection,evidence_url,updated_at,submitted_at")
    .eq("user_id", auth.userId).order("updated_at", { ascending: false });

  const output = {
    format: "skillmetry-private-learning-record-v1",
    exportedAt: new Date().toISOString(),
    scope: "Student learning profile and assessment/project records only. Not a complete Auth or platform data export.",
    profile: profile.data,
    trustedAssessmentAttempts: attemptRows,
    selfReportedProjectEvidence: projectResult.error ? null : projectResult.data,
    projectEvidenceAvailable: !projectResult.error,
    trustNotice: "Only completed server-graded quizzes contribute to numeric skill scores. Project evidence is self-reported and unverified."
  };

  return NextResponse.json(output, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": 'attachment; filename="skillmetry-learning-record.json"',
      "X-Content-Type-Options": "nosniff"
    }
  });
}
