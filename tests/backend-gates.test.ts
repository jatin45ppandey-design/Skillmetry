import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

describe("Backend-only writes and staged migration invariants", () => {
  it("leaves generated task identifiers immutable from the Data API", () => {
    const sql = read("../database/supabase/migrations/202610160004_learning_workflows.sql");
    const api = read("../frontend/src/app/api/learning/plan/route.ts");
    expect(sql).toContain("grant select, update (status, planned_date, updated_at)");
    expect(sql).toContain("grant select,insert,update on public.learning_plan_tasks to service_role");
    expect(api).toContain('createAdminClient().from("learning_plan_tasks").upsert');
    expect(api).toContain("auth.userId");
    expect(sql).toContain("planned_date between substring(task_key from 1 for 10)::date");
  });
  it("enforces server-side mission submissions even for the mission owner", () => {
    const sql = read("../database/supabase/migrations/202610160004_learning_workflows.sql");
    const api = read("../frontend/src/app/api/learning/missions/route.ts");
    expect(sql).toContain("grant select on public.mission_work to authenticated");
    expect(sql).not.toContain("grant select,insert,update on public.mission_work to authenticated");
    expect(api).toContain("normalizeMissionWork");
    expect(api).toContain('createAdminClient().from("mission_work").upsert');
    expect(api).toContain("hasSupabaseServerCredentials()");
  });
  it("prevents a repeat of the malformed SQL trigger-delimiter defect", () => {
    const sql = read("../database/supabase/migrations/202610160005_passport_sharing.sql");
    expect(sql).toContain("returns trigger language plpgsql set search_path='' as $passport$");
    expect(sql).not.toMatch(/\bend;\s*\$\s*;/);
  });
});
