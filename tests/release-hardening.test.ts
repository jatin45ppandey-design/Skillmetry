import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const read=(path:string)=>readFileSync(fileURLToPath(new URL("../"+path,import.meta.url)),"utf8");

describe("Release hardening: bounded data and authenticated mutations",()=>{
 it("orders private saved activity newest-first before truncating to a deterministic 500",()=>{
   const api=read("frontend/src/app/api/learning/course-progress/route.ts");
   expect(api).toContain('.order("completed_at",{ascending:false})');
   expect(api).toContain('.order("course_slug",{ascending:true})');
   expect(api).toContain('.order("lesson_id",{ascending:true}).limit(501)');
   expect(api).toContain("truncated:(data??[]).length>500");
   expect(api).toContain("progress:(data??[]).slice(0,500)");
   expect(api).toContain('eq("user_id",auth.userId)');
 });
 it("protects only authenticated stateful practice submissions with same-origin checks",()=>{
   const api=read("frontend/src/app/api/learning/lab/route.ts");
   expect(api).toContain("trustedSiteOrigin(request)?.origin");
   expect(api).toContain('request.headers.get("origin")');
   expect(api).toContain("Same-origin practice submission required.");
   expect(api).toContain('if(enabled&&auth.status==="authenticated")');
   expect(api).toContain('user_id:auth.userId');
 });
 it("uses stable paginated course catalogs and discloses search scope",()=>{
   const api=read("frontend/src/app/api/content/courses/route.ts");
   expect(api).toContain('params.getAll("page").length>1');
   expect(api).toContain('.order("slug",{ascending:true})');
   expect(api).toContain('.range(page*50,page*50+50)');
   expect(api).toContain("nextPage:rows.length>50?page+1:null");
   const client=read("frontend/src/app/(workspace)/courses/page.tsx");
   expect(client).toContain("loadMoreCourses");
   expect(client).toContain("Load more published courses");
   expect(client).toContain("Search and skill filters apply to loaded courses");
 });
 it("marks Admin metadata counts as capped, not complete",()=>{
   const api=read("frontend/src/app/api/admin/inventory/route.ts");
   expect(api).toContain(".range(0,250)");
   expect(api).toContain("truncated:allRows.length>250");
   const client=read("frontend/src/components/admin-content-inventory.tsx");
   expect(client).toContain('row.truncated?"shown":"total"');
   expect(client).toContain("counts exclude older content");
   expect(api).not.toContain("correct_index");
 });
});
