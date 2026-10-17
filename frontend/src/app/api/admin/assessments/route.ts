import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {saveAuthoredBankSchema} from "@skillmetry/shared/lib/admin-assessments";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
async function identify(){
 if(process.env.SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED!=="true")
   return {session:null,error:NextResponse.json({error:"Question authoring is staged."},{status:503,headers})};
 const session=await adminSession();
 if(session.status!=="ready")return {session:null,error:NextResponse.json(
   {error:"Admin Studio access required."},
   {status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers}
 )};
 return {session,error:null};
}
export async function GET(){
 const {session,error}=await identify();if(error||!session)return error;
 const {data,error:dbError}=await session.admin.from("admin_assessment_banks")
   .select("assessment_id,draft,revision,published_version,updated_at,published_at")
   .order("updated_at",{ascending:false}).limit(9);
 if(dbError)return NextResponse.json({error:"Assessment draft library unavailable."},{status:503,headers});
 return NextResponse.json({role:session.role,banks:data??[]},{headers});
}
export async function PUT(request:Request){
 const {session,error}=await identify();if(error||!session)return error;
 if(session.role==="reviewer")
   return NextResponse.json({error:"Reviewer access is read-only."},{status:403,headers});
 const origin=request.headers.get("origin"),trusted=trustedSiteOrigin(request)?.origin;
 if(!origin||!trusted||origin!==trusted)
   return NextResponse.json({error:"Same-origin update required."},{status:403,headers});
 const input=saveAuthoredBankSchema.safeParse(await request.json().catch(()=>null));
 if(!input.success)return NextResponse.json({error:"Check question IDs, content, four choices, answers and explanations.",
   issues:input.error.flatten().fieldErrors},{status:400,headers});
 if(input.data.publish&&session.role!=="owner")
   return NextResponse.json({error:"Only the owner may publish question banks."},{status:403,headers});
 const {data,error:dbError}=await session.admin.rpc("save_admin_assessment_bank",{
   p_actor:session.userId,p_assessment_id:input.data.assessmentId,
   p_draft:input.data.draft,p_expected_revision:input.data.expectedRevision,p_publish:input.data.publish
 });
 if(dbError){
   if(dbError.message.includes("revision_conflict"))
     return NextResponse.json({error:"Bank changed in another tab. Reload before editing."},{status:409,headers});
   if(dbError.message.includes("invalid_")||dbError.message.includes("placeholder_")||
      dbError.message.includes("duplicate_"))
     return NextResponse.json({error:"Question bank failed strict database validation."},{status:400,headers});
   return NextResponse.json({error:"Unable to save question bank. Check staged migration."},{status:503,headers});
 }
 return NextResponse.json({result:data},{headers});
}
