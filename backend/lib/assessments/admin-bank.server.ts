import "server-only";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import {getAssessmentDefinition} from "@skillmetry/backend/lib/assessments/question-bank.server";
import {authoredBankSchema,cmsAssessmentVersionSchema} from "@skillmetry/shared/lib/admin-assessments";
import type {AssessmentId} from "@skillmetry/shared/types/domain";

type Definition=ReturnType<typeof getAssessmentDefinition>;

/** Never send this definition to the browser: includes every correct answer. */
function trustedSnapshot(id:AssessmentId,version:string,raw:unknown):Definition{
 const parsed=authoredBankSchema.safeParse(raw);
 if(!parsed.success||parsed.data.questions.length!==10)throw new Error("Invalid published assessment bank");
 const original=getAssessmentDefinition(id,"2026.2");
 return {id,version,skillId:original.skillId,title:original.title,questions:parsed.data.questions};
}

/** New sessions select latest published CMS version; old static bank is the fallback. */
export async function resolveStartingAssessment(id:AssessmentId):Promise<Definition>{
 if(process.env.SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED!=="true"||
    process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED!=="true")return getAssessmentDefinition(id);
 if(!hasSupabaseServerCredentials())throw new Error("Assessment content database unavailable");
 const admin=createAdminClient();
 const {data:bank,error}=await admin.from("admin_assessment_banks")
   .select("published_version").eq("assessment_id",id).maybeSingle();
 if(error)throw new Error("Published assessment lookup unavailable");
 if(!bank?.published_version)return getAssessmentDefinition(id);
 return resolveAssessmentForSession(id,String(bank.published_version));
}

/** Always resolve the original version for an existing session, even after a flag rollback. */
export async function resolveAssessmentForSession(id:AssessmentId,version:string):Promise<Definition>{
 if(!cmsAssessmentVersionSchema.safeParse(version).success)
   return getAssessmentDefinition(id,version);
 if(!hasSupabaseServerCredentials())throw new Error("Assessment version database unavailable");
 const {data,error}=await createAdminClient().from("admin_assessment_versions")
   .select("snapshot").eq("assessment_id",id).eq("version",version).maybeSingle();
 if(error||!data)throw new Error("Assessment version unavailable");
 return trustedSnapshot(id,version,data.snapshot);
}
