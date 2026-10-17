import {describe,expect,it} from "vitest";
import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const script=fileURLToPath(new URL("../scripts/dev-admin.mjs",import.meta.url));
function run(url:string, secret:string="test-secret-value"){
  return spawnSync(process.execPath,[script,"--check"],{
    cwd:root,
    encoding:"utf8",
    env:{
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL:url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"test-public-value",
      SUPABASE_SECRET_KEY:secret
    }
  });
}
describe("Skillmetry safe local Admin Studio launcher",()=>{
 it("refuses other hosted projects and does not reveal credentials",()=>{
   const result=run("https://unrelated.supabase.co");
   expect(result.status).toBe(1);
   expect(result.stderr).toContain("does not match the existing authorized Skillmetry project");
   expect(result.stderr+result.stdout).not.toContain("test-secret-value");
 });
 it("checks existing Skillmetry configuration without starting a server or altering files",()=>{
   const result=run("https://qepaepqrhgrejzarqlrd.supabase.co");
   expect(result.status).toBe(0);
   expect(result.stdout).toContain("Local admin launcher is ready");
   expect(result.stdout+result.stderr).not.toContain("test-secret-value");
 });
 it("starts only Next.js dev with opt-in admin flags, never hosted or production tooling",()=>{
   const code=readFileSync(script,"utf8");
   expect(code).toContain('loadEnvConfig(frontendDirectory,true)');
   expect(code).toContain('SKILLMETRY_ADMIN_STUDIO_ENABLED:"true"');
   expect(code).toContain('SKILLMETRY_ADMIN_MISSIONS_ENABLED:"true"');
   expect(code).toContain('SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED:"true"');
   expect(code).toContain('[nextCommand,"dev"');
   expect(code).not.toMatch(/writeFile|apply_migration|db push|create_project/);
 });
});
