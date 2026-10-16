import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {describe,expect,it} from "vitest";
const read=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");
describe("P10 production hardening contracts",()=>{
 it("adds baseline browser security headers and anti-indexing for private share URLs",()=>{
  const next=read("../frontend/next.config.ts");
  const robots=read("../frontend/src/app/robots.ts");
  expect(next).toContain("X-Frame-Options");
  expect(next).toContain("no-referrer");
  expect(next).toContain("Permissions-Policy");
  expect(robots).toContain("/passport/share/");
  expect(robots).toContain("/account");
 });
 it("keeps privileged features disabled until staging approval",()=>{
  const env=read("../.env.example");
  for(const feature of ["SKILLMETRY_AI_TUTOR_ENABLED","SKILLMETRY_PASSPORT_SHARING_ENABLED",
    "NEXT_PUBLIC_PASSPORT_SHARING_ENABLED"])expect(env).toContain(feature+"=false");
 });
});
