#!/usr/bin/env node
/**
 * Production configuration audit: never prints credentials, never changes
 * accounts, secrets, Supabase schema, billing or deployment state.
 * Use --mode=local for intentional anonymous demo builds.
 */
import { createClient } from "@supabase/supabase-js";
const checks = [];
const mode = (process.argv.find(a=>a.startsWith("--mode=")) ?? "--mode=production").slice(7);
const remote = process.argv.includes("--remote-readonly");
if (!["production","preview","local"].includes(mode)) {
  console.error("Unknown mode. Use production, preview or local.");
  process.exit(2);
}
function check(label,pass,explanation) {
  checks.push({label,pass:Boolean(pass),explanation});
}
const env = name=>(process.env[name]??"").trim();
const on = name=>env(name)==="true";
const elevated = env("SUPABASE_SECRET_KEY")||env("SUPABASE_SERVICE_ROLE_KEY");
const url = env("NEXT_PUBLIC_SUPABASE_URL");
const publish = env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")||env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const site = env("SKILLMETRY_SITE_URL");
const verifyUrl = (value,protocol) => {
  try { const u = new URL(value);return u.protocol===protocol && !u.username && !u.password
    && u.pathname==="/" && !u.search && !u.hash; } catch { return false; }
};
if (mode !== "local") {
  check("HTTPS Supabase URL",verifyUrl(url,"https:"),"Select the correct project endpoint.");
  check("Supabase publishable key configured",publish.length>=20&&!publish.startsWith("sb_secret_"),"Public key only.");
  check("Server-only Supabase credential configured",elevated.length>=20&&!elevated.startsWith("sb_publishable_"),"Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY privately.");
  check("Canonical HTTPS site URL",verifyUrl(site,"https:"),"Must match the Vercel production domain and Supabase auth allowlist.");
  check("Readiness monitor secret configured",env("SKILLMETRY_HEALTHCHECK_TOKEN").length>=24,"Use a random server-only healthcheck token.");
}
check("Paired passport flags",on("SKILLMETRY_PASSPORT_SHARING_ENABLED")===on("NEXT_PUBLIC_PASSPORT_SHARING_ENABLED"),
  "Both public+server flags must match.");
check("Paired streak flags",on("SKILLMETRY_STREAKS_ENABLED")===on("NEXT_PUBLIC_LEARNING_STREAK_ENABLED"),
  "Both public+server flags must match.");
check("External AI requires DB rate limits",!on("SKILLMETRY_AI_TUTOR_ENABLED") ||
  (on("SKILLMETRY_DB_RATE_LIMITING_ENABLED") && env("GEMINI_API_KEY").length>=16 && Boolean(elevated)),
  "Never enable paid AI without budget, provider key and database rate limits.");
check("No accidental public secrets",!env("NEXT_PUBLIC_SUPABASE_SECRET_KEY") && !env("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")
  && !env("NEXT_PUBLIC_GEMINI_API_KEY"),"Private tokens must remain server-only.");
check("No ambiguous elevated credential", !(env("SUPABASE_SECRET_KEY") && env("SUPABASE_SERVICE_ROLE_KEY")
  && env("SUPABASE_SECRET_KEY")!==env("SUPABASE_SERVICE_ROLE_KEY")),
  "Prefer one explicit elevated credential; remove stale alternate.");
// If --remote-readonly is enabled, perform bounded *read-only* queries only.
// Never invoke mutating RPCs or ask for auth test account credentials.
if(remote) {
  if(!url||!elevated||!publish || !verifyUrl(url,"https:")) {
    check("Remote read-only database audit",false,"Supabase configuration is missing or not HTTPS.");
  } else {
    const client=createClient(url,elevated,{auth:{persistSession:false,autoRefreshToken:false}});
    const tables=["careers","profiles","assessment_attempts"];
    if(on("SKILLMETRY_DB_RATE_LIMITING_ENABLED"))tables.push("api_burst_limit_windows");
    if(on("NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED")||on("SKILLMETRY_STREAKS_ENABLED"))
      tables.push("learning_plan_tasks","practice_lab_attempts","mission_work");
    if(on("SKILLMETRY_PASSPORT_SHARING_ENABLED"))tables.push("passport_share_links");
    for(const table of [...new Set(tables)]) {
      try {
        const {error}=await client.from(table).select("*",{head:true,count:"exact"}).limit(0)
          .abortSignal(AbortSignal.timeout(5000));
        check("Readable schema: "+table,!error,"Table must exist with expected Supabase grants and migration history.");
      }catch {check("Readable schema: "+table,false,"Read-only schema probe timed out or failed.");}
    }
  }
}
for(const c of checks) console.log((c.pass?"PASS":"FAIL")+" "+c.label+(c.pass?"":" — "+c.explanation));
const failures=checks.filter(c=>!c.pass);
console.log("Checked "+checks.length+" configuration invariants; "+failures.length+" failed.");
console.log("Not checked: hosted migration history, real auth deliverability, OAuth, browser E2E, monitoring, backup or live provider billing.");
if(failures.length)process.exitCode=1;
