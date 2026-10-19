import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const read=(path:string)=>readFileSync(fileURLToPath(new URL("../"+path,import.meta.url)),"utf8");

describe("Product roadmap staged source contracts",()=>{
 it("does not misrepresent course activities as verified skill scores",()=>{
   const course=read("frontend/src/app/(workspace)/courses/page.tsx");
   expect(course).toContain("saved activity");
   expect(course).toContain("Mark lesson studied");
   expect(course).toContain("Practice this skill");
   expect(course).toContain("/assessments?assessment=");
   expect(course).toContain("Lesson completion tracking is staged");
   expect(course).toContain("do not automatically change verified quiz scores");
 });
 it("requires logged-in owner and current published course revision for lesson updates",()=>{
   const endpoint=read("frontend/src/app/api/learning/course-progress/route.ts");
   for(const value of ["authenticatedRequest","SKILLMETRY_COURSE_PROGRESS_ENABLED",
     "trustedSiteOrigin","z.boolean()","coursePayloadSchema.safeParse",
     "p.publishedRevision","p.lessonId","auth.userId","published course",
     'status:409','status:403',"Cache-Control","private, no-store"]){
       expect(endpoint,value).toContain(value);
     }
   expect(endpoint).toContain(".eq(\"user_id\",auth.userId)");
   expect(endpoint).not.toContain("assessment_attempts");
   expect(endpoint).not.toContain(".upsert(");
 });
 it("stages immutable owner/lesson progress with forced RLS and restricted updates",()=>{
   const sql=read("database/supabase/migrations/202610180001_course_lesson_progress_staged.sql");
   expect(sql).toContain("force row level security");
   expect(sql).toContain("auth.uid()");
   expect(sql).toContain("grant select,insert,update(completed,completed_at,updated_at,published_revision)");
   expect(sql).not.toMatch(/(?:insert\\s+into|update|delete\\s+from)\\s+public\\.assessment_attempts/i);
   expect(sql).toContain("STAGED ONLY");
 });
 it("prefers live next learning action for signed-in accounts, with honest fallback",()=>{
   const home=read("frontend/src/app/(workspace)/dashboard/page.tsx");
   expect(home).toContain("/api/learning/overview");
   expect(home).toContain('cloudNextStatus === "ready"');
   expect(home).toContain("Live overview unavailable");
   expect(home).not.toContain("Simulated assessment score");
 });
 it("keeps admin inventory metadata-only and restricted to editorial sessions",()=>{
   const api=read("frontend/src/app/api/admin/inventory/route.ts");
   for(const s of ['adminSession','status!=="ready"',"admin_assessment_banks",
     "published_version","answer keys and student records are not returned."]){
      expect(api).toContain(s);
   }
   expect(api).not.toContain("correct_index");
   expect(api).not.toContain("question_bank");
   const workspace=read("frontend/src/components/admin-studio-workspace.tsx");
   expect(workspace).toContain('mode==="inventory"');
   expect(workspace).toContain("AdminContentInventory");
   expect(workspace).toContain("guideDirty");
   expect(workspace).toContain("assessmentDirty");
 });
 it("collects no product study answers over network and requires explicit export choice",()=>{
   const feedback=read("frontend/src/app/(workspace)/feedback/page.tsx");
   expect(feedback).toContain("URL.createObjectURL");
   expect(feedback).toContain("setConsent");
   expect(feedback).toContain("Download my feedback");
   expect(feedback).toContain("NO BACKGROUND COLLECTION");
   expect(feedback).not.toContain('fetch(');
   expect(feedback).not.toContain("localStorage");
   expect(feedback).not.toContain('navigator.sendBeacon');
 });
 it("keeps responsive and reduced motion states for new product surfaces",()=>{
   const css=read("frontend/src/app/product-phases-1-5.css");
   const layout=read("frontend/src/app/layout.tsx");
   expect(layout).toContain('import "./product-phases-1-5.css"');
   expect(css).toContain("prefers-reduced-motion:reduce");
   expect(css).toContain("max-width:460px");
   expect(css).toContain(".sx-admin-inventory");
 });
});
