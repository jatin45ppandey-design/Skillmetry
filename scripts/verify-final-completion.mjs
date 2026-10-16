#!/usr/bin/env node
// Strict diagnostic signal: coverage and source existence only. No production access or secrets.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root = process.cwd();
function read(path) { return readFileSync(resolve(root,path), "utf8"); }
const source=read("shared/data/catalog.ts");
const listed=read("shared/data/assessment-catalog.ts");
const skills=[...source.matchAll(/\{\s*id:\s*"([a-z0-9-]+)",\s*label:\s*"/g)].map(m=>m[1]);
const assessed=[...listed.matchAll(/\bid:\s*"([a-z0-9-]+)",\s*\n\s*skillId:\s*"([a-z0-9-]+)"/g)].map(m=>({id:m[1],skill:m[2]}));
const active=new Set(assessed.map(x=>x.skill));
const missing=skills.filter(x=>!active.has(x));
const duplicate=assessed.length!==new Set(assessed.map(x=>x.id)).size;
const required=[
  "docs/FINAL_COMPLETION_CONTRACT.md",
  "frontend/src/app/api/auth/password-reset/request/route.ts",
  "frontend/src/app/api/auth/password-reset/update/route.ts",
  "frontend/src/app/api/ai/jobs/route.ts",
  "frontend/src/app/api/ai/missions/route.ts",
  "frontend/src/app/api/passport/share/route.ts",
  "frontend/src/app/api/missions/submissions/route.ts",
  "frontend/src/app/api/github/repository/route.ts",
  "database/supabase/migrations/202610160001_phase_d_diagnostics.sql",
  "database/supabase/migrations/202610160002_mission_submissions.sql",
  "database/supabase/migrations/202610160003_ai_usage_daily.sql",
  "database/supabase/migrations/202610160004_private_passport_sharing.sql",
  "database/supabase/migrations/202610160005_pilot_feedback.sql"
];
const absent=required.filter(f=>!existsSync(resolve(root,f)));
console.log("Skillmetry — final closure source precheck");
console.log("Canonical skills:",skills.length,"| Assessable:",active.size,"| Missing:",missing.length);
console.log("Missing assessments:",missing.length?missing.join(", "):"none");
console.log("Required source paths absent:",absent.length?absent.join(", "):"none");
console.log("Duplicate assessment IDs:",duplicate?"YES":"no");
console.log("IMPORTANT: passed source precheck alone never certifies hosted staging, educator review or full product release.");
if(skills.length!==18||active.size!==18||missing.length||duplicate||absent.length){
  console.error("NOT COMPLETE — Do not claim Skillmetry's original journey is finished.");
  process.exitCode=1;
}else{
  console.log("Source structure precheck passed. Complete all C01-C08 acceptance gates before launch.");
}