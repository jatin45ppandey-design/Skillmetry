import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { buildTopicDiagnosis, recommendedWeakTopics, getTopicResources, type DiagnosticReview } from "@skillmetry/shared/lib/diagnostic-intelligence";
import { DIAGNOSTIC_VERSION } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";

/** Latest per-skill diagnostic evidence only; no cross-user or demo data. */
export async function GET() {
  if (process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED !== "true") {
    return NextResponse.json({ insights: [] }, { headers: { "Cache-Control": "private, no-store" } });
  }
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") return NextResponse.json({ error: "Sign in to view diagnostics." }, { status: auth.status === "unconfigured" ? 503 : 401 });

  const { data: attempts, error } = await auth.supabase.from("assessment_attempts")
    .select("id,assessment_id,skill_id,assessment_version,score,completed_at")
    .eq("user_id", auth.userId).eq("grading_method", "server_quiz")
    .order("completed_at", { ascending: false }).order("id", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "Assessment history is unavailable." }, { status: 503 });
  const latest = new Map<string, (typeof attempts extends (infer T)[] | null ? T : never)>();
  for (const attempt of attempts ?? []) if (!latest.has(attempt.skill_id)) latest.set(attempt.skill_id, attempt);
  const targets = [...latest.values()].filter(row=>row.assessment_version===DIAGNOSTIC_VERSION);
  if (!targets.length) return NextResponse.json({ insights: [] }, { headers: { "Cache-Control": "private, no-store" } });

  const { data: reviews, error: reviewError } = await auth.supabase.from("assessment_question_reviews")
    .select("attempt_id,question_id,topic_id,difficulty,selected_index,correct_index,explanation,ordinal")
    .eq("user_id", auth.userId).in("attempt_id", targets.map(row=>row.id));
  if (reviewError) return NextResponse.json({ error: "Topic evidence is temporarily unavailable." }, { status: 503 });
  const insights = targets.map(attempt=>{
    const evidence:DiagnosticReview[]=(reviews??[]).filter(r=>r.attempt_id===attempt.id).map(r=>({
      questionId:r.question_id,topicId:r.topic_id,difficulty:r.difficulty as DiagnosticReview["difficulty"],
      selectedIndex:r.selected_index,correctIndex:r.correct_index,explanation:r.explanation,ordinal:r.ordinal
    }));
    const topics=buildTopicDiagnosis(attempt.assessment_id as AssessmentId,evidence);
    return { attemptId:attempt.id,assessmentId:attempt.assessment_id,skillId:attempt.skill_id,score:Number(attempt.score),
      topics,weakTopics:recommendedWeakTopics(topics).map(t=>({...t,resources:getTopicResources(attempt.assessment_id as AssessmentId,t.id),
        practiceHref:`/practice?assessment=${encodeURIComponent(attempt.assessment_id)}&topic=${encodeURIComponent(t.id)}`})) };
  });
  return NextResponse.json({ insights }, { headers: { "Cache-Control": "private, no-store" } });
}
