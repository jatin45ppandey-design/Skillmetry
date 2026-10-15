import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import type { AssessmentAttempt, AssessmentId } from "@skillmetry/shared/types/domain";

export async function GET() {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud assessments are not configured." }, { status: 503 });
  if (auth.status === "unauthorized") return NextResponse.json({ error: "Sign in to view assessment history." }, { status: 401 });

  const { data, error } = await auth.supabase
    .from("assessment_attempts")
    .select("id,assessment_id,assessment_version,skill_id,score,passed,pass_threshold,correct_count,total_questions,completed_at")
    .eq("user_id", auth.userId)
    .eq("grading_method", "server_quiz")
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: "Assessment history is temporarily unavailable." }, { status: 503 });
  const attempts: AssessmentAttempt[] = (data ?? []).map(row => ({
    id: row.id,
    assessmentId: row.assessment_id as AssessmentId,
    assessmentVersion: row.assessment_version,
    skillId: row.skill_id,
    score: Number(row.score),
    passed: row.passed,
    passThreshold: Number(row.pass_threshold),
    correctCount: row.correct_count,
    totalQuestions: row.total_questions,
    completedAt: row.completed_at
  }));
  return NextResponse.json({ attempts }, { headers: { "Cache-Control": "private, no-store" } });
}
