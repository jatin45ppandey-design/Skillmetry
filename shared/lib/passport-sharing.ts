import {z} from "zod";
import {canonicalSkillIds} from "@skillmetry/shared/data/learning-catalog";
export const shareSelectionSchema=z.object({
 skillIds:z.array(z.enum(canonicalSkillIds)).min(1).max(8)
  .refine(ids=>new Set(ids).size===ids.length,"No duplicate skills."),
 consent:z.literal(true)
}).strict();
export const revokeSchema=z.object({id:z.string().uuid()}).strict();
export type SharedPassportSnapshot={
 name:string;career:string;issuedAt:string;
 skills:{id:string;label:string;score:number;assessmentVersion:string;completedAt:string}[];
 notice:string;
};
