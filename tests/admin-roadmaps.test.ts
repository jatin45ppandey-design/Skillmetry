import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {careers} from "@skillmetry/shared/data/catalog";
import {defaultEditorialRoadmap,saveEditorialRoadmapSchema} from "@skillmetry/shared/lib/admin-roadmaps";
const read=(p:string)=>readFileSync(fileURLToPath(new URL(p,import.meta.url)),"utf8");

describe("Admin roadmap editor contracts",()=>{
 it("validates full canonical prerequisites for every career",()=>{
   for(const career of careers){
     const input={careerId:career.id,draft:defaultEditorialRoadmap(career.id),expectedRevision:0,publish:false};
     const result=saveEditorialRoadmapSchema.safeParse(input);
     expect(result.success,career.id).toBe(true);
   }
 });
 it("rejects duplicate, missing and out-of-order prerequisite skills",()=>{
   const example={careerId:"frontend-developer",draft:defaultEditorialRoadmap("frontend-developer"),
     expectedRevision:0,publish:false};
   expect(saveEditorialRoadmapSchema.safeParse({...example,
     draft:{...example.draft,steps:example.draft.steps.slice(1)}}).success).toBe(false);
   expect(saveEditorialRoadmapSchema.safeParse({...example,
     draft:{...example.draft,steps:[example.draft.steps[0],...example.draft.steps.slice(0,-1)]}}).success).toBe(false);
   const steps=[...example.draft.steps];steps.reverse();
   expect(saveEditorialRoadmapSchema.safeParse({...example,draft:{...example.draft,steps}}).success).toBe(false);
 });
 it("blocks client access to draft, audit and editor SQL functions",()=>{
   const migration=read("../database/supabase/migrations/202610170002_admin_roadmaps.sql");
   expect(migration).toContain("security definer");
   expect(migration).toContain("revision_conflict");
   expect(migration).toContain("public.career_skills");
   expect(migration).toContain("from public,anon,authenticated");
   const api=read("../frontend/src/app/api/admin/roadmaps/route.ts");
   expect(api).toContain('session.role!=="owner"');
   expect(api).toContain("origin!==expected");
   expect(api).toContain("saveEditorialRoadmapSchema");
 });
 it("serves only published roadmap and keeps skill graph unchanged",()=>{
   const student=read("../frontend/src/app/api/content/career-roadmaps/route.ts");
   const page=read("../frontend/src/app/(workspace)/roadmap/page.tsx");
   const panel=read("../frontend/src/components/published-career-study-sequence.tsx");
   expect(student).toContain('.select("published")');
   expect(student).not.toContain('.select("*")');
   expect(page).toContain("PublishedCareerStudySequence");
   expect(page).toContain("RoadmapGraph");
   expect(panel).toContain("Editorial learning sequence only");
   expect(panel).not.toContain("setScores");
 });
});
