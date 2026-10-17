import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {
 editableAssessments,authoredBankSchema,saveAuthoredBankSchema,
 initialAuthoredBank,nextAuthoredQuestion,cmsAssessmentVersionSchema
} from "@skillmetry/shared/lib/admin-assessments";
const read=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");
const first="javascript-foundations";
const ten=()=>{
 let draft=initialAuthoredBank();
 draft={questions:Array.from({length:10},(_,i)=>({
   id:"aq-unique-"+String(i+1).padStart(3,"0"),
   prompt:"Which option correctly answers this original question number "+(i+1)+"?",
   choices:["First choice","Second choice","Third choice","Fourth choice"] as [string,string,string,string],
   correctIndex:i%4,explanation:"The chosen answer is correct based on the explanation for this specific question."
 }))};
 return draft;
};
const save=(overrides:Record<string,unknown>={})=>({
 assessmentId:first,expectedRevision:0,publish:false,draft:ten(),...overrides
});
describe("Phase 5 Assessment Bank Editor",()=>{
 it("allows only nine known canonical assessment identities",()=>{
   expect(editableAssessments).toHaveLength(9);
   for(const item of editableAssessments){
     expect(saveAuthoredBankSchema.safeParse(save({assessmentId:item.id})).success).toBe(true);
   }
   expect(saveAuthoredBankSchema.safeParse(save({assessmentId:"cms-arbitrary",score:99})).success).toBe(false);
 });
 it("validates immutable IDs, four distinct choices, indexes and bounded text",()=>{
   expect(authoredBankSchema.safeParse(ten()).success).toBe(true);
   const bad=ten();bad.questions[0].choices[3]="First choice";
   expect(authoredBankSchema.safeParse(bad).success).toBe(false);
   const duplicate=ten();duplicate.questions[1].id=duplicate.questions[0].id;
   expect(authoredBankSchema.safeParse(duplicate).success).toBe(false);
   expect(authoredBankSchema.safeParse({questions:[{...ten().questions[0],correctIndex:4}]}).success).toBe(false);
   expect(authoredBankSchema.safeParse({questions:[{...ten().questions[0],score:100}]}).success).toBe(false);
 });
 it("allows partial drafts but requires exactly ten original questions to publish",()=>{
   expect(saveAuthoredBankSchema.safeParse(save({draft:initialAuthoredBank()})).success).toBe(true);
   expect(saveAuthoredBankSchema.safeParse(save({draft:initialAuthoredBank(),publish:true})).success).toBe(false);
   expect(saveAuthoredBankSchema.safeParse(save({publish:true})).success).toBe(true);
   expect(cmsAssessmentVersionSchema.safeParse("cms.2").success).toBe(true);
   expect(cmsAssessmentVersionSchema.safeParse("2026.2").success).toBe(false);
   const bank=initialAuthoredBank();bank.questions.push(nextAuthoredQuestion(bank));
   expect(bank.questions[1].id).not.toBe(bank.questions[0].id);
 });
 it("keeps answer keys in server-only snapshot and never includes them in student routes",()=>{
   const start=read("../frontend/src/app/api/assessments/start/route.ts");
   const submit=read("../frontend/src/app/api/assessments/submit/route.ts");
   const resolver=read("../backend/lib/assessments/admin-bank.server.ts");
   const route=read("../frontend/src/app/api/admin/assessments/route.ts");
   const migration=read("../database/supabase/migrations/202610170005_admin_assessment_banks.sql");
   expect(start).toContain("resolveStartingAssessment(assessmentId)");
   expect(submit).toContain("resolveAssessmentForSession(assessmentId,session.assessment_version)");
   expect(resolver).toContain('import "server-only"');
   expect(resolver).toContain(".select(\"snapshot\")");
   expect(route).toContain("adminSession()");
   expect(route).toContain('session.role!=="owner"');
   expect(route).toContain("origin!==trusted");
   expect(migration).toContain("force row level security");
   expect(migration).toContain("admin_assessment_versions");
   expect(migration).toContain("revision_conflict");
   expect(migration).toContain("from public,anon,authenticated");
   expect(read("../frontend/src/components/admin-studio-workspace.tsx")).toContain("Assessment Bank");
   expect(read("../frontend/src/components/admin-assessment-editor.tsx")).toContain("beforeunload");
 });
});
