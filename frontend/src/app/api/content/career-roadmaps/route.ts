import {NextResponse} from "next/server";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {careers} from "@skillmetry/shared/data/catalog";
import {editorialRoadmapPayloadSchema,saveEditorialRoadmapSchema} from "@skillmetry/shared/lib/admin-roadmaps";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"public, max-age=0, must-revalidate","X-Content-Type-Options":"nosniff"};
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const careerId=params.get("career");
 if(!careerId||params.getAll("career").length!==1||[...params.keys()].some(k=>k!=="career")
   ||!careers.some(c=>c.id===careerId))return NextResponse.json({error:"Unknown career."},{status:400,headers});
 if(process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true"||!hasSupabaseServerCredentials())
   return NextResponse.json({roadmap:null,source:"curated"},{headers});
 try{
   const {data,error}=await createAdminClient().from("admin_career_roadmaps")
     .select("published").eq("career_id",careerId).maybeSingle();
   if(error)return NextResponse.json({roadmap:null,source:"curated"},{headers});
   const parsed=editorialRoadmapPayloadSchema.safeParse(data?.published);
   if(!parsed.success)return NextResponse.json({roadmap:null,source:"curated"},{headers});
   const valid=saveEditorialRoadmapSchema.safeParse({careerId,draft:parsed.data,expectedRevision:0,publish:false});
   return NextResponse.json({roadmap:valid.success?parsed.data:null,
     source:valid.success?"published":"curated"},{headers});
 }catch{return NextResponse.json({roadmap:null,source:"curated"},{headers});}
}
