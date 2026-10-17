import {approvedPublication} from "@skillmetry/backend/lib/admin/editorial-review.server";
import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {saveCourseSchema} from "@skillmetry/shared/lib/admin-courses";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
async function identify(){
 const session=await adminSession();
 if(session.status!=="ready")return {session:null,error:NextResponse.json({error:"Admin Studio is not available."},
   {status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers})};
 return {session,error:null};
}
export async function GET(){
 const {session,error}=await identify();if(error||!session)return error;
 const {data,error:dbError}=await session.admin.from("admin_courses")
   .select("slug,skill_id,draft,published,revision,published_revision,updated_at,published_at")
   .order("updated_at",{ascending:false}).limit(60);
 if(dbError)return NextResponse.json({error:"Course drafts are unavailable."},{status:503,headers});
 return NextResponse.json({role:session.role,courses:data??[]},{headers});
}
export async function PUT(request:Request){
 const {session,error}=await identify();if(error||!session)return error;
 if(session.role==="reviewer")return NextResponse.json({error:"Editor access is required."},{status:403,headers});
 const origin=request.headers.get("origin");
 const expected=trustedSiteOrigin(request)?.origin;
 if(!origin||!expected||origin!==expected)
   return NextResponse.json({error:"Same-origin update required."},{status:403,headers});
 const payload=saveCourseSchema.safeParse(await request.json().catch(()=>null));
 if(!payload.success)return NextResponse.json({error:"Check course slug, modules, lessons, links and notes.",
   issues:payload.error.flatten().fieldErrors},{status:400,headers});
 if(payload.data.publish&&session.role!=="owner")
   return NextResponse.json({error:"Owner approval is required to publish."},{status:403,headers});
 if(payload.data.publish){
   const approval=await approvedPublication(session.admin,"courses",payload.data.slug,
     payload.data.expectedRevision,payload.data.draft);
   if(!approval.ok)return NextResponse.json({error:approval.reason},{status:409,headers});
 }
 const {data,error:dbError}=await session.admin.rpc("save_admin_course",{
   p_actor:session.userId,p_slug:payload.data.slug,p_skill_id:payload.data.skillId,
   p_draft:payload.data.draft,p_expected_revision:payload.data.expectedRevision,
   p_publish:payload.data.publish
 });
 if(dbError){
   if(dbError.message.includes("revision_conflict"))
     return NextResponse.json({error:"This course changed elsewhere. Reload before saving."},{status:409,headers});
   return NextResponse.json({error:"Course was not saved. Check migration and try again."},{status:503,headers});
 }
 return NextResponse.json({result:data},{headers});
}
