import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {describe,expect,it} from "vitest";
const read=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");
describe("P4–P6 cloud persistence trust boundaries",()=>{
  it("keeps activity scoped to the signed-in owner",()=>{
    const routes=["../frontend/src/app/api/learning/plan/route.ts",
      "../frontend/src/app/api/learning/missions/route.ts"];
    for(const path of routes){
      const content=read(path);
      expect(content).toContain("authenticatedRequest()");
      expect(content).toContain("auth.userId");
      expect(content).toContain("NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED");
      expect(content).not.toContain("NEXT_PUBLIC_SUPABASE_SECRET_KEY");
    }
  });
  it("stages owner-scoped tables with forced row-level security",()=>{
    const sql=read("../database/supabase/migrations/202610160004_learning_workflows.sql");
    for(const table of ["learning_plan_tasks","practice_lab_attempts","mission_work"]){
      expect(sql).toContain("create table if not exists public."+table);
      expect(sql).toContain("alter table public."+table+" force row level security");
    }
    expect(sql).toContain("for select to authenticated using (user_id=(select auth.uid()))");
    expect(sql).toContain("Unscored learning exercise activity only");
    expect(sql).toContain("no automated or human verification implied");
  });
});
