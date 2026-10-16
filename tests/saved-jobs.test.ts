import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";import {fileURLToPath} from "node:url";
const src=readFileSync(fileURLToPath(new URL("../frontend/src/app/api/jobs/saved/route.ts",import.meta.url)),"utf8");
describe("P7 private saved requirement notes",()=>{
 it("saves canonical IDs but not full pasted role descriptions or client scores",()=>{
  expect(src).toContain("analyzeJobDescription(parsed.data.description,{})");
  expect(src).toContain("item.skillId");
  expect(src).not.toContain("description:parsed.data.description");
  expect(src).toContain("auth.userId");
 });
 it("scopes reads and deletions to the authenticated user",()=>{
  expect(src).toContain('.eq("user_id",auth.userId)');
  expect(src).toContain("checkRequestLimit");
  expect(src).toContain('Cache-Control":"private, no-store"');
 });
});
