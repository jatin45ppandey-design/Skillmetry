import {skillById} from "@skillmetry/shared/data/catalog";
import {getResourcesForSkill,getResourceAvailability} from "@skillmetry/shared/lib/resource-intelligence";
import type {SkillId} from "@skillmetry/shared/types/domain";

export type TutorResource={id:string;title:string;provider:string;url:string};
export function buildTutorContext(skillId:SkillId) {
  const skill=skillById[skillId];
  if(!skill)throw new Error("Unknown skill");
  const resources=getResourcesForSkill(skillId)
    .filter(item=>getResourceAvailability(item).available)
    .slice(0,3).map(item=>({id:item.id,title:item.title,provider:item.provider,url:item.url}));
  return {skillId,skillLabel:skill.label,description:skill.description,
    prerequisiteLabels:skill.prerequisites.map(id=>skillById[id]?.label??id),resources};
}
export function localTutorGuidance(skillId:SkillId,question:string){
  const context=buildTutorContext(skillId);
  return {mode:"curated" as const,
    answer:`For ${context.skillLabel}, start with ${context.description.toLowerCase()} Focus on one concept in your question: "${question.slice(0,90)}". Then work through a curated reference and try a small practice task. This is a guided resource suggestion, not an AI-generated explanation.`,
    resources:context.resources,
    disclaimer:"Curated guidance only. No model was called; learning activity does not alter assessment scores."};
}
