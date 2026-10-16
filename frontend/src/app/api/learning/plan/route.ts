import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { buildWeeklyStudyPlan, weekStartUtc } from "@skillmetry/shared/lib/learning-plan";
import { careerIdSchema, normalizeOnboardingPreferences } from "@skillmetry/shared/lib/profile-schema";

export const runtime="nodejs";
const patchSchema=z.object({
  taskKey:z.string().min(4).max(128),
  status:z.enum(["todo","in_progress","completed","skipped"]),
  plannedDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).strict();

const enabled=()=>process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true";
const notReady=()=>NextResponse.json({error:"Saved learning workflows are staged; an approved database migration is required."},
  {status:503,headers:{"Cache-Control":"private, no-store"}});

async function session() {
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated")return {auth:null,error:NextResponse.json({error:"Sign in to save a learning plan."},
    {status:auth.status==="unconfigured"?503:401})};
  return {auth,error:null};
}
function taskFromRow(row:Record<string,unknown>) {
  return {taskKey:row.task_key,skillId:row.skill_id,title:row.title,kind:row.kind,
    status:row.status,estimatedMinutes:row.estimated_minutes,plannedDate:row.planned_date,position:row.position};
}
export async function GET() {
  const {auth,error}=await session();if(error||!auth)return error;
  if(!enabled())return notReady();
  const monday=weekStartUtc(new Date());
  const sunday=new Date(monday+"T00:00:00Z");sunday.setUTCDate(sunday.getUTCDate()+6);
  const {data,error:queryError}=await auth.supabase.from("learning_plan_tasks")
    .select("task_key,skill_id,title,kind,status,estimated_minutes,planned_date,position")
    .eq("user_id",auth.userId).gte("planned_date",monday).lte("planned_date",sunday.toISOString().slice(0,10))
    .order("position",{ascending:true}).limit(50);
  if(queryError)return NextResponse.json({error:"Unable to load study tasks."},{status:503});
  return NextResponse.json({week:monday,tasks:(data??[]).map(taskFromRow)},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST() {
  const {auth,error}=await session();if(error||!auth)return error;
  if(!enabled())return notReady();
  const {data:profile,error:profileError}=await auth.supabase.from("profiles")
    .select("target_career_id,hours_per_week,onboarding_preferences").eq("id",auth.userId).maybeSingle();
  if(profileError)return NextResponse.json({error:"Unable to load your study preferences."},{status:503});
  const career=careerIdSchema.safeParse(profile?.target_career_id);
  if(!profile||!career.success)return NextResponse.json({error:"Complete onboarding before generating a saved plan."},{status:409});
  const preferences=normalizeOnboardingPreferences(profile.onboarding_preferences,career.data);
  const {data:attempts,error:attemptError}=await auth.supabase.from("assessment_attempts")
    .select("id,skill_id,score,completed_at")
    .eq("user_id",auth.userId).eq("grading_method","server_quiz")
    .order("completed_at",{ascending:false}).order("id",{ascending:false}).limit(2000);
  if(attemptError)return NextResponse.json({error:"Trusted assessment history is unavailable."},{status:503});
  const scores:Record<string,number>={};
  for(const attempt of attempts??[])if(!Object.hasOwn(scores,attempt.skill_id))scores[attempt.skill_id]=Number(attempt.score);
  const monday=weekStartUtc(new Date());
  const plan=buildWeeklyStudyPlan({learning:preferences.learning,trustedScores:scores,
    hoursPerWeek:preferences.hoursPerWeek,monday});
  if(!plan.length)return NextResponse.json({error:"Select a career or skills before creating a plan."},{status:409});
  const {error:writeError}=await auth.supabase.from("learning_plan_tasks").upsert(
    plan.map(task=>({user_id:auth.userId,task_key:task.taskKey,skill_id:task.skillId,
      title:task.title,kind:task.kind,status:task.status,estimated_minutes:task.estimatedMinutes,
      planned_date:task.plannedDate,position:task.position})),
    {onConflict:"user_id,task_key",ignoreDuplicates:true}
  );
  if(writeError)return NextResponse.json({error:"Unable to save the plan. No trusted assessment was changed."},{status:503});
  return GET();
}
export async function PATCH(request:Request) {
  const {auth,error}=await session();if(error||!auth)return error;
  if(!enabled())return notReady();
  const parsed=patchSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid task update."},{status:400});
  if(parsed.data.plannedDate){
    const date=new Date(parsed.data.plannedDate+"T00:00:00Z");
    const week=parsed.data.taskKey.slice(0,10);
    const sunday=new Date(week+"T00:00:00Z");
    sunday.setUTCDate(sunday.getUTCDate()+6);
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==parsed.data.plannedDate||
       parsed.data.plannedDate<week||parsed.data.plannedDate>sunday.toISOString().slice(0,10))
      return NextResponse.json({error:"Choose a date within the task's original week."},{status:400});
  }
  const patch={status:parsed.data.status,updated_at:new Date().toISOString(),
    ...(parsed.data.plannedDate?{planned_date:parsed.data.plannedDate}:{})};
  const {data,error:writeError}=await auth.supabase.from("learning_plan_tasks")
    .update(patch)
    .eq("user_id",auth.userId).eq("task_key",parsed.data.taskKey)
    .select("task_key,skill_id,title,kind,status,estimated_minutes,planned_date,position").maybeSingle();
  if(writeError)return NextResponse.json({error:"Unable to update task."},{status:503});
  if(!data)return NextResponse.json({error:"Study task not found."},{status:404});
  return NextResponse.json({task:taskFromRow(data)},{headers:{"Cache-Control":"private, no-store"}});
}
