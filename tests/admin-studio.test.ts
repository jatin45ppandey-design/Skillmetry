import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {adminGuidePayloadSchema,saveAdminGuideSchema} from "@skillmetry/shared/lib/admin-content";
import {skillLearningGuides} from "@skillmetry/shared/data/skill-learning-guides";
import {skills} from "@skillmetry/shared/data/catalog";
const read=(p:string)=>readFileSync(fileURLToPath(new URL(p,import.meta.url)),"utf8");

describe("Admin Studio editorial contracts",()=>{
 it("makes all 18 curated guides editable without missing required fields",()=>{
   for(const skill of skills){
     const g=skillLearningGuides[skill.id];
     const result=adminGuidePayloadSchema.safeParse({documentation:g.documentation,
       lecture:g.lecture,notes:[...g.notes],challenge:g.challenge});
     expect(result.success,skill.id).toBe(true);
   }
 });
 it("rejects injected URLs, insecure links and unknown payload fields",()=>{
   const g=skillLearningGuides.javascript;
   const draft={documentation:g.documentation,lecture:g.lecture,
     notes:[...g.notes],challenge:g.challenge};
   expect(adminGuidePayloadSchema.safeParse({...draft,
     lecture:{...draft.lecture,url:"javascript:alert(1)"}}).success).toBe(false);
   expect(adminGuidePayloadSchema.safeParse({...draft,
     documentation:{...draft.documentation,url:"http://example.com"}}).success).toBe(false);
   expect(adminGuidePayloadSchema.safeParse({...draft,role:"owner"}).success).toBe(false);
   expect(saveAdminGuideSchema.safeParse({skillId:"javascript",
     expectedRevision:-1,publish:true,draft}).success).toBe(false);
 });
 it("protects edits with membership, server role and CSRF origin checks",()=>{
   const sql=read("../database/supabase/migrations/202610170001_admin_learning_guides.sql");
   const auth=read("../backend/lib/admin/session.server.ts");
   const route=read("../frontend/src/app/api/admin/guides/route.ts");
   expect(sql).toContain("security definer");
   expect(sql).toContain("p_publish and v_role <> 'owner'");
   expect(sql).toContain("from public,anon,authenticated");
   expect(auth).toContain(".from(\"admin_members\")");
   expect(auth).toContain("SKILLMETRY_ADMIN_STUDIO_ENABLED");
   expect(route).toContain('session.role!=="owner"');
   expect(route).toContain("origin!==expected");
   expect(route).toContain("trustedSiteOrigin(request)");
 });
 it("only serves published content and preserves curated fallback",()=>{
   const route=read("../frontend/src/app/api/content/skill-guides/route.ts");
   const hub=read("../frontend/src/components/focused-learning-hub.tsx");
   expect(route).toContain('.select("published")');
   expect(route).not.toContain('.select("*")');
   expect(route).toContain('source:"curated"');
   expect(hub).toContain("publishedOverride?.skillId===baseGuide.skillId");
 });
});
