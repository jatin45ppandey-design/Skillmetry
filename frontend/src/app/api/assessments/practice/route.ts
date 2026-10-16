import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { assessmentIdSchema } from "@skillmetry/backend/lib/assessments/schema";
import { getPracticeQuestions } from "@skillmetry/backend/lib/assessments/practice-bank.server";

const requestSchema=z.object({
  assessmentId:assessmentIdSchema,
  topicId:z.string().min(1).max(64),
  answers:z.record(z.string().min(1).max(100),z.number().int().min(0).max(3))
}).strict();

export async function GET(request:NextRequest) {
  const parsed=assessmentIdSchema.safeParse(request.nextUrl.searchParams.get("assessment"));
  const topicId=request.nextUrl.searchParams.get("topic")??"";
  if(!parsed.success||topicId.length>64)return NextResponse.json({error:"Unknown learning topic."},{status:400});
  const questions=getPracticeQuestions(parsed.data,topicId);
  if(!questions.length)return NextResponse.json({error:"Practice is not available for this topic."},{status:404});
  return NextResponse.json({
    assessmentId:parsed.data,topicId,
    questions:questions.map(({id,prompt,choices})=>({id,prompt,choices})),
    trust:"Practice only. These answers do not create or change trusted assessment scores."
  },{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:Request){
  const parsed=requestSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid practice answers."},{status:400});
  const questions=getPracticeQuestions(parsed.data.assessmentId,parsed.data.topicId);
  if(!questions.length)return NextResponse.json({error:"Invalid learning topic."},{status:404});
  const keys=Object.keys(parsed.data.answers);
  if(keys.length!==questions.length||keys.some(id=>!questions.some(q=>q.id===id))){
    return NextResponse.json({error:"Answer every practice question once."},{status:400});
  }
  return NextResponse.json({
    correctCount:questions.filter(q=>parsed.data.answers[q.id]===q.correctIndex).length,
    totalQuestions:questions.length,
    review:questions.map(q=>({
      id:q.id,prompt:q.prompt,selectedIndex:parsed.data.answers[q.id],correctIndex:q.correctIndex,
      choices:q.choices,explanation:q.explanation
    })),
    trust:"Unscored practice. No trusted skill profile or assessment history was changed."
  },{headers:{"Cache-Control":"private, no-store"}});
}
