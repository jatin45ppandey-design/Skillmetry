import { describe, expect, it } from "vitest";
import { missions } from "@skillmetry/shared/data/catalog";
import { isSafeEvidenceUrl, missionSubmissionInputSchema } from "@skillmetry/shared/lib/mission-evidence";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const mission = missions[0];
const valid = {
  missionId: mission.id,
  action: "submit",
  checkedDeliverables: mission.deliverables.map((_, i) => i),
  reflection: "Explained my implementation and tradeoffs.",
  evidenceUrl: "https://github.com/example/project"
} as const;

describe("mission evidence is self-reported and separately validated", () => {
  it("accepts a real catalog mission with complete deliverables", () => {
    expect(missionSubmissionInputSchema.safeParse(valid).success).toBe(true);
  });
  it("allows incomplete drafts, not incomplete submissions", () => {
    expect(missionSubmissionInputSchema.safeParse({
      ...valid, action: "save-draft", checkedDeliverables: [], evidenceUrl: ""
    }).success).toBe(true);
    expect(missionSubmissionInputSchema.safeParse({ ...valid, checkedDeliverables: [] }).success).toBe(false);
    expect(missionSubmissionInputSchema.safeParse({ ...valid, evidenceUrl: "" }).success).toBe(false);
  });
  it("rejects unknown missions, duplicate/foreign deliverable indices and trusted fields", () => {
    expect(missionSubmissionInputSchema.safeParse({ ...valid, missionId: "fake" }).success).toBe(false);
    expect(missionSubmissionInputSchema.safeParse({ ...valid, checkedDeliverables: [0, 0] }).success).toBe(false);
    expect(missionSubmissionInputSchema.safeParse({ ...valid, checkedDeliverables: [99] }).success).toBe(false);
    expect(missionSubmissionInputSchema.safeParse({ ...valid, userId: "someone-else" }).success).toBe(false);
    expect(missionSubmissionInputSchema.safeParse({ ...valid, verified: true, score: 100 }).success).toBe(false);
  });
  it("allows safe HTTPS evidence and rejects unsafe destinations", () => {
    expect(isSafeEvidenceUrl("https://github.com/owner/repo")).toBe(true);
    for (const bad of ["javascript:alert(1)", "http://github.com/example", "https://127.0.0.1/x",
      "https://localhost/project", "https://user:password@example.org/path", "not-a-url"]) {
      expect(isSafeEvidenceUrl(bad)).toBe(false);
    }
  });
  it("SQL grants only own private draft/submission control and does not create grades", () => {
    const migration = readFileSync(fileURLToPath(new URL(
      "../database/supabase/migrations/202610160002_mission_submissions.sql", import.meta.url
    )), "utf8");
    expect(migration).toContain("force row level security");
    expect(migration).toContain("user_id = (select auth.uid())");
    expect(migration).toContain("status = 'draft'");
    expect(migration).toContain("submitted mission evidence is immutable");
    expect(migration).not.toMatch(/grant\s+(?:delete|all)\s+on\s+public\.mission_submissions\s+to\s+authenticated/i);
    expect(migration).not.toMatch(/\b(insert|update)\s+(into\s+)?public\.assessment_attempts\b/i);
  });
});
