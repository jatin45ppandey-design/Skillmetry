import {NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
function tokenValid(header:string|null,expected:string):boolean {
 const actual=header?.startsWith("Bearer ")?header.slice(7):"";
 const a=Buffer.from(actual),b=Buffer.from(expected);
 return a.length===b.length&&a.length>0&&timingSafeEqual(a,b);
}
/**
 * Owner-authenticated release readiness. All queries are read-only.
 * A missing activated-feature migration fails closed, without exposing
 * database names, secret values, errors or timing information to callers.
 */
export async function GET(request:Request){
 const token=process.env.SKILLMETRY_HEALTHCHECK_TOKEN?.trim();
 if(!token||!tokenValid(request.headers.get("authorization"),token))
   return NextResponse.json({error:"Not available."},{status:404,headers});
 if(!hasSupabaseServerCredentials())
   return NextResponse.json({status:"unavailable"},{status:503,headers});
 const required=["careers","profiles","assessment_attempts"];
 if(process.env.SKILLMETRY_DB_RATE_LIMITING_ENABLED==="true") required.push("api_burst_limit_windows");
 if(process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true" ||
    process.env.SKILLMETRY_STREAKS_ENABLED==="true")
    required.push("learning_plan_tasks","practice_lab_attempts","mission_work");
 if(process.env.SKILLMETRY_PASSPORT_SHARING_ENABLED==="true")
    required.push("passport_share_links");
 if(process.env.SKILLMETRY_STREAKS_ENABLED==="true" &&
    process.env.NEXT_PUBLIC_LEARNING_STREAK_ENABLED!=="true")
    return NextResponse.json({status:"unavailable"},{status:503,headers});
 try{
   const admin=createAdminClient();
   for(const table of [...new Set(required)]){
     const {error}=await admin.from(table).select("*").limit(1)
       .abortSignal(AbortSignal.timeout(3500));
     if(error)return NextResponse.json({status:"unavailable"},{status:503,headers});
   }
   return NextResponse.json({status:"ready"},{headers});
 }catch{return NextResponse.json({status:"unavailable"},{status:503,headers});}
}
