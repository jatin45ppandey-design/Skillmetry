import { careers, skillById } from "@skillmetry/shared/data/catalog";
import type { CareerId, SkillMap } from "@skillmetry/shared/types/domain";

/** Explicit curated aliases, no model inference or unsourced skill scores. */
const aliases: Readonly<Record<string, readonly string[]>> = {
 python:["python","python3"], sql:["sql","postgresql","mysql","sql server"],
 math:["statistics","probability","linear algebra"],"data-processing":["data cleaning","data processing","pandas","etl"],
 "ml-foundations":["machine learning","scikit-learn","supervised learning"],
 "model-evaluation":["model evaluation","precision and recall","cross validation"],
 "rest-api":["rest apis","rest api","restful","http api","api development"],
 docker:["docker","containerization"],deployment:["deployment","ci/cd","continuous deployment"],
 html:["html","semantic html"],css:["css","responsive css","flexbox","css grid"],
 javascript:["javascript","ecmascript"],typescript:["typescript"],
 react:["react","reactjs","react.js"],accessibility:["accessibility","wcag","aria labels"],
 testing:["unit testing","integration testing","vitest","jest","testing"],
 node:["node.js","nodejs","node js","express.js"],
 authentication:["authentication","authorization","oauth","jwt","access control"]
};
export type Requirement = {skillId:string;label:string;matchedTerm:string;
  evidence:"not-assessed"|"measured";score:number|null;nextStep:"assessment"|"learning"|"practice"};
export type JobAnalysis = {requirements:Requirement[];unknownRequirements:string[];
  matches:number;unassessed:number;summary:string;matchingCareers:{id:CareerId;title:string;matchedSkillCount:number}[]};

/** Boundary-safe matching prevents e.g. 'sql' matching 'nosql'. */
export function findCanonicalRequirements(description:string):{skillId:string;term:string}[]{
  const text=description.normalize("NFKC").toLowerCase();
  return Object.entries(aliases).flatMap(([skillId,terms])=>{
    const term=terms.find(item=>{
      const escaped=item.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      return new RegExp("(^|[^a-z0-9])"+escaped+"(?=$|[^a-z0-9])","i").test(text);
    });
    return term?[{skillId,term}]:[];
  });
}
export function analyzeJobDescription(description:string,scores:Readonly<SkillMap>):JobAnalysis {
  const found=findCanonicalRequirements(description);
  const requirements=found.map(({skillId,term})=>{
    const score=Object.hasOwn(scores,skillId)?scores[skillId]:null;
    return {skillId,label:skillById[skillId].label,matchedTerm:term,
      evidence:score===null?"not-assessed" as const:"measured" as const,score,
      nextStep:score===null?"assessment" as const:score<75?"learning" as const:"practice" as const};
  });
  const matchingCareers=careers.map(career=>({id:career.id,title:career.title,
    matchedSkillCount:requirements.filter(item=>career.skills.some(skill=>skill.skillId===item.skillId)).length}))
    .sort((a,b)=>b.matchedSkillCount-a.matchedSkillCount||a.title.localeCompare(b.title));
  return {requirements,unknownRequirements:[],
    matches:requirements.length,unassessed:requirements.filter(x=>x.evidence==="not-assessed").length,
    summary:requirements.length
      ? "Recognized canonical skill mentions only. Unrecognized requirements and experience levels still need human review."
      : "No canonical skill requirements recognized. Review the job description manually; no score has been estimated.",
    matchingCareers};
}
