import {approvedPublication} from "@skillmetry/backend/lib/admin/editorial-review.server";
import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {saveEditorialRoadmapSchema} from "@skillmetry/shared/lib/admin-roadmaps";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
async function sessionResponse(){
 const session=await adminSession();
 if(session.status!=="ready")
   return {session:null,error:NextResponse.json({error:"Admin Studio is not available."},
     {status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers})};
 return {session,error:null};
}
export async function GET(){
 const {session,error}=await sessionResponse();if(error||!session)return error;
 const {data,error:dbError}=await session.admin.from("admin_career_roadmaps")
   .select("career_id,draft,published,revision,published_revision,updated_at,published_at")
   .order("career_id",{ascending:true}).limit(12);
 if(dbError)return NextResponse.json({error:"Unable to load roadmap drafts."},{status:503,headers});
 return NextResponse.json({role:session.role,roadmaps:data??[]},{headers});
}
export async function PUT(request:Request){
 const {session,error}=await sessionResponse();if(error||!session)return error;
 if(session.role==="reviewer")return NextResponse.json({error:"Edit access required."},{status:403,headers});
 const origin=request.headers.get("origin");
 const expected=trustedSiteOrigin(request)?.origin;
 if(!origin||!expected||origin!==expected)return NextResponse.json({error:"Same-origin update required."},{status:403,headers});
 const parsed=saveEditorialRoadmapSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Roadmap is invalid: check every skill and prerequisite order.",
   issues:parsed.error.flatten().fieldErrors},{status:400,headers});
 if(parsed.data.publish&&session.role!=="owner")
   return NextResponse.json({error:"Only owner can publish."},{status:403,headers});
 if(parsed.data.publish){
   const approval=await approvedPublication(session.admin,"roadmaps",parsed.data.careerId,
     parsed.data.expectedRevision,parsed.data.draft);
   if(!approval.ok)return NextResponse.json({error:approval.reason},{status:409,headers});
 }
 const {data,error:writeError}=await session.admin.rpc("save_admin_career_roadmap",{
   p_actor:session.userId,p_career_id:parsed.data.careerId,
   p_draft:parsed.data.draft,p_expected_revision:parsed.data.expectedRevision,
   p_publish:parsed.data.publish
 });
 if(writeError){
   if(writeError.message.includes("revision_conflict"))
     return NextResponse.json({error:"Roadmap changed in another session. Reload before editing."},{status:409,headers});
   return NextResponse.json({error:"Unable to save roadmap. Nothing was confirmed."},{status:503,headers});
 }
 return NextResponse.json({result:data},{headers});
}
