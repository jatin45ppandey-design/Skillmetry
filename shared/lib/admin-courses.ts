import {z} from "zod";
import {skills} from "@skillmetry/shared/data/catalog";
export const courseSlugSchema=z.string().regex(/^[a-z][a-z0-9-]{3,49}$/);
const moduleId=z.string().regex(/^[a-z][a-z0-9-]{2,39}$/);
const externalUrl=z.string().max(750).refine(v=>{try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password&&!!u.hostname;}catch{return false;}},"Provide a safe HTTPS link");
export const courseLessonSchema=z.object({
 id:moduleId,title:z.string().trim().min(4).max(125),
 summary:z.string().trim().min(15).max(450),
 kind:z.enum(["video","reading","practice"]),
 url:externalUrl.optional(),
 notes:z.array(z.string().trim().min(8).max(500)).max(8),
 task:z.string().trim().min(15).max(550),
 estimatedMinutes:z.number().int().min(5).max(180)
}).strict().superRefine((lesson,ctx)=>{
 if(lesson.kind==="video"&&!lesson.url)ctx.addIssue({code:"custom",path:["url"],
   message:"Video lesson needs a publisher URL"});
});
export const coursePayloadSchema=z.object({
 title:z.string().trim().min(8).max(130),
 summary:z.string().trim().min(25).max(800),
 modules:z.array(z.object({
   id:moduleId,title:z.string().trim().min(5).max(120),
   lessons:z.array(courseLessonSchema).min(1).max(16)
 }).strict()).min(1).max(12)
}).strict().superRefine((data,ctx)=>{
 const ids=new Set<string>();
 for(const [i,module] of data.modules.entries()){
   if(ids.has(module.id))ctx.addIssue({code:"custom",path:["modules",i,"id"],message:"Duplicate module ID"});
   ids.add(module.id);
   const lessonIds=new Set<string>();
   for(const [j,lesson] of module.lessons.entries()){
     if(lessonIds.has(lesson.id))ctx.addIssue({code:"custom",path:["modules",i,"lessons",j,"id"],message:"Duplicate lesson ID"});
     lessonIds.add(lesson.id);
   }
 }
 const count=data.modules.reduce((sum,m)=>sum+m.lessons.length,0);
 if(count>50)ctx.addIssue({code:"custom",message:"Maximum 50 lessons per course"});
});
export const saveCourseSchema=z.object({
 slug:courseSlugSchema,skillId:z.string().min(2).max(48),
 expectedRevision:z.number().int().nonnegative(),publish:z.boolean().default(false),
 draft:coursePayloadSchema
}).strict().refine(v=>skills.some(s=>s.id===v.skillId),{message:"Unknown skill",path:["skillId"]});
export type CoursePayload=z.infer<typeof coursePayloadSchema>;
export type CourseRow={slug:string;skill_id:string;draft:CoursePayload|null;
 published:CoursePayload|null;revision:number;published_revision:number;
 updated_at:string|null;published_at:string|null};
export function startingCourse(skillLabel:string):CoursePayload{
 return {title:skillLabel+" Foundations Course",
 summary:"A beginner-friendly practical introduction with short lessons, clear explanations and a meaningful learning task.",
 modules:[{id:"getting-started",title:"Getting started",lessons:[{id:"introduction",
 title:"Introduction to "+skillLabel,summary:"Understand the most important foundations and their practical uses.",
 kind:"reading",notes:["Read the topic carefully and compare examples.","Try explaining the concept in your own words."],
 task:"Write a small worked example using the concept and explain how it works.",estimatedMinutes:20}]}]};
}
