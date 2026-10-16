import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join,dirname} from "node:path";
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=p=>readFileSync(join(root,p),"utf8");
const fails=[];
function requireSource(path,terms){
 if(!existsSync(join(root,path))){fails.push(path+" missing");return;}
 const body=read(path);
 for(const term of terms)if(!body.includes(term))fails.push(path+" missing: "+term);
}
// This checks source and release gates. It is NOT authenticated browser E2E.
requireSource("frontend/next.config.ts",["X-Frame-Options","Referrer-Policy","Permissions-Policy","X-Content-Type-Options"]);
requireSource("frontend/src/app/robots.ts",["/passport/share/","/account","/api/"]);
requireSource("frontend/src/app/api/jobs/analyze/route.ts",["analyzeJobDescription","Cache-Control"]);
requireSource("frontend/src/app/api/ai/tutor/route.ts",["if(!useAI)","SKILLMETRY_AI_TUTOR_ENABLED","checkRequestLimit"]);
requireSource("frontend/src/app/api/passport/shares/route.ts",["shareSelectionSchema","randomBytes","revoke","revoked_at"]);
requireSource("frontend/src/app/passport/share/[token]/page.tsx",["notFound","revoked_at","expires_at"]);
requireSource("database/supabase/migrations/202610160005_passport_sharing.sql",["force row level security","token_hash","expires_at","revoked_at"]);
requireSource("docs/P7_P10_IMPLEMENTATION.md",["migration","staging","RLS","approval"]);
const env=read(".env.example");
for(const flag of ["SKILLMETRY_AI_TUTOR_ENABLED","SKILLMETRY_PASSPORT_SHARING_ENABLED","NEXT_PUBLIC_PASSPORT_SHARING_ENABLED"]){
 if(!env.includes(flag+"=false"))fails.push("Flag is not default-off: "+flag);
}
if(fails.length){console.error("Release static verification failed:\n"+fails.join("\n"));process.exitCode=1;}
else console.log("Static release/security gates verified. Browser/staging RLS/hosted release remain manual gates.");
