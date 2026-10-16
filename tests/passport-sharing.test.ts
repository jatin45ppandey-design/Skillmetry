import {describe,expect,it} from "vitest";
import {shareSelectionSchema,revokeSchema} from "@skillmetry/shared/lib/passport-sharing";
import {readFileSync} from "node:fs";import {fileURLToPath} from "node:url";
const source=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");
describe("P9 private, revocable sharing",()=>{
 it("requires explicit consent, canonical selected skills and unique IDs",()=>{
  expect(shareSelectionSchema.safeParse({skillIds:["python"],consent:true}).success).toBe(true);
  expect(shareSelectionSchema.safeParse({skillIds:["python"],consent:false}).success).toBe(false);
  expect(shareSelectionSchema.safeParse({skillIds:["python","python"],consent:true}).success).toBe(false);
  expect(shareSelectionSchema.safeParse({skillIds:["invented"],consent:true}).success).toBe(false);
  expect(revokeSchema.safeParse({id:"bad"}).success).toBe(false);
 });
 it("stores a token hash and enables revocation/expiry without anonymous grants",()=>{
  const api=source("../frontend/src/app/api/passport/shares/route.ts");
  const sql=source("../database/supabase/migrations/202610160005_passport_sharing.sql");
  const publicRoute=source("../frontend/src/app/passport/share/[token]/page.tsx");
  expect(api).toContain('createHash("sha256")');
  expect(api).toContain('grading_method","server_quiz"');
  expect(api).toContain('SKILLMETRY_PASSPORT_SHARING_ENABLED');
  expect(sql).toContain("force row level security");
  expect(sql).toContain("grant update (revoked_at)");
  expect(sql).not.toContain("grant select,insert,update on public.passport_share_links to authenticated");
  expect(sql).toContain("revoked share links cannot be restored");
  expect(sql).toContain("passport share link metadata is immutable");
  expect(sql).toContain("from public,anon,authenticated");
  expect(publicRoute).toContain("notFound()");
  expect(publicRoute).toContain("data.revoked_at");
  expect(publicRoute).toContain("robots:{index:false,follow:false}");
 });
});
