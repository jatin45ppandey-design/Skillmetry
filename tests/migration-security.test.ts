import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migration = readFileSync(fileURLToPath(new URL("../database/supabase/migrations/0002_auth_profile_security.sql", import.meta.url)), "utf8");
const assessmentMigration = readFileSync(fileURLToPath(new URL("../database/supabase/migrations/20261011143435_secure_assessment_engine.sql", import.meta.url)), "utf8");
const hardeningMigration = readFileSync(fileURLToPath(new URL("../database/supabase/migrations/20261011180657_assessment_concurrency_hardening.sql", import.meta.url)), "utf8");
const integrityMigration = readFileSync(fileURLToPath(new URL("../database/supabase/migrations/20261012000001_enforce_trusted_attempt_metadata.sql", import.meta.url)), "utf8");
const rlsTest = readFileSync(fileURLToPath(new URL("../database/supabase/tests/profile_rls.test.sql", import.meta.url)), "utf8");

describe("database trust boundaries", () => {
  it("removes broad owner policies and grants students only claimed-skill writes", () => {
    expect(migration).toContain('drop policy if exists "Assessment owner"');
    expect(migration).toContain('drop policy if exists "Evidence owner"');
    expect(migration).toContain("grant update (claimed_proficiency)");
    expect(migration).not.toMatch(/grant\s+(?:insert|update|all)[^;]+assessment_attempts\s+to\s+authenticated/i);
    expect(migration).not.toMatch(/grant\s+(?:insert|update|all)[^;]+evidence\s+to\s+authenticated/i);
  });

  it("makes quiz completion service-role-only and removes claimed-skill writes", () => {
    expect(assessmentMigration).toContain("revoke insert (user_id, skill_id, claimed_proficiency)");
    expect(assessmentMigration).toContain('drop policy if exists "user_skills_insert_claimed_own"');
    expect(assessmentMigration).toContain("from public, anon, authenticated");
    expect(assessmentMigration).toContain("to service_role");
    expect(assessmentMigration).toContain("grading_method = 'server_quiz'");
    expect(assessmentMigration).toContain("status = 'active'");
    expect(assessmentMigration).toContain("assessment_attempts_session_unique");
  });

  it("contains executable cross-user and forgery RLS cases", () => {
    expect(rlsTest).toContain("Alice cannot update Bob profile");
    expect(rlsTest).toContain("Alice cannot forge an assessment result");
    expect(rlsTest).toContain("Alice cannot self-approve evidence");
    expect(rlsTest).toContain("Alice cannot self-verify a skill");
  });

  it("atomically starts one active session and keeps optional limits server-enforced", () => {
    expect(hardeningMigration).toContain("create unique index assessment_sessions_active_idx");
    expect(hardeningMigration).toContain("pg_advisory_xact_lock");
    expect(hardeningMigration).toContain("start_or_resume_assessment_session");
    expect(hardeningMigration).toContain("p_max_completions int default null");
    expect(hardeningMigration).toContain("to service_role");
  });

  it("enforces result, threshold, question-count, and completion metadata invariants", () => {
    expect(hardeningMigration).toContain("when assessment_version = '2026.1' then 70");
    expect(hardeningMigration).toContain("else 75");
    expect(hardeningMigration).toContain("passed = (score >= pass_threshold)");
    expect(hardeningMigration).toContain("p_total_questions <> pg_catalog.cardinality(v_session.question_ids)");
    expect(hardeningMigration).toContain("assessment pass result mismatch");
    expect(hardeningMigration).toContain("status = 'completed' and completed_at is not null");
  });

  it("requires complete metadata for trusted results without rewriting attempts", () => {
    expect(integrityMigration).toContain("grading_method = 'legacy_untrusted'");
    expect(integrityMigration).toContain("grading_method = 'server_quiz'");
    expect(integrityMigration).toContain("session_id is not null");
    expect(integrityMigration).toContain("correct_count is not null");
    expect(integrityMigration).toContain("total_questions is not null");
    expect(integrityMigration).toContain("pass_threshold is not null");
    expect(integrityMigration).toContain("score = round((correct_count::numeric * 100) / nullif(total_questions, 0), 2)");
    expect(integrityMigration).toContain("passed = (score >= pass_threshold)");
    expect(integrityMigration).not.toMatch(/\b(?:insert|update|delete)\s+(?:into\s+|from\s+)?public\.assessment_attempts\b/i);
    expect(integrityMigration).not.toMatch(/create\s+(?:or\s+replace\s+)?function/i);
  });
});
