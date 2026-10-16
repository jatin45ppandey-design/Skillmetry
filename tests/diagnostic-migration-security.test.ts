import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe,expect,it } from "vitest";
const migration=readFileSync(fileURLToPath(new URL("../database/supabase/migrations/202610160001_phase_d_diagnostics.sql",import.meta.url)),"utf8");
const policy=readFileSync(fileURLToPath(new URL("../database/supabase/tests/diagnostics_rls.test.sql",import.meta.url)),"utf8");
describe("D2 diagnostic security boundaries",()=>{
  it("enforces owner-scoped read-only evidence and service-role completion",()=>{
    expect(migration).toContain("force row level security");
    expect(migration).toContain("grant select on public.assessment_question_reviews to authenticated");
    expect(migration).not.toMatch(/grant\s+(?:insert|update|delete)[^;]+to\s+authenticated/i);
    expect(migration).toContain("revoke execute on function public.complete_diagnostic_assessment_session");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("public.complete_assessment_session(");
  });
  it("covers tampering, replay, and cross-user privacy in pgTAP",()=>{
    expect(policy).toContain("student cannot forge question-level trusted evidence");
    expect(policy).toContain("a completed diagnostic cannot be replayed");
    expect(policy).toContain("Bob cannot see Alice private question review");
    expect(policy).toContain("failed diagnostic transactions do not leave attempts");
  });
});
