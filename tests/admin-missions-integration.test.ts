import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {missions} from "@skillmetry/shared/data/catalog";
import {normalizeMissionWork} from "@skillmetry/shared/lib/mission-work";
const read=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");

describe("Admin mission publishing trust boundaries",()=>{
 const path="../database/supabase/migrations/202610170004_admin_missions.sql";
 it("uses atomic owner-scoped SQL publication and immutable published checklists",()=>{
   const migration=read(path);
   const adminRoute=read("../frontend/src/app/api/admin/missions/route.ts");
   expect(migration).toContain("security definer");
   expect(migration).toContain("published_checklist_immutable");
   expect(migration).toContain("revision_conflict");
   expect(migration).toContain("insert into public.missions");
   expect(migration).toContain("from public,anon,authenticated");
   expect(adminRoute).toContain("adminSession()");
   expect(adminRoute).toContain('session.role!=="owner"');
   expect(adminRoute).toContain("origin!==expected");
 });
 it("keeps learner feed published-only, without draft or revision content",()=>{
   const publishedRoute=read("../frontend/src/app/api/content/missions/route.ts");
   expect(publishedRoute).toContain('.select("id,career_id,skill_id,published,published_revision")');
   expect(publishedRoute).toContain('.not("published","is",null)');
   expect(publishedRoute).not.toContain('select("*")');
   expect(publishedRoute).toContain("SKILLMETRY_ADMIN_MISSIONS_ENABLED");
   const page=read("../frontend/src/app/(workspace)/missions/page.tsx");
   expect(page).toContain('/api/content/missions');
   expect(page).toContain("roleMissions");
 });
 it("does not alter existing static mission submission behavior",()=>{
   const mission=missions[0];
   const input={
     missionId:mission.id,status:"in_progress" as const,
     completedIndices:[0],repositoryUrl:"",demoUrl:"",notes:""
   };
   expect(normalizeMissionWork(input)).toMatchObject(input);
 });
 it("accepts only server-provided CMS checklist identity and no forged completion",()=>{
   const first={id:"cms-demo-task",deliverables:["Implementation","Documentation"]};
   const entry={
     missionId:first.id,status:"in_progress" as const,
     completedIndices:[0],repositoryUrl:"",demoUrl:"",notes:""
   };
   expect(()=>normalizeMissionWork(entry)).toThrow("Unknown curated mission");
   expect(normalizeMissionWork(entry,first).missionId).toBe(first.id);
   expect(()=>normalizeMissionWork({...entry,completedIndices:[3]},first)).toThrow();
   expect(()=>normalizeMissionWork({...entry,status:"submitted"},first)).toThrow();
 });
});
