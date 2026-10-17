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
 const pageText=params.get("page")??"0";
 const page=/^(0|[1-9][0-9]{0,2})$/.test(pageText)?Number(pageText):NaN;
 if([...params.keys()].some(k=>!["skill","page"].includes(k))||params.getAll("skill").length>1 ||
   params.getAll("page").length>1||!Number.isSafeInteger(page)||page>99||
   (skill&&!skills.some(s=>s.id===skill)))return NextResponse.json({error:"Unknown skill."},{status:400,headers});
 if(process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true"||!hasSupabaseServerCredentials())
   return NextResponse.json({courses:[],source:"curated",nextPage:null},{headers});
 try{
   let query=createAdminClient().from("admin_courses")
     .select("slug,skill_id,published,published_revision").not("published","is",null)
     .order("updated_at",{ascending:false}).order("slug",{ascending:true})
     .range(page*50,page*50+50);
   if(skill)query=query.eq("skill_id",skill);
   const {data,error}=await query;
   if(error)return NextResponse.json({courses:[],source:"unavailable",nextPage:null},{status:503,headers});
   const rows=(data??[]);
   const courses=rows.slice(0,50).flatMap(row=>{
     const parsed=coursePayloadSchema.safeParse(row.published);
     if(!parsed.success)return [];
     return [{slug:row.slug,skillId:row.skill_id,
       version:row.published_revision,...parsed.data}];
   });
   return NextResponse.json({courses,source:"published",nextPage:rows.length>50?page+1:null},{headers});
 }catch{return NextResponse.json({courses:[],source:"unavailable"},{status:503,headers});}
}
