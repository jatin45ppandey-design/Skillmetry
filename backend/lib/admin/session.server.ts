import "server-only";
import {authenticatedRequest} from "@skillmetry/backend/lib/supabase/request-auth";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";

export type AdminRole="owner"|"editor"|"reviewer";
export async function adminSession(){
 if(process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true" || !hasSupabaseServerCredentials())
   return {status:"unavailable" as const};
 const auth=await authenticatedRequest();
 if(auth.status!=="authenticated")return {status:"unauthorized" as const};
 const admin=createAdminClient();
 const {data,error}=await admin.from("admin_members").select("role").eq("user_id",auth.userId).maybeSingle();
 if(error)return {status:"unavailable" as const};
 const role=data?.role;
 if(role!=="owner"&&role!=="editor"&&role!=="reviewer")
   return {status:"forbidden" as const};
 return {status:"ready" as const,role:role as AdminRole,userId:auth.userId,admin};
}
