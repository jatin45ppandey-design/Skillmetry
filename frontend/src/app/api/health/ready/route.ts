import {NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";

export const runtime="nodejs";
export const dynamic="force-dynamic";
function tokenValid(header:string|null,expected:string):boolean {
 const actual=header?.startsWith("Bearer ")?header.slice(7):"";
 const a=Buffer.from(actual),b=Buffer.from(expected);
 return a.length===b.length&&a.length>0&&timingSafeEqual(a,b);
}
/** Authenticated readiness probe, never a public connection information leak. */
export async function GET(request:Request){
 const token=process.env.SKILLMETRY_HEALTHCHECK_TOKEN?.trim();
 if(!token||!tokenValid(request.headers.get("authorization"),token))
   return NextResponse.json({error:"Not available."},{status:404,headers:{"Cache-Control":"no-store"}});
 if(!hasSupabaseServerCredentials())
   return NextResponse.json({status:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});
 try{
   const {error}=await createAdminClient().from("careers").select("id").limit(1)
     .abortSignal(AbortSignal.timeout(3500));
   if(error)return NextResponse.json({status:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});
   return NextResponse.json({status:"ready"},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({status:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
