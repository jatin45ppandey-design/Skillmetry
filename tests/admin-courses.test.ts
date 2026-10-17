import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {skills} from "@skillmetry/shared/data/catalog";
import {coursePayloadSchema,saveCourseSchema,startingCourse} from "@skillmetry/shared/lib/admin-courses";
const read=(p:string)=>readFileSync(fileURLToPath(new URL(p,import.meta.url)),"utf8");
describe("Courses, modules and published learning",()=>{
 it("generates valid course draft for all 18 skills",()=>{
  for(const skill of skills){
    const draft=startingCourse(skill.label);
    expect(saveCourseSchema.safeParse({slug:"course-"+skill.id,skillId:skill.id,
      expectedRevision:0,publish:false,draft}).success,skill.id).toBe(true);
  }
 });
 it("rejects insecure videos, duplicate lesson IDs and malformed courses",()=>{
   const draft=startingCourse("JavaScript");
   const modified=structuredClone(draft);
   modified.modules[0].lessons[0].kind="video";
   modified.modules[0].lessons[0].url="javascript:alert(1)";
   expect(coursePayloadSchema.safeParse(modified).success).toBe(false);
   modified.modules[0].lessons[0].url="https://www.youtube.com/watch?v=Zi-Q0t4gMC8";
   expect(coursePayloadSchema.safeParse(modified).success).toBe(true);
   modified.modules[0].lessons.push({...modified.modules[0].lessons[0]});
   expect(coursePayloadSchema.safeParse(modified).success).toBe(false);
   expect(saveCourseSchema.safeParse({slug:"../danger",skillId:"javascript",
     expectedRevision:0,draft}).success).toBe(false);
 });
 it("keeps all writes owner-scoped and same-origin",()=>{
   const migration=read("../database/supabase/migrations/202610170003_admin_courses.sql");
   const api=read("../frontend/src/app/api/admin/courses/route.ts");
   expect(migration).toContain("security definer");
   expect(migration).toContain("revision_conflict");
   expect(migration).toContain("from public,anon,authenticated");
   expect(api).toContain("adminSession()");
   expect(api).toContain('session.role!=="owner"');
   expect(api).toContain("origin!==expected");
 });
 it("keeps student lesson catalog published-only",()=>{
   const api=read("../frontend/src/app/api/content/courses/route.ts");
   const page=read("../frontend/src/app/(workspace)/courses/page.tsx");
   const admin=read("../frontend/src/components/admin-course-editor.tsx");
   expect(api).toContain('.select("slug,skill_id,published,published_revision")');
   expect(api).not.toContain('select("*")');
   expect(page).toContain("verified quiz scores");
   expect(admin).toContain("Publish course");
 });
});
