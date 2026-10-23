import {NextResponse} from "next/server";
import {z} from "zod";
import {authenticatedRequest} from "@skillmetry/backend/lib/supabase/request-auth";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {assessmentCatalog} from "@skillmetry/shared/data/assessment-catalog";
import {DIAGNOSTIC_VERSION} from "@skillmetry/shared/data/diagnostic-taxonomy";
import {learningResources} from "@skillmetry/shared/data/learning-resources";
import {buildTopicDiagnosis,type DiagnosticReview} from "@skillmetry/shared/lib/diagnostic-intelligence";
import {buildSpacedRevisionDates,curriculumTopicForDiagnostic,dateKeyInTimeZone,revisionTopicContext,type RevisionEvidence} from "@skillmetry/shared/lib/revision";
import {weekStartUtc} from "@skillmetry/shared/lib/learning-plan";
import type {AssessmentId} from "@skillmetry/shared/types/domain";

export const runtime="nodejs";
const enabled=()=>process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true";
const diagnosticsEnabled=()=>process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED==="true";
const saveSchema=z.object({
  topicId:z.string().regex(/^[a-z][a-z0-9-]*:topic:[a-z][a-z0-9-]*$/),
  evidence:z.enum(["needs-practice","developing","insufficient-evidence","practice-selected"]),
  assessmentId:z.string().min(3).max(64).optional()
}).strict();

function taskFromRow(row:Record<string,unknown>){return {taskKey:row.task_key,skillId:row.skill_id,title:row.title,
  kind:row.kind,status:row.status,estimatedMinutes:row.estimated_minutes,plannedDate:row.planned_date,position:row.position};}

async function savedTasks(auth:Extract<Awaited<ReturnType<typeof authenticatedRequest>>,{status:"authenticated"}>){
  const today=dateKeyInTimeZone(new Date());
  const horizon=new Date(`${today}T00:00:00Z`);horizon.setUTCDate(horizon.getUTCDate()+30);
  const {data,error}=await auth.supabase.from("learning_plan_tasks")
    .select("task_key,skill_id,title,kind,status,estimated_minutes,planned_date,position")
    .eq("user_id",auth.userId).like("task_key","%:revision:%")
    .gte("planned_date",today).lte("planned_date",horizon.toISOString().slice(0,10))
    .order("planned_date",{ascending:true}).order("position",{ascending:true}).limit(30);
  if(error)throw new Error("Saved revision tasks are unavailable.");
  return (data??[]).map(taskFromRow);
}

async function diagnosticRecommendations(auth:Extract<Awaited<ReturnType<typeof authenticatedRequest>>,{status:"authenticated"}>){
  if(!diagnosticsEnabled())return [];
  const {data:attempts,error}=await auth.supabase.from("assessment_attempts")
    .select("id,assessment_id,skill_id,assessment_version,completed_at")
    .eq("user_id",auth.userId).eq("grading_method","server_quiz").eq("assessment_version",DIAGNOSTIC_VERSION)
    .order("completed_at",{ascending:false}).order("id",{ascending:false}).limit(100);
  if(error)throw new Error("Diagnostic attempts are unavailable.");
  const latest=new Map<string,NonNullable<typeof attempts>[number]>();
  for(const attempt of attempts??[])if(!latest.has(attempt.skill_id))latest.set(attempt.skill_id,attempt);
  const selected=[...latest.values()];
  if(!selected.length)return [];
  const {data:reviews,error:reviewError}=await auth.supabase.from("assessment_question_reviews")
    .select("attempt_id,question_id,topic_id,difficulty,selected_index,correct_index,explanation,ordinal")
    .eq("user_id",auth.userId).in("attempt_id",selected.map(item=>item.id));
  if(reviewError)throw new Error("Diagnostic topic evidence is unavailable.");
  return selected.flatMap(attempt=>{
    const assessmentId=attempt.assessment_id as AssessmentId;
    const evidence=(reviews??[]).filter(item=>item.attempt_id===attempt.id).map(item=>({
      questionId:item.question_id,topicId:item.topic_id,difficulty:item.difficulty as DiagnosticReview["difficulty"],
      selectedIndex:item.selected_index,correctIndex:item.correct_index,explanation:item.explanation,ordinal:item.ordinal
    }));
    return buildTopicDiagnosis(assessmentId,evidence).filter(topic=>topic.status!=="strong").flatMap(topic=>{
      const curriculumTopic=curriculumTopicForDiagnostic(assessmentId,topic.id);
      const context=curriculumTopic?revisionTopicContext(curriculumTopic.id):null;
      if(!context)return [];
      return [{...context,assessmentId,diagnosticTopicId:topic.id,evidence:topic.status as RevisionEvidence,
        reason:topic.status==="insufficient-evidence"?"The sample is too small for a topic judgment; review before collecting more evidence.":
          `${topic.correct} of ${topic.questions} diagnostic questions were correct.`,
        resources:context.resourceIds.flatMap(id=>learningResources.find(resource=>resource.id===id)??[]).map(resource=>({id:resource.id,title:resource.title,url:resource.url,provider:resource.provider}))}];
    });
  });
}

