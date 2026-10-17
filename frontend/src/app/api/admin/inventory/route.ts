import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {editorialInventoryState} from "@skillmetry/shared/lib/editorial-inventory";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const specs=[
 {key:"guides",table:"admin_skill_guides",id:"skill_id",published:"published",revision:"published_revision"},
 {key:"roadmaps",table:"admin_career_roadmaps",id:"career_id",published:"published",revision:"published_revision"},
 {key:"courses",table:"admin_courses",id:"slug",published:"published",revision:"published_revision"},
 {key:"missions",table:"admin_missions",id:"id",published:"published",revision:"published_revision"},
 {key:"assessments",table:"admin_assessment_banks",id:"assessment_id",published:"published_version",revision:"published_version"}
] as const;
export async function GET(){
 const session=await adminSession();
 if(session.status!=="ready")return NextResponse.json({error:"Authorized editorial session required."},
   {status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers});
 const outcomes=await Promise.all(specs.map(async spec=>{
   const {data,error}=await session.admin.from(spec.table)
     .select([spec.id,"revision",spec.published,"updated_at"].join(","))
     .order("updated_at",{ascending:false}).range(0,250);
   if(error)return {key:spec.key,error:true};
   const allRows=(data??[]) as unknown as Record<string,unknown>[];
   const rows=allRows.slice(0,250);
   const latest=rows[0]?.updated_at;
   const states=rows.map(row=>editorialInventoryState(spec.key,row));
   return {key:spec.key,total:rows.length,published:states.filter(x=>x.published).length,
     drafts:states.filter(x=>x.needsReview).length,
     lastUpdated:typeof latest==="string"?latest:null,truncated:allRows.length>250};
 }));
 if(outcomes.some(x=>"error" in x))return NextResponse.json({
   error:"Editorial inventory is temporarily unavailable. No content was changed."
 },{status:503,headers});
 return NextResponse.json({role:session.role,inventory:outcomes,trust:"Counts and timestamps only; draft body, answer keys and student records are not returned."},{headers});
}
