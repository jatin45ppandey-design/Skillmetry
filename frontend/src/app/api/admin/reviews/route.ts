import {NextResponse} from "next/server";
import {z} from "zod";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {approvalEnabled,editorialDigest,editorialTargets} from "@skillmetry/backend/lib/admin/editorial-review.server";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export const dynamic="force-dynamic";
export const runtime="nodejs";
const moduleSchema=z.enum(["guides","roadmaps","courses","missions","assessments"]);
const requestSchema=z.object({module:moduleSchema,contentId:z.string().min(1).max(120),
 revision:z.number().int().positive()}).strict();
const reviewSchema=z.object({id:z.string().uuid(),decision:z.enum(["approved","changes_requested"]),
 note:z.string().max(600).optional()}).strict();
function sameOrigin(request:Request){
 const origin=request.headers.get("origin"),trusted=trustedSiteOrigin(request)?.origin;
 return Boolean(origin&&trusted&&origin===trusted);
}
async function gate(){
 const session=await adminSession();
 if(session.status!=="ready")return {session:null,error:NextResponse.json({
   error:"Authorized editorial session required."
 },{status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers})};
 if(!approvalEnabled())return {session:null,error:NextResponse.json({
   error:"Editorial approval rollout is not enabled."
 },{status:503,headers})};
 return {session,error:null};
}
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const lookupKeys=["module","contentId","revision"];
 const lookup=lookupKeys.some(key=>params.has(key));
 if([...params.keys()].some(key=>!lookupKeys.includes(key))||
    (lookup&&(!lookupKeys.every(key=>params.getAll(key).length===1)||params.size!==3))||
    (!lookup&&params.size>0))return NextResponse.json({error:"Invalid review lookup."},{status:400,headers});
 const requested=lookup?requestSchema.safeParse({
   module:params.get("module"),contentId:params.get("contentId"),
   revision:Number(params.get("revision"))
 }):null;
 if(lookup&&!requested?.success)return NextResponse.json({error:"Invalid review lookup."},{status:400,headers});
 const session=await adminSession();
 if(session.status!=="ready")return NextResponse.json({error:"Authorized editorial session required."},
   {status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers});
 if(!approvalEnabled())return NextResponse.json({enabled:false,reviews:[]},{headers});
 let query=session.admin.from("admin_editorial_reviews")
   .select("id,module,content_id,requested_revision,status,requested_at,reviewed_at,review_note,requested_by");
 if(lookup&&requested?.success){
   query=query.eq("module",requested.data.module).eq("content_id",requested.data.contentId)
     .eq("requested_revision",requested.data.revision);
 }
 const {data,error}=await query.order("requested_at",{ascending:false}).limit(lookup?1:150);
 if(error)return NextResponse.json({error:"Editorial review queue unavailable."},{status:503,headers});
 return NextResponse.json({enabled:true,role:session.role,reviews:data??[]},{headers});
}
export async function POST(request:Request){
 const {session,error}=await gate();if(error||!session)return error;
 if(session.role==="reviewer")return NextResponse.json({error:"Reviewers cannot request approval."},{status:403,headers});
 if(!sameOrigin(request))return NextResponse.json({error:"Same-origin request required."},{status:403,headers});
 const parsed=requestSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Invalid review request."},{status:400,headers});
 const p=parsed.data,t=editorialTargets[p.module];
 const {data:row,error:loadError}=await session.admin.from(t.table)
   .select("revision,draft").eq(t.id,p.contentId).maybeSingle();
 if(loadError)return NextResponse.json({error:"Saved draft could not be verified."},{status:503,headers});
 if(!row||!row.draft||row.revision!==p.revision)return NextResponse.json({
   error:"Save this exact draft revision before requesting review."
 },{status:409,headers});
 const {data,error:insertError}=await session.admin.from("admin_editorial_reviews").insert({
   module:p.module,content_id:p.contentId,requested_revision:p.revision,
   draft_digest:editorialDigest(row.draft),status:"pending",requested_by:session.userId
 }).select("id,module,content_id,requested_revision,status").single();
 if(insertError)return NextResponse.json({
   error:insertError.code==="23505"?"This revision already has a review request.":"Could not create a review request."
 },{status:insertError.code==="23505"?409:503,headers});
 return NextResponse.json({review:data},{status:201,headers});
}
export async function PATCH(request:Request){
 const {session,error}=await gate();if(error||!session)return error;
 if(session.role!=="reviewer")return NextResponse.json({
   error:"An authorized reviewer must independently approve the draft."
 },{status:403,headers});
 if(!sameOrigin(request))return NextResponse.json({error:"Same-origin request required."},{status:403,headers});
 const parsed=reviewSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Invalid review decision."},{status:400,headers});
 const {data:pending,error:readError}=await session.admin.from("admin_editorial_reviews")
   .select("module,content_id,requested_revision,status,requested_by").eq("id",parsed.data.id).maybeSingle();
 if(readError)return NextResponse.json({error:"Review request could not be checked."},{status:503,headers});
 if(!pending)return NextResponse.json({error:"Review not found."},{status:404,headers});
 if(pending.status!=="pending")return NextResponse.json({error:"Review has already been decided."},{status:409,headers});
 if(pending.requested_by===session.userId)return NextResponse.json({error:"You cannot approve your own request."},{status:403,headers});
 const t=editorialTargets[pending.module as keyof typeof editorialTargets];
 if(!t)return NextResponse.json({error:"Invalid review module."},{status:400,headers});
 const {data:row,error:rowError}=await session.admin.from(t.table)
   .select("revision").eq(t.id,pending.content_id).maybeSingle();
 if(rowError)return NextResponse.json({error:"Current draft revision could not be checked."},{status:503,headers});
 if(!row||row.revision!==pending.requested_revision)return NextResponse.json({
   error:"This draft changed since review was requested. Request review for the new version."
 },{status:409,headers});
 const {data,error:writeError}=await session.admin.from("admin_editorial_reviews").update({
   status:parsed.data.decision,reviewed_by:session.userId,
   reviewed_at:new Date().toISOString(),review_note:parsed.data.note?.trim()??null
 }).eq("id",parsed.data.id).eq("status","pending")
   .select("id,module,content_id,requested_revision,status").maybeSingle();
 if(writeError)return NextResponse.json({error:"Could not record review decision."},{status:503,headers});
 if(!data)return NextResponse.json({error:"Review was decided concurrently."},{status:409,headers});
 return NextResponse.json({review:data},{headers});
}