export async function GET(){
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated")return NextResponse.json({diagnosticsActive:diagnosticsEnabled(),persistenceActive:false,
    recommendations:[],saved:[],reason:auth.status==="unconfigured"?"Cloud learning is unavailable.":"Sign in to load private diagnostic revision recommendations."},
    {headers:{"Cache-Control":"private, no-store"}});
  try{
    const persisted=enabled()?await savedTasks(auth):[];
    const recommendations=await diagnosticRecommendations(auth);
    return NextResponse.json({diagnosticsActive:diagnosticsEnabled(),persistenceActive:enabled(),recommendations,saved:persisted,
      reason:diagnosticsEnabled()?null:"Diagnostic revision recommendations remain staged until the approved migration and feature rollout."},
      {headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Revision queue is unavailable."},{status:503});}
}

export async function POST(request:Request){
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated")return NextResponse.json({error:"Sign in to save a private revision queue."},{status:auth.status==="unconfigured"?503:401});
  if(!enabled())return NextResponse.json({error:"Saved revision scheduling requires the approved learning-workflow rollout."},{status:503});
  const origin=request.headers.get("origin");const expected=trustedSiteOrigin(request)?.origin;
  if(!origin||!expected||origin!==expected)return NextResponse.json({error:"Same-origin revision scheduling required."},{status:403});
  const parsed=saveSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid revision request."},{status:400});
  const context=revisionTopicContext(parsed.data.topicId);
  if(!context)return NextResponse.json({error:"Unknown curriculum topic."},{status:404});
  const assessment=assessmentCatalog.find(item=>item.id===parsed.data.assessmentId&&item.skillId===context.skillId)
    ??assessmentCatalog.find(item=>item.skillId===context.skillId);
  if(!hasSupabaseServerCredentials())return NextResponse.json({error:"Secure revision storage is unavailable."},{status:503});
  const today=dateKeyInTimeZone(new Date());
  const dates=buildSpacedRevisionDates(today,parsed.data.evidence);
  const labels=["Recall the core idea","Apply it again","Check retention"];
  const rows=dates.map((date,index)=>({
    user_id:auth.userId,
    task_key:`${weekStartUtc(new Date(`${date}T00:00:00Z`))}:revision:${context.topicId}:${index+1}`,
    skill_id:context.skillId,
    title:`${labels[index]}: ${context.title}`,
    kind:index===dates.length-1&&assessment?"reassess":"practice",
    status:"todo",estimated_minutes:index===dates.length-1&&assessment?20:25,
    planned_date:date,position:70+index
  }));
  const {error}=await createAdminClient().from("learning_plan_tasks").upsert(rows,{onConflict:"user_id,task_key",ignoreDuplicates:true});
  if(error)return NextResponse.json({error:"Revision tasks could not be saved. No assessment result was changed."},{status:503});
  return NextResponse.json({saved:rows.map(taskFromRow),trust:"Revision activity is separate from trusted quiz scores."},{headers:{"Cache-Control":"private, no-store"}});
}
