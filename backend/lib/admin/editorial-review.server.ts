import "server-only";
import {createHash} from "node:crypto";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";

export const editorialTargets={
 guides:{table:"admin_skill_guides",id:"skill_id"},
 roadmaps:{table:"admin_career_roadmaps",id:"career_id"},
 courses:{table:"admin_courses",id:"slug"},
 missions:{table:"admin_missions",id:"id"},
 assessments:{table:"admin_assessment_banks",id:"assessment_id"}
} as const;
export type EditorialModule=keyof typeof editorialTargets;
export const approvalEnabled=()=>process.env.SKILLMETRY_EDITORIAL_APPROVAL_ENABLED==="true";

// Sort object keys (including nested arrays) before hashing to avoid JSONB key-order differences.
function canonical(value:unknown):unknown{
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==="object"){
   return Object.fromEntries(Object.entries(value as Record<string,unknown>)
     .sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>[k,canonical(v)]));
 }
 return value;
}
export function editorialDigest(value:unknown){
 return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}
export async function approvedPublication(
 admin:ReturnType<typeof createAdminClient>,
 module:EditorialModule,contentId:string,revision:number,draft:unknown
):Promise<{ok:boolean;reason?:string}>{
 if(!approvalEnabled())return {ok:true};
 if(!Number.isInteger(revision)||revision<1)return {ok:false,reason:"Save a draft before requesting approval."};
 const {data,error}=await admin.from("admin_editorial_reviews")
  .select("draft_digest,status").eq("module",module).eq("content_id",contentId)
  .eq("requested_revision",revision).maybeSingle();
 if(error)return {ok:false,reason:"Editorial approval service is unavailable. Publication was not attempted."};
 if(!data||data.status!=="approved")return {ok:false,reason:"A reviewer must approve this exact saved revision before publication."};
 if(data.draft_digest!==editorialDigest(draft))return {
   ok:false,reason:"The submitted content differs from the reviewer-approved draft. Save and request approval again."
 };
 return {ok:true};
}
