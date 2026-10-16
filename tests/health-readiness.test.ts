import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";import {fileURLToPath} from "node:url";
const src=readFileSync(fileURLToPath(new URL("../frontend/src/app/api/health/ready/route.ts",import.meta.url)),"utf8");
describe("P10 readiness probe",()=>{
 it("requires a server-only probe token and never exposes connection metadata",()=>{
  expect(src).toContain("SKILLMETRY_HEALTHCHECK_TOKEN");
  expect(src).toContain("timingSafeEqual");
  expect(src).toContain('error:"Not available."');
  expect(src).toContain('Cache-Control":"no-store"');
  expect(src).not.toContain("NEXT_PUBLIC_HEALTHCHECK_TOKEN");
 });
 it("fails closed when service-role connection is unavailable",()=>{
  expect(src).toContain("hasSupabaseServerCredentials()");
  expect(src).toContain("status:503");
  expect(src).toContain("AbortSignal.timeout(3500)");
 });
});
