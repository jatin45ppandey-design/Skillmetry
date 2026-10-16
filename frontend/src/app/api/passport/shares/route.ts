import {NextResponse} from "next/server";
import {createHash,randomBytes} from "node:crypto";
import {authenticatedRequest} from "@skillmetry/backend/lib/supabase/request-auth";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {trustedSiteOrigin} from "@skillmetry/backend/lib/security/site-origin.server";
import {shareSelectionSchema,revokeSchema,type SharedPassportSnapshot} from "@skillmetry/shared/lib/passport-sharing";
import {skillById,careers} from "@skillmetry/shared/data/catalog";
import {checkRequestLimit} from "@skillmetry/backend/lib/security/request-rate-limit.server";

export const runtime="nodejs";
const enabled=()=>process.env.SKILLMETRY_PASSPORT_SHARING_ENABLED==="true";
async function permit() {
 const auth=await authenticatedRequest();
 if(auth.status!=="authenticated")return {auth:null,error:NextResponse.json({error:"Sign in to manage your private passport."},{status:401})};
 if(!enabled())return {auth:null,error:NextResponse.json({error:"Passport sharing is staged until database approval."},{status:503})};
 return {auth,error:null};
}
export async function GET(){
 const {auth,error}=await permit();if(error||!auth)return error;
 const {data,error:loadError}=await auth.supabase.from("passport_share_links")
  .select("id,created_at,expires_at,revoked_at").eq("user_id",auth.userId)
  .order("created_at",{ascending:false}).limit(25);
 if(loadError)return NextResponse.json({error:"Unable to load link status."},{status:503});
 return NextResponse.json({links:data??[]},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:Request){
 const {auth,error}=await permit();if(error||!auth)return error;
 const body=shareSelectionSchema.safeParse(await request.json().catch(()=>null));
 if(!body.success)return NextResponse.json({error:"Choose 1–8 measured skills and confirm consent."},{status:400});
 if(!hasSupabaseServerCredentials()||process.env.SKILLMETRY_DB_RATE_LIMITING_ENABLED!=="true")
   return NextResponse.json({error:"Secure sharing controls are not configured."},{status:503});
 const guard=await checkRequestLimit("passport:create",auth.userId,5,86400);
 if(guard!=="allow")return NextResponse.json({error:"Share limit reached or temporarily unavailable."},{status:guard==="blocked"?429:503});
 const origin=trustedSiteOrigin(request);
 if(!origin)return NextResponse.json({error:"Trusted public site URL is not configured."},{status:503});
 const [{data:profile,error:profileError},{data:attempts,error:attemptError}]=await Promise.all([
   auth.supabase.from("profiles").select("display_name,target_career_id")
     .eq("id",auth.userId).single(),
   auth.supabase.from("assessment_attempts")
     .select("id,skill_id,score,assessment_version,completed_at")
     .eq("user_id",auth.userId).eq("grading_method","server_quiz")
     .order("completed_at",{ascending:false}).order("id",{ascending:false}).limit(1000)
 ]);
 if(profileError||attemptError||!profile)return NextResponse.json({error:"Private assessment evidence could not be loaded."},{status:503});
 const recent=new Map<string,(typeof attempts extends (infer T)[]|null?T:never)>();
 for(const item of attempts??[])if(!recent.has(item.skill_id))recent.set(item.skill_id,item);
 const skills=body.data.skillIds.flatMap(id=>{
   const item=recent.get(id);
   return item?[{id,label:skillById[id].label,score:Number(item.score),
     assessmentVersion:String(item.assessment_version),completedAt:String(item.completed_at)}]:[];
 });
 if(skills.length!==body.data.skillIds.length)
  return NextResponse.json({error:"Only measured, trusted quiz results can be shared."},{status:409});
 const snapshot:SharedPassportSnapshot={name:profile.display_name,
  career:careers.find(c=>c.id===profile.target_career_id)?.title??"Independent learner",
  issuedAt:new Date().toISOString(),skills,
  notice:"Selected Skillmetry foundational quiz scores only. Not a professional certification or hiring forecast."};
 const token=randomBytes(32).toString("base64url");
 const tokenHash=createHash("sha256").update(token).digest("hex");
 const expiresAt=new Date(Date.now()+7*86400000).toISOString();
 const {data:saved,error:writeError}=await createAdminClient().from("passport_share_links")
   .insert({user_id:auth.userId,token_hash:tokenHash,snapshot,expires_at:expiresAt})
   .select("id,created_at,expires_at").single();
 if(writeError||!saved)return NextResponse.json({error:"Share link could not be created."},{status:503});
 const url=new URL("/passport/share/"+token,origin);
 return NextResponse.json({link:saved,url:url.toString()},
  {headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
export async function DELETE(request:Request){
 const {auth,error}=await permit();if(error||!auth)return error;
 const body=revokeSchema.safeParse(await request.json().catch(()=>null));
 if(!body.success)return NextResponse.json({error:"Invalid link ID."},{status:400});
 const {data,error:writeError}=await auth.supabase.from("passport_share_links")
  .update({revoked_at:new Date().toISOString()})
  .eq("id",body.data.id).eq("user_id",auth.userId).is("revoked_at",null)
  .select("id").maybeSingle();
 if(writeError)return NextResponse.json({error:"Could not revoke link."},{status:503});
 return NextResponse.json({revoked:Boolean(data)},{headers:{"Cache-Control":"private, no-store"}});
}
