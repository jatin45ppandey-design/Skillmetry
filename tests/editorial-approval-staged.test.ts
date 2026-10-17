import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const read=(path:string)=>readFileSync(fileURLToPath(new URL("../"+path,import.meta.url)),"utf8");

describe("Staged editorial approval security and access contracts",()=>{
 it("keeps editorial approval disabled until explicit server opt-in",()=>{
   const gate=read("backend/lib/admin/editorial-review.server.ts");
   expect(gate).toContain('process.env.SKILLMETRY_EDITORIAL_APPROVAL_ENABLED==="true"');
   expect(gate).toContain('if(!approvalEnabled())return {ok:true}');
   expect(gate).toContain('data.status!=="approved"');
   expect(gate).toContain("draft_digest!==editorialDigest(draft)");
   expect(gate).toContain("revision<1");
 });
 it("binds approvals to canonical saved content rather than content IDs alone",()=>{
   const helper=read("backend/lib/admin/editorial-review.server.ts");
   for(const marker of ['createHash("sha256")','Object.entries','requested_revision',
     '"admin_editorial_reviews"','editorialDigest(draft)',"Save a draft before requesting approval"]){
       expect(helper).toContain(marker);
   }
 });
 it("review request requires real saved revision, same origin and editor role",()=>{
   const route=read("frontend/src/app/api/admin/reviews/route.ts");
   for(const marker of ["adminSession","trustedSiteOrigin","sameOrigin(request)",
       'session.role==="reviewer"','row.revision!==p.revision',
       'draft_digest:editorialDigest(row.draft)','status:409']){
     expect(route).toContain(marker);
   }
 });
 it("review decision is independent, current revision only and cannot self-approve",()=>{
   const route=read("frontend/src/app/api/admin/reviews/route.ts");
   for(const marker of ['session.role!=="reviewer"','pending.requested_by===session.userId',
       'row.revision!==pending.requested_revision','.eq("status","pending")',
       '"changes_requested"'])expect(route).toContain(marker);
   expect(route).not.toContain("answer_key");
 });
 it("prevents publication before approved exact revision on all five editors",()=>{
   for(const path of ["guides","roadmaps","courses","missions","assessments"]){
     const api=read("frontend/src/app/api/admin/"+path+"/route.ts");
     expect(api,path).toContain("approvedPublication(session.admin");
     expect(api,path).toContain("data.expectedRevision");
     expect(api,path).toContain("if(!approval.ok)");
   }
 });
 it("keeps review metadata server-role-only with forced row security",()=>{
   const sql=read("database/supabase/migrations/202610180002_admin_editorial_reviews_staged.sql");
   expect(sql).toContain("force row level security");
   expect(sql).toContain("revoke all on public.admin_editorial_reviews from public, anon, authenticated;");
   expect(sql).toContain("grant select,insert,update on public.admin_editorial_reviews to service_role");
   expect(sql).not.toContain("assessment_attempts");
 });
 it("renders editor requests and role-conditional queue without bypassing existing unsaved guards",()=>{
   const ui=read("frontend/src/components/admin-editorial-reviews.tsx");
   expect(ui).toContain("role!==\"reviewer\"");
   expect(ui).toContain("Save changes before review");
   expect(ui).toContain("Approve revision");
   expect(ui).toContain("Request changes");
   for(const module of ["guide","roadmap","course","mission","assessment"]){
     const editor=read("frontend/src/components/admin-"+module+"-editor.tsx");
     expect(editor).toContain("<AdminReviewRequest");
     expect(editor).toContain('changed={changed}');
   }
   const workspace=read("frontend/src/components/admin-studio-workspace.tsx");
   expect(workspace).toContain("guideDirty");
   expect(workspace).toContain("assessmentDirty");
 });
});
