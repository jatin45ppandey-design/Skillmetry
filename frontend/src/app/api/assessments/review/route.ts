import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { getAssessmentDefinition, orderedGradedQuestions } from "@skillmetry/backend/lib/assessments/question-bank.server";
import { buildTopicDiagnosis, getTopicResources, recommendedWeakTopics, type DiagnosticReview } from "@skillmetry/shared/lib/diagnostic-intelligence";
import { DIAGNOSTIC_VERSION } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";

export async function GET(request: NextRequest) {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud assessments are unavailable." }, { status: 503 });
  if (auth.status === "unauthorized") return NextResponse.json({ error: "Sign in to view your answers." }, { status: 401 });
  const parsed = z.string().uuid().safeParse(request.nextUrl.searchParams.get("attemptId"));
  if (!parsed.success) return NextResponse.json({ error: "A valid assessment attempt is required." }, { status: 400 });

  const { data: attempt, error: attemptError } = await auth.supabase.from("assessment_attempts")
    .select("id,user_id,assessment_id,assessment_version,grading_method")
    .eq("id", parsed.data).eq("user_id", auth.userId).eq("grading_method", "server_quiz").maybeSingle();
  if (attemptError) return NextResponse.json({ error: "Assessment could not be loaded." }, { status: 503 });
  if (!attempt) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  if (attempt.assessment_version !== DIAGNOSTIC_VERSION) {
    return NextResponse.json({ available: false, reason: "Older quiz versions do not contain question-level evidence." },
      { headers: { "Cache-Control": "private, no-store" } });
  }
  const { data, error } = await auth.supabase.from("assessment_question_reviews")
    .select("question_id,topic_id,difficulty,selected_index,correct_index,explanation,ordinal")
    .eq("attempt_id", attempt.id).eq("user_id", auth.userId).order("ordinal", { ascending: true });
  if (error) return NextResponse.json({ error: "Diagnostic review storage is unavailable." }, { status: 503 });
  if (!data?.length) return NextResponse.json({ available: false, reason: "No question-level evidence is stored for this attempt." },
    { headers: { "Cache-Control": "private, no-store" } });

  const assessmentId = attempt.assessment_id as AssessmentId;
  const definition = getAssessmentDefinition(assessmentId, attempt.assessment_version);
  const byId = new Map(orderedGradedQuestions(definition, data.map(r=>r.question_id)).map(q=>[q.id,q]));
  const reviews: DiagnosticReview[] = data.map(row=>({
    questionId:row.question_id,topicId:row.topic_id,
    difficulty:row.difficulty as DiagnosticReview["difficulty"],
    selectedIndex:row.selected_index,correctIndex:row.correct_index,
    explanation:row.explanation,ordinal:row.ordinal
  }));
  const topics = buildTopicDiagnosis(assessmentId,reviews);
  return NextResponse.json({
    available:true,attemptId:attempt.id,
    topics,
    priorityTopics:recommendedWeakTopics(topics).map(topic=>({
      ...topic,resources:getTopicResources(assessmentId,topic.id),
      practiceHref:`/practice?assessment=${encodeURIComponent(assessmentId)}&topic=${encodeURIComponent(topic.id)}`
    })),
    review:reviews.map(item=>({
      ...item,prompt:byId.get(item.questionId)?.prompt ?? "",
      choices:byId.get(item.questionId)?.choices ?? []
    }))
  }, { headers: { "Cache-Control": "private, no-store" } });
}
