/**
 * Opt-in local launcher for the already-authorized Skillmetry Admin Studio.
 *
 * This script never writes .env.local, creates a Supabase project, migrates a
 * database, or enables feature flags in a hosted environment.
 */
import {spawn} from "node:child_process";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const frontendDirectory=fileURLToPath(new URL("../frontend/",import.meta.url));
const require=createRequire(import.meta.url);
const requireNext=createRequire(require.resolve("next/package.json"));
const {loadEnvConfig}=requireNext("@next/env");

// Mirror Next.js development env-file precedence, including existing .env.local.
// No credentials or complete environment dumps are ever logged.
loadEnvConfig(frontendDirectory,true);

const expectedOrigin="https://qepaepqrhgrejzarqlrd.supabase.co";
let configuredOrigin;
try{
  configuredOrigin=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL??"").origin;
}catch{
  configuredOrigin=null;
}
if(configuredOrigin!==expectedOrigin){
  console.error("[Skillmetry] Admin launcher stopped: your local Supabase URL does not match the existing authorized Skillmetry project.");
  console.error("[Skillmetry] Check NEXT_PUBLIC_SUPABASE_URL in frontend/.env.local. No environment files were modified.");
  process.exitCode=1;
}else{
  const credentialsPresent=Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )&&Boolean(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY);
  if(!credentialsPresent){
    console.error("[Skillmetry] Existing Supabase publishable/server credentials are missing. Reuse the existing local configuration.");
    process.exitCode=1;
  }else if(process.argv.includes("--check")){
    console.log("[Skillmetry] Authorized Skillmetry Free project identified. Local admin launcher is ready; nothing was changed.");
  }else{
    const nextCommand=require.resolve("next/dist/bin/next");
    const flags={
      SKILLMETRY_ADMIN_STUDIO_ENABLED:"true",
      SKILLMETRY_ADMIN_MISSIONS_ENABLED:"true",
      SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED:"true"
    };
    console.log("[Skillmetry] Starting Next.js DEVELOPMENT server with Admin Studio enabled for the existing verified-owner account.");
    console.log("[Skillmetry] Hosted flags, OAuth configuration, secret files and Supabase schema are unchanged.");
    const child=spawn(process.execPath,[nextCommand,"dev",...process.argv.slice(2)],{
      cwd:frontendDirectory,
      env:{...process.env,...flags},
      stdio:"inherit"
    });
    child.on("error",error=>{
      console.error("[Skillmetry] Could not start Next.js:",error.message);
      process.exitCode=1;
    });
    child.on("exit",(code,signal)=>{
      process.exitCode=code??(signal?1:0);
    });
    if(process.platform!=="win32"){
      process.on("SIGTERM",()=>child.kill("SIGTERM"));
      process.on("SIGINT",()=>child.kill("SIGINT"));
    }
  }
}
