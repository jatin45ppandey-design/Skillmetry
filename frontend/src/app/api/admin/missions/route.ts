import {approvedPublication} from "@skillmetry/backend/lib/admin/editorial-review.server";
import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {saveAdminMissionSchema} from "@skillmetry/shared/lib/admin-missions";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const enabled=()=>process.env.SKILLMETRY_ADMIN_MISSIONS_ENABLED==="true";
async function identify(){
 if(!enabled())return {session:null,error:NextResponse.json({error:"Mission Builder awaits staging approval."},{status:503,headers})};
 const session=await adminSession();
 if(session.status!=="ready")return {session:null,error:NextResponse.json({error:"Admin Studio is not available."},{
  status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers})};
 return {session,error:null};
}
export async function GET(){
 const {session,error}=await identify();if(error||!session)return error;
 const {data,error:dbError}=await session.admin.from("admin_missions")
   .select("id,career_id,skill_id,draft,published,revision,published_revision,updated_at,published_at")
   .order("updated_at",{ascending:false}).limit(80);
 if(dbError)return NextResponse.json({error:"Mission drafts are unavailable."},{status:503,headers});
 return NextResponse.json({role:session.role,missions:data??[]},{headers});
}
export async function PUT(request:Request){
 const {session,error}=await identify();if(error||!session)return error;
 if(session.role==="reviewer")return NextResponse.json({error:"Editor access required."},{status:403,headers});
 const origin=request.headers.get("origin");
 const expected=trustedSiteOrigin(request)?.origin;
 if(!origin||!expected||origin!==expected)
   return NextResponse.json({error:"Same-origin update required."},{status:403,headers});
 const parsed=saveAdminMissionSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Check mission career, skill, description, time and checklist.",issues:parsed.error.flatten().fieldErrors},{status:400,headers});
 if(parsed.data.publish&&session.role!=="owner")
   return NextResponse.json({error:"Owner approval is required to publish."},{status:403,headers});
 if(parsed.data.publish){
   const approval=await approvedPublication(session.admin,"missions",parsed.data.id,
     parsed.data.expectedRevision,parsed.data.draft);
   if(!approval.ok)return NextResponse.json({error:approval.reason},{status:409,headers});
 }
 const {data,error:dbError}=await session.admin.rpc("save_admin_mission",{
  p_actor:session.userId,p_id:parsed.data.id,
  p_career_id:parsed.data.careerId,p_skill_id:parsed.data.skillId,
  p_draft:parsed.data.draft,p_expected_revision:parsed.data.expectedRevision,
  p_publish:parsed.data.publish
 });
 if(dbError){
   if(dbError.message.includes("revision_conflict"))
     return NextResponse.json({error:"Mission was changed elsewhere. Reload before saving."},{status:409,headers});
   if(dbError.message.includes("published_checklist_immutable"))
     return NextResponse.json({error:"A published checklist cannot be changed. Create a new mission ID instead."},{status:400,headers});
   return NextResponse.json({error:"Mission not saved. Check the staged migration and try again."},{status:503,headers});
 }
 return NextResponse.json({result:data},{headers});
}
