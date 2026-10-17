import {NextResponse} from "next/server";
import {authenticatedRequest} from "@skillmetry/backend/lib/supabase/request-auth";
import {normalizeMissionWork,missionWorkInputSchema} from "@skillmetry/shared/lib/mission-work";
import {adminMissionPayloadSchema} from "@skillmetry/shared/lib/admin-missions";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";

export const runtime="nodejs";
const enabled=()=>process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true";
async function session(){
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated")
    return {auth:null,error:NextResponse.json({error:"Sign in to track project missions."},
      {status:auth.status==="unconfigured"?503:401})};
  if(!enabled())return {auth:null,error:NextResponse.json({error:"Mission storage requires an approved rollout."},{status:503})};
  return {auth,error:null};
}
function serialize(row:Record<string,unknown>){
  return {missionId:row.mission_id,status:row.status,
    completedIndices:row.completed_indices??[],repositoryUrl:row.repository_url??"",
    demoUrl:row.demo_url??"",notes:row.notes??""};
}
export async function GET(){
  const {auth,error}=await session();if(error||!auth)return error;
  const {data,error:loadError}=await auth.supabase.from("mission_work")
    .select("mission_id,status,completed_indices,repository_url,demo_url,notes")
    .eq("user_id",auth.userId).order("mission_id",{ascending:true}).limit(100);
  if(loadError)return NextResponse.json({error:"Unable to read private mission activity."},{status:503});
  return NextResponse.json({work:(data??[]).map(serialize)},{headers:{"Cache-Control":"private, no-store"}});
}
export async function PUT(request:Request){
  const {auth,error}=await session();if(error||!auth)return error;
  const input=await request.json().catch(()=>null);
  const parsed=missionWorkInputSchema.safeParse(input);
  let publishedMission:{id:string;deliverables:string[]}|undefined;
  if(parsed.success&&parsed.data.missionId.startsWith("cms-")){
    if(process.env.SKILLMETRY_ADMIN_MISSIONS_ENABLED!=="true"||
       process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true")
      return NextResponse.json({error:"This mission is not available yet."},{status:400});
    if(!hasSupabaseServerCredentials())
      return NextResponse.json({error:"Mission database is not configured."},{status:503});
    const {data,error:missionError}=await createAdminClient().from("admin_missions")
      .select("published").eq("id",parsed.data.missionId)
      .not("published","is",null).maybeSingle();
    if(missionError)return NextResponse.json({error:"Mission catalog unavailable."},{status:503});
    const mission=adminMissionPayloadSchema.safeParse(data?.published);
    if(mission.success)publishedMission={id:parsed.data.missionId,deliverables:mission.data.deliverables};
  }
  let work;
  try{work=normalizeMissionWork(input,publishedMission);}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid submission"},{status:400});}
  if(!hasSupabaseServerCredentials())return NextResponse.json({error:"Secure mission storage is not configured."},{status:503});
  const {data,error:writeError}=await createAdminClient().from("mission_work").upsert({
    user_id:auth.userId,mission_id:work.missionId,status:work.status,
    completed_indices:work.completedIndices,repository_url:work.repositoryUrl||null,
    demo_url:work.demoUrl||null,notes:work.notes,updated_at:new Date().toISOString()
  },{onConflict:"user_id,mission_id"})
  .select("mission_id,status,completed_indices,repository_url,demo_url,notes").single();
  if(writeError||!data)return NextResponse.json({error:"Mission progress was not saved."},{status:503});
  return NextResponse.json({work:serialize(data)},{headers:{"Cache-Control":"private, no-store"}});
}
