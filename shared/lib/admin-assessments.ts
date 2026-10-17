import {z} from "zod";

/** Explicit allowlist; never derive the editing authority from browser flags. */
export const editableAssessments=[
 {id:"python-foundations",skillId:"python",title:"Python foundations"},
 {id:"sql-foundations",skillId:"sql",title:"SQL foundations"},
 {id:"javascript-foundations",skillId:"javascript",title:"JavaScript foundations"},
 {id:"html-foundations",skillId:"html",title:"HTML foundations"},
 {id:"css-foundations",skillId:"css",title:"CSS foundations"},
 {id:"typescript-foundations",skillId:"typescript",title:"TypeScript foundations"},
 {id:"react-foundations",skillId:"react",title:"React foundations"},
 {id:"node-foundations",skillId:"node",title:"Node.js foundations"},
 {id:"rest-api-foundations",skillId:"rest-api",title:"REST API foundations"}
] as const;
export const assessmentEditorIdSchema=z.enum([
 "python-foundations","sql-foundations","javascript-foundations","html-foundations",
 "css-foundations","typescript-foundations","react-foundations","node-foundations",
 "rest-api-foundations"
]);
export const authoredQuestionSchema=z.object({
 id:z.string().regex(/^aq-[a-z][a-z0-9-]{2,38}$/),
 prompt:z.string().trim().min(12).max(500),
 choices:z.tuple([
   z.string().trim().min(1).max(180),z.string().trim().min(1).max(180),
   z.string().trim().min(1).max(180),z.string().trim().min(1).max(180)
 ]),
 correctIndex:z.number().int().min(0).max(3),
 explanation:z.string().trim().min(16).max(750)
}).strict().superRefine((q,ctx)=>{
 const options=q.choices.map(s=>s.toLowerCase());
 if(new Set(options).size!==4)ctx.addIssue({code:"custom",path:["choices"],message:"Each answer option must differ"});
});
export const authoredBankSchema=z.object({
 questions:z.array(authoredQuestionSchema).min(1).max(10)
}).strict().superRefine((bank,ctx)=>{
 const ids=bank.questions.map(q=>q.id);
 if(new Set(ids).size!==ids.length)ctx.addIssue({code:"custom",path:["questions"],message:"Question IDs must be unique"});
});
export const saveAuthoredBankSchema=z.object({
 assessmentId:assessmentEditorIdSchema,
 expectedRevision:z.number().int().nonnegative(),
 publish:z.boolean().default(false),
 draft:authoredBankSchema
}).strict().superRefine((input,ctx)=>{
 if(input.publish&&input.draft.questions.length!==10)
   ctx.addIssue({code:"custom",path:["draft","questions"],message:"Publish exactly 10 questions"});
 if(input.publish&&input.draft.questions.some(q=>
   q.prompt.toLowerCase().includes("replace this draft question")||
   q.explanation.toLowerCase().includes("replace this explanation")
 ))
   ctx.addIssue({code:"custom",path:["draft","questions"],message:"Replace all draft placeholders before publishing"});
});
export const cmsAssessmentVersionSchema=z.string().regex(/^cms\.[1-9][0-9]{0,7}$/);
export type AuthoredBank=z.infer<typeof authoredBankSchema>;
export type AuthoredQuestion=z.infer<typeof authoredQuestionSchema>;
export type AdminBankRow={
 assessment_id:string;draft:AuthoredBank|null;revision:number;
 published_version:string|null;updated_at:string|null;published_at:string|null
};
export function initialAuthoredBank():AuthoredBank{
 return {questions:[{
  id:"aq-question-001",
  prompt:"Replace this draft question with an original assessment question.",
  choices:["First option","Second option","Third option","Fourth option"],
  correctIndex:0,
  explanation:"Replace this explanation with a clear reason for the correct answer."
 }]};
}
export function nextAuthoredQuestion(bank:AuthoredBank):AuthoredQuestion{
 let n=bank.questions.length+1,id="";
 do{id="aq-question-"+String(n).padStart(3,"0");n++;}while(bank.questions.some(q=>q.id===id));
 return {...initialAuthoredBank().questions[0],id};
}
