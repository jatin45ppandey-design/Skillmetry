import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { assessmentIdSchema } from "@skillmetry/backend/lib/assessments/schema";
import { getPracticeQuestions } from "@skillmetry/backend/lib/assessments/practice-bank.server";
import { listTopicPracticeQuestions, publicTopicPracticeQuestions } from "@skillmetry/backend/lib/learning/topic-practice-bank.server";
import { curriculumCatalog, curriculumSubtopicById, curriculumTopicById, getCurriculumLessonRoute } from "@skillmetry/shared/data/curriculum";

const answersSchema=z.record(z.string().min(1).max(160),z.number().int().min(0).max(3));
const diagnosticRequestSchema=z.object({
  assessmentId:assessmentIdSchema,
  topicId:z.string().min(1).max(64),
  answers:answersSchema
}).strict();
const curriculumRequestSchema=z.object({
  topicId:z.string().min(1).max(120),
  answers:answersSchema
}).strict();
const requestSchema=z.union([diagnosticRequestSchema,curriculumRequestSchema]);

function topicContext(topicId:string){
  const topic=curriculumTopicById[topicId];
  if(!topic)return null;
  const subtopic=curriculumCatalog.subtopics.find(item=>item.topicId===topic.id);
  const lesson=subtopic?curriculumCatalog.lessons.find(item=>item.subtopicId===subtopic.id):undefined;
  const skill=curriculumCatalog.skills.find(item=>item.skillId===topic.skillIds[0]);
  const topicIndex=skill?.topicIds.indexOf(topic.id)??-1;
  const nextTopicId=skill&&topicIndex>=0?skill.topicIds[topicIndex+1]??null:null;
  return {topic,lesson,lessonHref:lesson?getCurriculumLessonRoute(lesson.id):null,nextTopicId};
}

export async function GET(request:NextRequest) {
  const curriculumTopicId=request.nextUrl.searchParams.get("topic")??"";
  const context=topicContext(curriculumTopicId);
  if(context){
    return NextResponse.json({
      mode:"curriculum",topicId:context.topic.id,topicTitle:context.topic.title,
      skillId:context.topic.skillIds[0],difficulty:context.topic.difficulty,
      lessonHref:context.lessonHref,nextTopicId:context.nextTopicId,
      questions:publicTopicPracticeQuestions(context.topic.id),
      trust:"Guided topic practice only. No answer changes a trusted assessment score."
    },{headers:{"Cache-Control":"private, no-store"}});
  }
  const parsed=assessmentIdSchema.safeParse(request.nextUrl.searchParams.get("assessment"));
  const topicId=request.nextUrl.searchParams.get("diagnosticTopic")??request.nextUrl.searchParams.get("topic")??"";
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
  const questions="assessmentId" in parsed.data
    ?getPracticeQuestions(parsed.data.assessmentId,parsed.data.topicId)
    :listTopicPracticeQuestions(parsed.data.topicId);
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
      choices:q.choices,explanation:q.explanation,
      ...("difficulty" in q?{difficulty:q.difficulty}:{})
    })),
    trust:"Unscored practice. No trusted skill profile or assessment history was changed."
  },{headers:{"Cache-Control":"private, no-store"}});
}
