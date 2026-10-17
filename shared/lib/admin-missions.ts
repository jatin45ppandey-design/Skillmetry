import {z} from "zod";
import {careers,missions} from "@skillmetry/shared/data/catalog";

// CMS IDs are in a separate namespace from the existing curated mission IDs.
export const adminMissionIdSchema=z.string().regex(/^cms-[a-z][a-z0-9-]{2,55}$/);
const checklistItemSchema=z.string().trim().min(5).max(180);
export const adminMissionPayloadSchema=z.object({
  title:z.string().trim().min(8).max(130),
  description:z.string().trim().min(25).max(800),
  estimatedHours:z.number().int().min(1).max(80),
  deliverables:z.array(checklistItemSchema).min(1).max(12)
}).strict().superRefine((payload,ctx)=>{
  const normalized=payload.deliverables.map(item=>item.trim().toLocaleLowerCase("en"));
  if(new Set(normalized).size!==normalized.length){
    ctx.addIssue({code:"custom",path:["deliverables"],message:"Checklist entries must be unique"});
  }
});

export const saveAdminMissionSchema=z.object({
  id:adminMissionIdSchema,
  careerId:z.string().min(2).max(50),
  skillId:z.string().min(2).max(48),
  expectedRevision:z.number().int().nonnegative(),
  publish:z.boolean().default(false),
  draft:adminMissionPayloadSchema
}).strict().superRefine((input,ctx)=>{
  const career=careers.find(item=>item.id===input.careerId);
  if(!career)ctx.addIssue({code:"custom",path:["careerId"],message:"Unknown career"});
  if(career&&!career.skills.some(item=>item.skillId===input.skillId)){
    ctx.addIssue({code:"custom",path:["skillId"],message:"Skill must belong to selected career"});
  }
  if(missions.some(mission=>mission.id===input.id)){
    ctx.addIssue({code:"custom",path:["id"],message:"Curated mission IDs cannot be reused"});
  }
});
export type AdminMissionPayload=z.infer<typeof adminMissionPayloadSchema>;
export type AdminMissionSave=z.infer<typeof saveAdminMissionSchema>;
export type AdminMissionRow={
  id:string;career_id:string;skill_id:string;
  draft:AdminMissionPayload|null;published:AdminMissionPayload|null;
  revision:number;published_revision:number;
  updated_at:string|null;published_at:string|null
};
export type PublishedAdminMission={
  id:string;roleId:string;skillId:string;
  title:string;description:string;estimatedHours:number;
  deliverables:string[];
};
export function startingAdminMission(careerTitle:string):AdminMissionPayload{
  return {
    title:careerTitle+" practical project",
    description:"Build and document a working project that demonstrates the selected career skill through concrete deliverables.",
    estimatedHours:6,
    deliverables:["Working project implementation","README explaining how to run and test the project"]
  };
}

/** Published content only; never expose drafts or revisions through the learner API. */
export function toPublishedMission(input:unknown):PublishedAdminMission|null{
  const parsed=saveAdminMissionSchema.safeParse(input);
  if(!parsed.success||!parsed.data.publish)return null;
  const {id,careerId,skillId,draft}=parsed.data;
  return {id,roleId:careerId,skillId,...draft};
}
