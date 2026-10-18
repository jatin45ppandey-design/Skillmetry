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
      const escaped=item.replace(/[.*+?^$()|[\]\\]/g,"\\$&");
      return new RegExp("(^|[^a-z0-9])"+escaped+"(?=$|[^a-z0-9])","i").test(text);
    });
    return term?[{skillId,term}]:[];
  });
}

/**
 * Surface requirements explicitly named after common job-description cues when
 * the phrase does not map to a curated skill. This is deliberately conservative:
 * it reports text for human review rather than inventing a canonical skill or score.
 */
export function findUnknownRequirements(description:string):string[]{
  const cues=/(?:experience with|proficient in|proficiency in|knowledge of|familiar with|hands-on with|working knowledge of|strong understanding of|understanding of|skills in|ability to use|must know|experience using|experience in)\s+([^.;\n]{2,100})/gi;
  const knownTerms=Object.values(aliases).flat().map(term=>term.toLowerCase());
  const ignored=new Set(["the role","the position","a related field","software development","computer science","a team"]);
  const candidates:string[]=[];
  for(const match of description.normalize("NFKC").matchAll(cues)){
    const phrase=match[1].replace(/\s+(?:is required|are required|is preferred|are preferred|preferred|required)$/i,"").trim();
    for(const part of phrase.split(/\s*,\s*|\s+and\s+|\s+or\s+/i)){
      const candidate=part.replace(/^[\s:–—-]+|[\s:–—-]+$/g,"")
        .replace(/^(?:(?:and|or)\s+|(?:strong|solid|good|basic|advanced|expert)\s+)/i,"").trim();
      if(candidate.length<2||candidate.length>60||ignored.has(candidate.toLowerCase()))continue;
      const normalized=candidate.toLowerCase();
      const containsKnown=knownTerms.some(term=>{
        const escaped=term.replace(/[.*+?^$()|[\]\\]/g,"\\$&");
        return new RegExp("(^|[^a-z0-9])"+escaped+"(?=$|[^a-z0-9])","i").test(normalized);
      });
      if(!containsKnown)candidates.push(candidate);
    }
  }
  return [...new Set(candidates.map(item=>item.replace(/\s+/g," ").trim()))].slice(0,20);
}

export function analyzeJobDescription(description:string,scores:Readonly<SkillMap>):JobAnalysis {
  const found=findCanonicalRequirements(description);
  const requirements=found.map(({skillId,term})=>{
    const score=Object.hasOwn(scores,skillId)?scores[skillId]:null;
    return {skillId,label:skillById[skillId].label,matchedTerm:term,
      evidence:score===null?"not-assessed" as const:"measured" as const,score,
      nextStep:score===null?"assessment" as const:score<75?"learning" as const:"practice" as const};
  });
  const unknownRequirements=findUnknownRequirements(description);
  const matchingCareers=careers.map(career=>({id:career.id,title:career.title,
    matchedSkillCount:requirements.filter(item=>career.skills.some(skill=>skill.skillId===item.skillId)).length}))
    .sort((a,b)=>b.matchedSkillCount-a.matchedSkillCount||a.title.localeCompare(b.title));
  return {requirements,unknownRequirements,
    matches:requirements.length,unassessed:requirements.filter(x=>x.evidence==="not-assessed").length,
    summary:requirements.length
      ? (unknownRequirements.length
        ? "Recognized canonical skill mentions only. Unmatched requirements are listed separately for human review; no fit score is inferred."
        : "Recognized canonical skill mentions only. Experience levels and broader context still need human review.")
      : (unknownRequirements.length
        ? "No canonical skills were recognized. Possible unmatched requirements are listed for human review; no score has been estimated."
        : "No canonical skill requirements recognized. Review the job description manually; no score has been estimated."),
    matchingCareers};
}
