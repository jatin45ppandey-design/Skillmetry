import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),"utf8");
describe("deployment configuration preflight",()=>{
  const run=(extras:Record<string,string>={},args:string[]=[])=>{
    try{
      const stdout=execFileSync(process.execPath,["scripts/release-preflight.mjs",...args],{
        cwd:root,env:{PATH:process.env.PATH??"",HOME:process.env.HOME??"",
          NEXT_PUBLIC_SUPABASE_URL:"https://project.supabase.co",
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_this_is_a_test_key_only",
          SUPABASE_SECRET_KEY:"sb_secret_this_is_a_test_secret_only",
          SKILLMETRY_SITE_URL:"https://skillmetry.example",
          SKILLMETRY_HEALTHCHECK_TOKEN:"test-example-long-random-string-12345678",
          ...extras},encoding:"utf8",stdio:["ignore","pipe","pipe"]
      });return{passed:true,stdout};
    }catch(error){const e=error as {stdout?:Buffer|string};return{passed:false,stdout:e.stdout?.toString()??""};}
  };
  it("does not reveal secrets and accepts separate disabled providers",()=>{
    const x=run();expect(x.passed).toBe(true);
    expect(x.stdout).not.toContain("sb_secret_this_is_a_test");
    expect(x.stdout).toContain("Checked");
  });
  it("blocks HTTPS downgrade and asymmetric streak flags",()=>{
    const x=run({SKILLMETRY_SITE_URL:"http://skillmetry.example",
      SKILLMETRY_STREAKS_ENABLED:"true",NEXT_PUBLIC_LEARNING_STREAK_ENABLED:"false"});
    expect(x.passed).toBe(false);expect(x.stdout).toContain("FAIL Canonical HTTPS site URL");
    expect(x.stdout).toContain("FAIL Paired streak flags");
  });
  it("refuses external AI without controlled database limit and provider key",()=>{
    const x=run({SKILLMETRY_AI_TUTOR_ENABLED:"true",SKILLMETRY_DB_RATE_LIMITING_ENABLED:"false"});
    expect(x.passed).toBe(false);expect(x.stdout).toContain("FAIL External AI requires DB rate limits");
  });
  it("requires no production credentials for intentional local preview",()=>{
    const x=run({NEXT_PUBLIC_SUPABASE_URL:"",SUPABASE_SECRET_KEY:"",NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"",
      SKILLMETRY_SITE_URL:"",SKILLMETRY_HEALTHCHECK_TOKEN:""},["--mode=local"]);
    expect(x.passed).toBe(true);
  });
  it("stages Next.js Vercel root at frontend with full monorepo workspaces",()=>{
    const json=JSON.parse(read("../frontend/vercel.json"));
    expect(json.framework).toBe("nextjs");
    const doc=read("../docs/VERCEL_DEPLOYMENT.md");
    expect(doc).toContain("Root Directory: `frontend`");
    const ci=read("../.github/workflows/database-integration.yml");
    expect(ci).toContain("Authenticated two-user API E2E");
  });
});
