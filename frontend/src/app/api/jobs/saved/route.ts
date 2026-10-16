import {NextResponse} from "next/server";
import {z} from "zod";
import {authenticatedRequest} from "@skillmetry/backend/lib/supabase/request-auth";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {analyzeJobDescription} from "@skillmetry/shared/lib/job-intelligence";
import {checkRequestLimit} from "@skillmetry/backend/lib/security/request-rate-limit.server";

export const runtime="nodejs";
const save=z.object({title:z.string().trim().min(3).max(80),
 description:z.string().trim().min(50).max(12000)}).strict();
const remove=z.object({id:z.string().uuid()}).strict();
async function identify(){
 const auth=await authenticatedRequest();
 if(auth.status!=="authenticated")return {auth:null,error:NextResponse.json({error:"Sign in to save your career notes."},{status:401})};
 return {auth,error:null};
}
export async function GET(){
 const {auth,error}=await identify();if(error||!auth)return error;
 const {data,error:loadError}=await auth.supabase.from("job_analyses")
  .select("id,extracted_skills,created_at").eq("user_id",auth.userId)
  .order("created_at",{ascending:false}).limit(25);
 if(loadError)return NextResponse.json({error:"Saved role analyses could not be loaded."},{status:503});
 return NextResponse.json({saved:data??[]},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:Request){
 const {auth,error}=await identify();if(error||!auth)return error;
 if(!hasSupabaseServerCredentials())return NextResponse.json({error:"Saving role analyses is unavailable."},{status:503});
 const parsed=save.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Enter a role title and a valid job description."},{status:400});
 const limit=await checkRequestLimit("jobs:save",auth.userId,15,3600);
 if(limit!=="allow")return NextResponse.json({error:"Job save limit reached or unavailable."},{status:limit==="blocked"?429:503});
 const analysis=analyzeJobDescription(parsed.data.description,{});
 if(!analysis.requirements.length)return NextResponse.json({error:"No canonical requirements found to save."},{status:422});
 // Minimize private data: never store the full pasted job description or inferred grades.
 const extracted=[{kind:"role",title:parsed.data.title},
   ...analysis.requirements.map(item=>({skillId:item.skillId,matchedTerm:item.matchedTerm}))];
 const {data,error:writeError}=await createAdminClient().from("job_analyses")
  .insert({user_id:auth.userId,extracted_skills:extracted})
  .select("id,extracted_skills,created_at").single();
 if(writeError||!data)return NextResponse.json({error:"Unable to save the role requirements."},{status:503});
 return NextResponse.json({saved:data},{headers:{"Cache-Control":"private, no-store"}});
}
export async function DELETE(request:Request){
 const {auth,error}=await identify();if(error||!auth)return error;
 if(!hasSupabaseServerCredentials())return NextResponse.json({error:"Saved analysis management is unavailable."},{status:503});
 const body=remove.safeParse(await request.json().catch(()=>null));
 if(!body.success)return NextResponse.json({error:"Invalid analysis ID."},{status:400});
 const {data,error:deleteError}=await createAdminClient().from("job_analyses")
  .delete().eq("id",body.data.id).eq("user_id",auth.userId).select("id").maybeSingle();
 if(deleteError)return NextResponse.json({error:"Could not delete saved role requirements."},{status:503});
 return NextResponse.json({deleted:Boolean(data)},{headers:{"Cache-Control":"private, no-store"}});
}
