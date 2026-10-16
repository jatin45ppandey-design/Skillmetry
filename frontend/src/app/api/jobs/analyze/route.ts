import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { analyzeJobDescription } from "@skillmetry/shared/lib/job-intelligence";

export const runtime="nodejs";
const schema=z.object({description:z.string().trim().min(50).max(12000)}).strict();
export async function POST(request:Request){
  const body=schema.safeParse(await request.json().catch(()=>null));
  if(!body.success)return NextResponse.json({error:"Paste a job description between 50 and 12,000 characters."},{status:400});
  const auth=await authenticatedRequest();
  // Comparison is available without an account, but never substitutes the demo scores.
  const scores:Record<string,number>={};
  if(auth.status==="authenticated"){
    const {data,error}=await auth.supabase.from("assessment_attempts")
      .select("id,skill_id,score,completed_at").eq("user_id",auth.userId)
      .eq("grading_method","server_quiz").order("completed_at",{ascending:false})
      .order("id",{ascending:false}).limit(1000);
    if(error)return NextResponse.json({error:"Your trusted assessments could not be loaded."},{status:503});
    for(const row of data??[])if(!Object.hasOwn(scores,row.skill_id))scores[row.skill_id]=Number(row.score);
  }
  return NextResponse.json({...analyzeJobDescription(body.data.description,scores),
    mode:auth.status==="authenticated"?"private-assessment-comparison":"unassessed-reference-only",
    storage:"not-saved",notice:"Deterministic phrase matching, not AI or an ATS ranking. No hiring probability is computed."},
    {headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
