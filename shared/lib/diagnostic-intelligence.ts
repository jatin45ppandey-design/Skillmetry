import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import { getResourcesForSkill, getResourceAvailability } from "@skillmetry/shared/lib/resource-intelligence";
import type { AssessmentId } from "@skillmetry/shared/types/domain";

export type DiagnosticReview = {
  questionId:string; topicId:string; difficulty:"beginner"|"intermediate"|"advanced";
  selectedIndex:number; correctIndex:number; explanation:string; ordinal:number;
};
export type TopicDiagnosis = {
  id:string;label:string;correct:number;questions:number;percent:number|null;
  status:"insufficient-evidence"|"needs-practice"|"developing"|"strong";
};
export function buildTopicDiagnosis(assessmentId:AssessmentId,reviews:readonly DiagnosticReview[]):TopicDiagnosis[]{
  return diagnosticTopics[assessmentId].map(topic=>{
    const covered=reviews.filter(r=>r.topicId===topic.id);
    const count=covered.length;
    const correct=covered.filter(r=>r.selectedIndex===r.correctIndex).length;
    const percent=count?Math.round(100*correct/count):null;
    // At least three separately selected diagnostic items are needed before
    // showing a proficiency-oriented topic label; small samples stay unknown.
    const status=count<3?"insufficient-evidence":percent!<50?"needs-practice":percent!<75?"developing":"strong";
    return {id:topic.id,label:topic.label,correct,questions:count,percent,status};
  });
}
const keywords:Record<AssessmentId,Record<string,readonly string[]>>={
  "python-foundations":{types:["basics","variables"],collections:["collections","data structures"],functions:["functions","control flow"],exceptions:["errors","exceptions"],operators:["basics","operators"]},
  "sql-foundations":{queries:["query","select"],joins:["joins"],grouping:["aggregation","group","count"],changes:["update","schema"],nulls:["null","injection"]},
  "javascript-foundations":{scope:["scope","variables"],arrays:["arrays","array"],types:["type","coercion"],async:["promises","async"],browser:["browser","dom","json"]},
  "html-foundations":{semantics:["semantic","structure"],forms:["form"],a11y:["accessibility","aria"],document:["metadata","document"],content:["navigation","elements"]}
};
export function getTopicResources(assessmentId:AssessmentId,topicId:string,limit=3){
  const skillId=assessmentCatalog.find(item=>item.id===assessmentId)?.skillId;
  if(!skillId||!diagnosticTopics[assessmentId].some(topic=>topic.id===topicId))return [];
  const terms=keywords[assessmentId][topicId]??[];
  const ranked=getResourcesForSkill(skillId).filter(r=>getResourceAvailability(r).available)
    .map(resource=>{
      const body=[resource.title,resource.topic,...(resource.subtopics??[])].join(" ").toLowerCase();
      const relevance=terms.filter(term=>body.includes(term)).length;
      return {resource,relevance};
    }).sort((a,b)=>b.relevance-a.relevance||a.resource.id.localeCompare(b.resource.id));
  return ranked.slice(0,Math.max(0,Math.min(limit,3))).map(({resource,relevance})=>({
    id:resource.id,title:resource.title,url:resource.url,provider:resource.provider,
    relevance:relevance?"topic-match" as const:"skill-fallback" as const
  }));
}
export function recommendedWeakTopics(items:readonly TopicDiagnosis[]){
  return items.filter(x=>x.status==="needs-practice").sort((a,b)=>a.percent!-b.percent!).slice(0,3);
}
