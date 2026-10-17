import {z} from "zod";
import {careers,skillById} from "@skillmetry/shared/data/catalog";

export const editorialRoadmapPayloadSchema=z.object({
 headline:z.string().trim().min(8).max(120),
 introduction:z.string().trim().min(20).max(700),
 steps:z.array(z.object({
   skillId:z.string().min(2).max(48),
   explanation:z.string().trim().min(15).max(400),
   task:z.string().trim().min(15).max(450)
 }).strict()).min(1).max(20)
}).strict();
export const saveEditorialRoadmapSchema=z.object({
 careerId:z.string().min(2).max(64),
 draft:editorialRoadmapPayloadSchema,
 expectedRevision:z.number().int().nonnegative(),
 publish:z.boolean().default(false)
}).strict().superRefine((input,ctx)=>{
 const career=careers.find(c=>c.id===input.careerId);
 if(!career){ctx.addIssue({code:"custom",message:"Unknown career",path:["careerId"]});return;}
 const canonical=new Set(career.skills.map(s=>s.skillId));
 const stepIds=input.draft.steps.map(s=>s.skillId);
 if(stepIds.length!==canonical.size||new Set(stepIds).size!==canonical.size ||
   stepIds.some(id=>!canonical.has(id))){
   ctx.addIssue({code:"custom",message:"Roadmap must include each canonical career skill exactly once.",path:["draft","steps"]});
   return;
 }
 // Pedagogic sequence must respect existing prerequisite edges, when included.
 const seen=new Set<string>();
 for(const [i,id] of stepIds.entries()){
   for(const pre of skillById[id].prerequisites.filter(p=>canonical.has(p))){
     if(!seen.has(pre))ctx.addIssue({code:"custom",message:"Place prerequisite "+pre+" before "+id,
       path:["draft","steps",i,"skillId"]});
   }
   seen.add(id);
 }
});
export type EditorialRoadmapPayload=z.infer<typeof editorialRoadmapPayloadSchema>;
export type EditorialRoadmapRow={career_id:string;draft:EditorialRoadmapPayload|null;
 published:EditorialRoadmapPayload|null;revision:number;published_revision:number;
 updated_at:string|null;published_at:string|null};
export function defaultEditorialRoadmap(careerId:string):EditorialRoadmapPayload{
 const career=careers.find(c=>c.id===careerId)??careers[0];
 const ids=new Set(career.skills.map(s=>s.skillId));
 const ordered:string[]=[];
 function add(id:string){
   if(ordered.includes(id))return;
   for(const p of skillById[id].prerequisites)if(ids.has(p))add(p);
   ordered.push(id);
 }
 career.skills.forEach(s=>add(s.skillId));
 return {headline:career.title+" learning pathway",
 introduction:"A structured learning sequence designed to support real practice, with canonical prerequisites and trusted quiz evidence kept separate.",
 steps:ordered.map(id=>({skillId:id,
   explanation:"Learn the foundations of "+skillById[id].label+" and understand where it applies.",
   task:"Complete a small practical exercise using "+skillById[id].label+" and reflect on the result."}))};
}
