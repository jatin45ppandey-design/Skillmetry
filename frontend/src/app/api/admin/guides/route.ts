import {NextResponse} from "next/server";
import {skills} from "@skillmetry/shared/data/catalog";
import {saveAdminGuideSchema} from "@skillmetry/shared/lib/admin-content";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
function unavailable(status:"unauthorized"|"forbidden"|"unavailable"){
 const code=status==="unauthorized"?401:status==="forbidden"?403:503;
 return NextResponse.json({error:code===401?"Sign in to open Admin Studio.":
   code===403?"Admin access is restricted.":"Admin Studio is staged or unavailable."},{status:code,headers});
}
export async function GET(){
 const session=await adminSession();
 if(session.status!=="ready")return unavailable(session.status);
 const {data,error}=await session.admin.from("admin_skill_guides")
   .select("skill_id,draft,published,revision,published_revision,updated_at,published_at")
   .order("skill_id",{ascending:true}).limit(50);
 if(error)return NextResponse.json({error:"Unable to load admin guides."},{status:503,headers});
 return NextResponse.json({role:session.role,guides:data??[]},{headers});
}
export async function PUT(request:Request){
 const session=await adminSession();
 if(session.status!=="ready")return unavailable(session.status);
 if(session.role==="reviewer")return unavailable("forbidden");
 // Same-origin browser mutation: cookie-authenticated cross-origin requests
 // without a matching Origin must never be accepted.
 const origin=request.headers.get("origin");
 if(!origin||origin!==new URL(request.url).origin)
   return NextResponse.json({error:"Same-origin update required."},{status:403,headers});
 const input=saveAdminGuideSchema.safeParse(await request.json().catch(()=>null));
 if(!input.success||!skills.some(skill=>skill.id===input.data.skillId))
   return NextResponse.json({error:"Invalid learning guide update.",issues:input.success?undefined:input.error.flatten().fieldErrors},
     {status:400,headers});
 if(input.data.publish&&session.role!=="owner")return unavailable("forbidden");
 const {data,error}=await session.admin.rpc("save_admin_skill_guide",{
   p_actor:session.userId,p_skill_id:input.data.skillId,p_draft:input.data.draft,
   p_expected_revision:input.data.expectedRevision,p_publish:input.data.publish
 });
 if(error){
   if(error.message.includes("revision_conflict"))return NextResponse.json(
     {error:"This guide was edited elsewhere. Reload before saving."},{status:409,headers});
   return NextResponse.json({error:"Unable to save this guide. No changes were confirmed."},{status:503,headers});
 }
 return NextResponse.json({result:data},{headers});
}
