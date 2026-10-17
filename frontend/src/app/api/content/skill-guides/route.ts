import {NextResponse} from "next/server";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {adminGuidePayloadSchema} from "@skillmetry/shared/lib/admin-content";
import {skills} from "@skillmetry/shared/data/catalog";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"public, max-age=0, must-revalidate","X-Content-Type-Options":"nosniff"};
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const skillId=params.get("skill");
 if(!skillId || !skills.some(s=>s.id===skillId)||params.getAll("skill").length!==1)
   return NextResponse.json({error:"Unknown skill."},{status:400,headers});
 // Safe fallback: original curated content remains available without an
 // approved admin migration or server configuration.
 if(process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true"||!hasSupabaseServerCredentials())
   return NextResponse.json({guide:null,source:"curated"},{headers});
 try{
   const {data,error}=await createAdminClient().from("admin_skill_guides")
     .select("published").eq("skill_id",skillId).maybeSingle();
   if(error)return NextResponse.json({guide:null,source:"curated"},{headers});
   const parsed=adminGuidePayloadSchema.safeParse(data?.published);
   return NextResponse.json({guide:parsed.success?parsed.data:null,
     source:parsed.success?"published":"curated"},{headers});
 }catch{return NextResponse.json({guide:null,source:"curated"},{headers});}
}
