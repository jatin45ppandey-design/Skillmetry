import {NextResponse} from "next/server";
import {z} from "zod";
import {authenticatedRequest} from "@skillmetry/backend/lib/supabase/request-auth";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {coursePayloadSchema} from "@skillmetry/shared/lib/admin-courses";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const enabled=()=>process.env.SKILLMETRY_COURSE_PROGRESS_ENABLED==="true"
  && process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED==="true"
  && hasSupabaseServerCredentials();
const progressSchema=z.object({
  courseSlug:z.string().regex(/^[a-z][a-z0-9-]{3,49}$/),
  lessonId:z.string().min(1).max(96),
  publishedRevision:z.number().int().positive(),
  completed:z.boolean()
}).strict();

export async function GET(){
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated")return NextResponse.json({error:"Sign in to resume saved lessons."},
    {status:auth.status==="unconfigured"?503:401,headers});
  if(!enabled())return NextResponse.json({enabled:false,progress:[],
    notice:"Course progress saving is not enabled on this deployment."},{headers});
  const {data,error}=await auth.supabase.from("course_lesson_progress")
    .select("course_slug,lesson_id,published_revision,completed,completed_at")
    .eq("user_id",auth.userId).eq("completed",true).limit(500);
  if(error)return NextResponse.json({error:"Saved course activity is temporarily unavailable."},
    {status:503,headers});
  return NextResponse.json({enabled:true,progress:(data??[]).map(row=>({
    courseSlug:row.course_slug,lessonId:row.lesson_id,
    publishedRevision:row.published_revision,completed:row.completed,
    completedAt:row.completed_at
  }))},{headers});
}

export async function PUT(request:Request){
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated")return NextResponse.json({error:"Sign in to save lesson progress."},
    {status:auth.status==="unconfigured"?503:401,headers});
  if(!enabled())return NextResponse.json({error:"Course progress rollout is not enabled."},{status:503,headers});
  const origin=request.headers.get("origin");
  const expected=trustedSiteOrigin(request)?.origin;
  if(!origin||!expected||origin!==expected)return NextResponse.json({error:"Same-origin update required."},
    {status:403,headers});
  const payload=progressSchema.safeParse(await request.json().catch(()=>null));
  if(!payload.success)return NextResponse.json({error:"Invalid lesson progress update."},{status:400,headers});
  const p=payload.data;
  const {data:course,error:courseError}=await createAdminClient().from("admin_courses")
    .select("published,published_revision").eq("slug",p.courseSlug)
    .not("published","is",null).maybeSingle();
  if(courseError)return NextResponse.json({error:"Published course could not be verified."},{status:503,headers});
  if(!course)return NextResponse.json({error:"Published course not found."},{status:404,headers});
  if(course.published_revision!==p.publishedRevision)return NextResponse.json({
    error:"This course has a newer version. Reload lessons before updating progress."
  },{status:409,headers});
  const checked=coursePayloadSchema.safeParse(course.published);
  if(!checked.success||!checked.data.modules.some(m=>m.lessons.some(l=>l.id===p.lessonId)))
    return NextResponse.json({error:"Lesson is not part of the published course."},{status:404,headers});
  const completionTime=p.completed?new Date().toISOString():null;
  const {data,error}=await auth.supabase.from("course_lesson_progress").upsert({
    user_id:auth.userId,course_slug:p.courseSlug,lesson_id:p.lessonId,
    published_revision:p.publishedRevision,completed:p.completed,
    completed_at:completionTime,updated_at:new Date().toISOString()
  },{onConflict:"user_id,course_slug,lesson_id"})
    .select("lesson_id,published_revision,completed,completed_at").single();
  if(error)return NextResponse.json({error:"Lesson activity could not be saved. Try again."},
    {status:503,headers});
  return NextResponse.json({saved:true,courseSlug:p.courseSlug,lessonId:data.lesson_id,
    publishedRevision:data.published_revision,completed:data.completed,
    completedAt:data.completed_at,trust:"Self-reported lesson activity, not assessed proficiency."
  },{headers});
}
