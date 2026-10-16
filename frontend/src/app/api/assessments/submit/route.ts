import { NextResponse } from "next/server";
import { gradeAnswers } from "@skillmetry/backend/lib/assessments/grading.server";
import { getAssessmentDefinition, orderedGradedQuestions } from "@skillmetry/backend/lib/assessments/question-bank.server";
import { submitAssessmentSchema } from "@skillmetry/backend/lib/assessments/schema";
import { createAdminClient } from "@skillmetry/backend/lib/supabase/admin";
import { hasSupabaseServerCredentials } from "@skillmetry/backend/lib/supabase/config.server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import type { AssessmentAttempt, AssessmentId } from "@skillmetry/shared/types/domain";

export const runtime = "nodejs";

function serializeAttempt(row: Record<string, unknown>): AssessmentAttempt {
  return {
    id: String(row.id),
    assessmentId: row.assessment_id as AssessmentId,
    assessmentVersion: String(row.assessment_version),
    skillId: String(row.skill_id),
    score: Number(row.score),
    passed: Boolean(row.passed),
    passThreshold: Number(row.pass_threshold),
    correctCount: Number(row.correct_count),
    totalQuestions: Number(row.total_questions),
    completedAt: String(row.completed_at)
  };
}

const attemptSelection = "id,assessment_id,assessment_version,skill_id,score,passed,pass_threshold,correct_count,total_questions,completed_at";

export async function POST(request: Request) {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud assessments are not configured." }, { status: 503 });
  if (auth.status === "unauthorized") return NextResponse.json({ error: "Sign in before submitting an assessment." }, { status: 401 });
  if (!hasSupabaseServerCredentials()) {
    return NextResponse.json({ error: "Secure grading is not configured. No result was saved." }, { status: 503 });
  }

  const parsed = submitAssessmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Assessment answers are invalid." }, { status: 400 });

  const admin = createAdminClient();
  const { data: session, error: sessionError } = await admin
    .from("assessment_sessions")
    .select("id,user_id,assessment_id,assessment_version,question_ids,status,expires_at")
    .eq("id", parsed.data.sessionId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (sessionError) return NextResponse.json({ error: "Assessment session could not be verified." }, { status: 503 });
  if (!session) return NextResponse.json({ error: "Assessment session was not found." }, { status: 404 });
  if (session.status === "completed") {
    const { data: completedAttempt, error: completedAttemptError } = await admin
      .from("assessment_attempts")
      .select(attemptSelection)
      .eq("session_id", session.id)
      .eq("user_id", auth.userId)
      .eq("grading_method", "server_quiz")
      .maybeSingle();

    if (completedAttemptError || !completedAttempt) {
      return NextResponse.json({ error: "The completed assessment result could not be loaded." }, { status: 503 });
    }
    return NextResponse.json(
      { attempt: serializeAttempt(completedAttempt), replayed: true },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }
  if (session.status !== "active") return NextResponse.json({ error: "This assessment session is no longer active." }, { status: 409 });
  if (Date.parse(session.expires_at) <= Date.now()) return NextResponse.json({ error: "This assessment session expired. Start a new attempt." }, { status: 410 });

  const assessmentId = session.assessment_id as AssessmentId;
  const definition = getAssessmentDefinition(assessmentId, session.assessment_version);
  if (definition.version !== session.assessment_version) {
    return NextResponse.json({ error: "This assessment version is no longer available. Start a new attempt." }, { status: 409 });
  }

  let result;
  try {
    result = gradeAnswers(orderedGradedQuestions(definition, session.question_ids), parsed.data.answers);
  } catch {
    return NextResponse.json({ error: "Every question must be answered exactly once." }, { status: 400 });
  }

  const { data: attemptId, error: completionError } = await admin.rpc("complete_assessment_session", {
    p_session_id: session.id,
    p_user_id: auth.userId,
    p_score: result.score,
    p_correct_count: result.correctCount,
    p_total_questions: result.totalQuestions,
    p_passed: result.passed
  });

  if (completionError || typeof attemptId !== "string") {
    const { data: completedAttempt, error: completedAttemptError } = await admin
      .from("assessment_attempts")
      .select(attemptSelection)
      .eq("session_id", session.id)
      .eq("user_id", auth.userId)
      .eq("grading_method", "server_quiz")
      .maybeSingle();

    if (completedAttemptError) {
      return NextResponse.json({ error: "The assessment completion state could not be verified." }, { status: 503 });
    }
    if (completedAttempt) {
      return NextResponse.json(
        { attempt: serializeAttempt(completedAttempt), replayed: true },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }
    return NextResponse.json({ error: "This assessment could not be completed." }, { status: 409 });
  }

  const { data: attempt, error: attemptError } = await admin
    .from("assessment_attempts")
    .select(attemptSelection)
    .eq("id", attemptId)
    .eq("user_id", auth.userId)
    .single();

  if (attemptError || !attempt) return NextResponse.json({ error: "The result was saved but could not be loaded." }, { status: 503 });
  return NextResponse.json({ attempt: serializeAttempt(attempt) }, { headers: { "Cache-Control": "private, no-store" } });
}
