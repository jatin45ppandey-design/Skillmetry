import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("P1 staged atomic API request throttling", () => {
  it("denies anonymous invocation of the service-role-only database function", () => {
    const sql = read("../database/supabase/migrations/202610160003_api_burst_limits.sql");
    expect(sql).toContain("on conflict (key_hash, window_started_at)");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("force row level security");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
  });
  it("fails closed only when the staged limiter is explicitly enabled", () => {
    const code = read("../backend/lib/security/request-rate-limit.server.ts");
    expect(code).toContain('SKILLMETRY_DB_RATE_LIMITING_ENABLED !== "true"');
    expect(code).toContain('return "unavailable"');
    expect(code).toContain('createHash("sha256")');
  });
  it("protects auth and assessment workflows without client-side credentials", () => {
    for (const endpoint of ["start", "submit"]) {
      const code = read("../frontend/src/app/api/assessments/" + endpoint + "/route.ts");
      expect(code).toContain("checkRequestLimit");
      expect(code).toContain("Retry-After");
    }
    for (const endpoint of ["sign-in", "sign-up", "request-password-reset"]) {
      const code = read("../frontend/src/app/api/auth/" + endpoint + "/route.ts");
      expect(code).toContain("checkRequestLimit");
      expect(code).toContain("Retry-After");
    }
  });
});
