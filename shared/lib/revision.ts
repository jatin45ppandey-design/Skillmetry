import { curriculumCatalog, curriculumSubtopicById, curriculumTopicById, getCurriculumLessonRoute } from "@skillmetry/shared/data/curriculum";
import type { AssessmentId } from "@skillmetry/shared/types/domain";
import type { CurriculumTopicId } from "@skillmetry/shared/types/curriculum";

export type RevisionEvidence = "needs-practice"|"developing"|"insufficient-evidence"|"practice-selected";

const diagnosticStage:Partial<Record<AssessmentId,Record<string,0|1|2>>>={
  "python-foundations":{types:0,operators:0,collections:1,functions:1,exceptions:2},
  "sql-foundations":{queries:0,joins:1,grouping:1,changes:2,nulls:2},
  "javascript-foundations":{scope:0,types:0,arrays:1,browser:1,async:2},
  "html-foundations":{semantics:0,document:0,content:0,forms:1,a11y:2}
};

const intervals:Record<RevisionEvidence,readonly number[]>={
  "needs-practice":[1,3,7],
  developing:[2,5,10],
  "insufficient-evidence":[1,4,8],
  "practice-selected":[1,4,9]
};

export function dateKeyInTimeZone(date:Date,timeZone="Asia/Kolkata"){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const value=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function buildSpacedRevisionDates(anchorDate:string,evidence:RevisionEvidence){
  const parsed=new Date(`${anchorDate}T00:00:00Z`);
  if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==anchorDate)throw new Error("Invalid revision anchor date");
  return intervals[evidence].map(days=>{
    const due=new Date(parsed);due.setUTCDate(due.getUTCDate()+days);
    return due.toISOString().slice(0,10);
  });
}

export function curriculumTopicForDiagnostic(assessmentId:AssessmentId,diagnosticTopicId:string){
  const stage=diagnosticStage[assessmentId]?.[diagnosticTopicId];
  if(stage===undefined)return null;
  const skillId=curriculumCatalog.practices.find(item=>item.kind==="assessment"&&item.assessmentId===assessmentId)?.skillId;
  const skill=curriculumCatalog.skills.find(item=>item.skillId===skillId);
  return skill?curriculumTopicById[skill.topicIds[stage]]??null:null;
}

export function revisionTopicContext(topicId:string){
  const topic=curriculumTopicById[topicId];
  if(!topic)return null;
  const subtopic=curriculumCatalog.subtopics.find(item=>item.topicId===topic.id);
  const lesson=subtopic?curriculumCatalog.lessons.find(item=>item.subtopicId===subtopic.id):undefined;
  const prerequisites=topic.prerequisiteTopicIds.flatMap(id=>{
    const prerequisite=curriculumTopicById[id];
    if(!prerequisite)return [];
    const prerequisiteSubtopic=curriculumCatalog.subtopics.find(item=>item.topicId===id);
    const prerequisiteLesson=prerequisiteSubtopic?curriculumCatalog.lessons.find(item=>item.subtopicId===prerequisiteSubtopic.id):undefined;
    return [{topicId:id,title:prerequisite.title,lessonHref:prerequisiteLesson?getCurriculumLessonRoute(prerequisiteLesson.id):null}];
  });
  return {
    topicId:topic.id as CurriculumTopicId,
    skillId:topic.skillIds[0],
    title:topic.title,
    difficulty:topic.difficulty,
    lessonHref:lesson?getCurriculumLessonRoute(lesson.id):null,
    practiceHref:`/practice?topic=${encodeURIComponent(topic.id)}`,
    resourceIds:[...new Set([...topic.primaryResourceIds,...topic.recommendedResourceIds])].slice(0,3),
    prerequisites
  };
}
