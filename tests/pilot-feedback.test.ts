import {describe,expect,it} from "vitest";
import {pilotFeedbackSchema} from "@skillmetry/shared/lib/pilot-feedback";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const sql=readFileSync(fileURLToPath(new URL("../database/supabase/migrations/202610160005_pilot_feedback.sql",import.meta.url)),"utf8");
describe("voluntary student feedback privacy",()=>{
  it("bounds content and never accepts skill or identity modifications",()=>{
    const value={area:"projects",rating:4,comment:"A11y works"};
    expect(pilotFeedbackSchema.safeParse(value).success).toBe(true);
    expect(pilotFeedbackSchema.safeParse({...value,userId:"another",verified:true,score:100}).success).toBe(false);
    expect(pilotFeedbackSchema.safeParse({...value,comment:"x".repeat(1300)}).success).toBe(false);
  });
  it("uses forced owner-only RLS and server-controlled daily rate limits",()=>{
    expect(sql).toContain("force row level security");
    expect(sql).toContain("unique (user_id, feedback_day)");
    expect(sql).toContain("new.feedback_day :=");
    expect(sql).toContain("user_id = (select auth.uid())");
    expect(sql).not.toMatch(/grant\s+(?:delete|update|all)\s+on\s+public\.pilot_feedback\s+to\s+authenticated/i);
  });
});
