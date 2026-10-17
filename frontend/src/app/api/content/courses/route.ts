import {NextResponse} from "next/server";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {coursePayloadSchema} from "@skillmetry/shared/lib/admin-courses";
import {skills} from "@skillmetry/shared/data/catalog";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"public, max-age=0, must-revalidate","X-Content-Type-Options":"nosniff"};
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const skill=params.get("skill");
 if([...params.keys()].some(k=>k!=="skill")||params.getAll("skill").length>1 ||
   (skill&&!skills.some(s=>s.id===skill)))return NextResponse.json({error:"Unknown skill."},{status:400,headers});
 if(process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true"||!hasSupabaseServerCredentials())
   return NextResponse.json({courses:[],source:"curated"},{headers});
 try{
   let query=createAdminClient().from("admin_courses")
     .select("slug,skill_id,published,published_revision").not("published","is",null)
     .order("updated_at",{ascending:false}).limit(50);
   if(skill)query=query.eq("skill_id",skill);
   const {data,error}=await query;
   if(error)return NextResponse.json({courses:[],source:"unavailable"},{status:503,headers});
   const courses=(data??[]).flatMap(row=>{
     const parsed=coursePayloadSchema.safeParse(row.published);
     if(!parsed.success)return [];
     return [{slug:row.slug,skillId:row.skill_id,
       version:row.published_revision,...parsed.data}];
   });
   return NextResponse.json({courses,source:"published"},{headers});
 }catch{return NextResponse.json({courses:[],source:"unavailable"},{status:503,headers});}
}
