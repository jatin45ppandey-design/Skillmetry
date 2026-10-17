import {NextResponse} from "next/server";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {saveAdminMissionSchema} from "@skillmetry/shared/lib/admin-missions";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"public, max-age=0, must-revalidate","X-Content-Type-Options":"nosniff"};
export async function GET(){
 if(process.env.SKILLMETRY_ADMIN_MISSIONS_ENABLED!=="true"||
    process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true"||
    !hasSupabaseServerCredentials())
   return NextResponse.json({missions:[],source:"curated"},{headers});
 try{
   const {data,error}=await createAdminClient().from("admin_missions")
     .select("id,career_id,skill_id,published,published_revision")
     .not("published","is",null)
     .order("published_at",{ascending:false}).limit(80);
   if(error)return NextResponse.json({missions:[],source:"unavailable"},{status:503,headers});
   const missions=(data??[]).flatMap(row=>{
     const parsed=saveAdminMissionSchema.safeParse({
       id:row.id,careerId:row.career_id,skillId:row.skill_id,
       draft:row.published,expectedRevision:row.published_revision,publish:true
     });
     if(!parsed.success)return [];
     return [{id:parsed.data.id,roleId:parsed.data.careerId,skillId:parsed.data.skillId,
       ...parsed.data.draft}];
   });
   return NextResponse.json({missions,source:"published"},{headers});
 }catch{return NextResponse.json({missions:[],source:"unavailable"},{status:503,headers});}
}
