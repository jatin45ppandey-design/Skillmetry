import {NextResponse,type NextRequest} from "next/server";
import {z} from "zod";
import {authenticatedRequest} from "@skillmetry/backend/lib/supabase/request-auth";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {listLabExercises,gradeLabExercise} from "@skillmetry/backend/lib/learning/lab-bank.server";
import {isCanonicalSkillId} from "@skillmetry/shared/data/learning-catalog";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";

const input=z.object({exerciseId:z.string().min(3).max(100),
  selectedIndex:z.number().int().min(0).max(3).optional(),
  textAnswer:z.string().max(80).optional()}).strict();
export async function GET(request:NextRequest){
  const skill=request.nextUrl.searchParams.get("skill");
  if(skill&&!isCanonicalSkillId(skill))return NextResponse.json({error:"Unknown skill."},{status:400});
  const exercises=listLabExercises(skill??undefined);
  const auth=await authenticatedRequest();
  const active=process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true"&&auth.status==="authenticated";
  let history:{exercise_id:string;is_correct:boolean;completed_at:string}[]=[];
  if(active){
    const {data,error}=await auth.supabase.from("practice_lab_attempts")
      .select("exercise_id,is_correct,completed_at").eq("user_id",auth.userId)
      .order("completed_at",{ascending:false}).limit(30);
    if(error)return NextResponse.json({error:"Practice history is unavailable."},{status:503});
    history=data??[];
  }
  return NextResponse.json({exercises,history,persistenceActive:active,runtime:{
    available:false,
    reason:"This guided lab does not execute submitted source code. Responses are checked against reviewed reference answers."
  }},
    {headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:Request){
  const parsed=input.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid practice submission."},{status:400});
  const result=gradeLabExercise(parsed.data.exerciseId,parsed.data);
  if(!result)return NextResponse.json({error:"Unknown exercise or invalid response."},{status:400});
  const auth=await authenticatedRequest();
  const enabled=process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true";
  if(enabled&&auth.status==="authenticated"){
    // Practice grades may be previewed without a session, but storing private activity is
    // a state-changing authenticated operation and must satisfy the same-origin policy.
    const origin=request.headers.get("origin");
    const expectedOrigin=trustedSiteOrigin(request)?.origin;
    if(!origin||!expectedOrigin||origin!==expectedOrigin)return NextResponse.json(
      {error:"Same-origin practice submission required."},{status:403});
    if(!hasSupabaseServerCredentials())return NextResponse.json({error:"Practice persistence is unavailable."},{status:503});
    const {error}=await createAdminClient().from("practice_lab_attempts").insert({
      user_id:auth.userId,exercise_id:result.exerciseId,skill_id:result.skillId,is_correct:result.correct
    });
    if(error)return NextResponse.json({error:"Practice activity could not be saved."},{status:503});
  }
  return NextResponse.json({...result,persisted:enabled&&auth.status==="authenticated"},
    {headers:{"Cache-Control":"private, no-store"}});
}
