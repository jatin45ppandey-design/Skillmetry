import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRequestLimit } from "@skillmetry/backend/lib/security/request-rate-limit.server";

import { getAssessmentRetakePolicy } from "@skillmetry/backend/lib/assessments/policy.server";
import { isDiagnosticDefinition, publicQuestions } from "@skillmetry/backend/lib/assessments/question-bank.server";
import {resolveStartingAssessment} from "@skillmetry/backend/lib/assessments/admin-bank.server";
import { selectDiagnosticQuestionIds } from "@skillmetry/backend/lib/assessments/diagnostic-selection.server";
import { startAssessmentSchema } from "@skillmetry/backend/lib/assessments/schema";
import { hasSupabaseServerCredentials } from "@skillmetry/backend/lib/supabase/config.server";
import { createAdminClient } from "@skillmetry/backend/lib/supabase/admin";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import type { AssessmentId, AssessmentSession } from "@skillmetry/shared/types/domain";

export const runtime = "nodejs";
const SESSION_MINUTES = 30;

function shuffle<T>(items: readonly T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function responseForSession(
  session: { id: string; assessment_id: string; assessment_version: string; question_ids: string[]; expires_at: string },
  assessmentId: AssessmentId,
  definition: Awaited<ReturnType<typeof resolveStartingAssessment>>
) {
  const payload: AssessmentSession = {
    sessionId: session.id,
    assessmentId,
    assessmentVersion: session.assessment_version,
    title: definition.title,
    skillId: definition.skillId,
    expiresAt: session.expires_at,
    questions: publicQuestions(definition, session.question_ids)
  };
  return NextResponse.json({ session: payload }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud assessments are not configured." }, { status: 503 });
  if (auth.status === "unauthorized") return NextResponse.json({ error: "Sign in to start an assessment." }, { status: 401 });
  if (!hasSupabaseServerCredentials()) {
    return NextResponse.json({ error: "Secure grading is not configured. No assessment was started." }, { status: 503 });
  }

  const parsed = startAssessmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Assessment selection is invalid." }, { status: 400 });

  const limit = await checkRequestLimit("assessment:start", auth.userId, 30, 3600);
  if (limit === "blocked") return NextResponse.json({ error: "Assessment start limit reached. Retry later." }, { status: 429, headers: { "Retry-After": "3600" } });
  if (limit === "unavailable") return NextResponse.json({ error: "The secure assessment service is temporarily unavailable." }, { status: 503 });

  const assessmentId = parsed.data.assessmentId as AssessmentId;
  let definition;
  try { definition = await resolveStartingAssessment(assessmentId); }
  catch { return NextResponse.json({error:"Published assessment is unavailable. No session was started."},{status:503}); }
  const admin = createAdminClient();
  const now = new Date();
  const questionIds = isDiagnosticDefinition(definition)
    ? selectDiagnosticQuestionIds(assessmentId, definition.questions)
    : shuffle(definition.questions.map(question => question.id));
  const expiresAt = new Date(now.getTime() + SESSION_MINUTES * 60 * 1000).toISOString();
  let policy;
  try {
    policy = getAssessmentRetakePolicy();
  } catch {
    return NextResponse.json({ error: "Assessment retake policy is misconfigured." }, { status: 503 });
  }

  const { data: sessionId, error: startError } = await admin.rpc("start_or_resume_assessment_session", {
    p_user_id: auth.userId,
    p_assessment_id: assessmentId,
    p_assessment_version: definition.version,
    p_question_ids: questionIds,
    p_expires_at: expiresAt,
    p_max_completions: policy.maxCompletions,
    p_window_minutes: policy.windowMinutes
  });

  if (startError?.message.includes("assessment completion limit reached")) {
    return NextResponse.json({ error: "The configured assessment completion limit has been reached. Try again later." }, { status: 429 });
  }
  if (startError?.code === "PGRST202" || startError?.message.includes("Could not find the function")) {
    return NextResponse.json({ error: "Secure assessment setup is incomplete. No assessment was started." }, { status: 503 });
  }
  if (startError || typeof sessionId !== "string") {
    return NextResponse.json({ error: "A secure assessment session could not be created." }, { status: 503 });
  }

  const { data: session, error } = await admin
    .from("assessment_sessions")
    .select("id,assessment_id,assessment_version,question_ids,expires_at")
    .eq("id", sessionId)
    .eq("user_id", auth.userId)
    .eq("assessment_id", assessmentId)
    .eq("assessment_version", definition.version)
    .single();

  if (error || !session) return NextResponse.json({ error: "The secure assessment session could not be loaded." }, { status: 503 });
  return responseForSession(session, assessmentId, definition);
}
