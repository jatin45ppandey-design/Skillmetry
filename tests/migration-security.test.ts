import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migration = readFileSync(fileURLToPath(new URL("../supabase/migrations/0002_auth_profile_security.sql", import.meta.url)), "utf8");
const rlsTest = readFileSync(fileURLToPath(new URL("../supabase/tests/profile_rls.test.sql", import.meta.url)), "utf8");

describe("database trust boundaries", () => {
  it("removes broad owner policies and grants students only claimed-skill writes", () => {
    expect(migration).toContain('drop policy if exists "Assessment owner"');
    expect(migration).toContain('drop policy if exists "Evidence owner"');
    expect(migration).toContain("grant update (claimed_proficiency)");
    expect(migration).not.toMatch(/grant\s+(?:insert|update|all)[^;]+assessment_attempts\s+to\s+authenticated/i);
    expect(migration).not.toMatch(/grant\s+(?:insert|update|all)[^;]+evidence\s+to\s+authenticated/i);
  });

  it("contains executable cross-user and forgery RLS cases", () => {
    expect(rlsTest).toContain("Alice cannot update Bob profile");
    expect(rlsTest).toContain("Alice cannot forge an assessment result");
    expect(rlsTest).toContain("Alice cannot self-approve evidence");
    expect(rlsTest).toContain("Alice cannot self-verify a skill");
  });
});
