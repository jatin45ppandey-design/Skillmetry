import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { skills } from "@skillmetry/shared/data/catalog";
const sql=readFileSync(fileURLToPath(new URL("../database/supabase/migrations/202610160006_expand_assessment_rpc_catalog.sql",import.meta.url)),"utf8");
describe("C02 additive assessment RPC schema compatibility",()=>{
  it("supports each of the 18 canonical skills using explicit ID to skill mapping",()=>{
    for(const skill of skills){
      expect(sql).toContain("when '"+(skill.id==="ml-foundations"?"ml-foundations-foundations":skill.id+"-foundations")+"' then '"+skill.id+"'");
    }
  });
  it("retains atomic owner checks and no unreviewed answer-key data",()=>{
    expect(sql).toContain("start_or_resume_assessment_session");
    expect(sql).toContain("complete_assessment_session");
    expect(sql).toContain("p_user_id");
    expect(sql).not.toContain("correctIndex");
    expect(sql).toContain("security invoker");
    expect(sql).toContain("for update");
  });
});
