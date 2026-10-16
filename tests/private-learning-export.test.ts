import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const route = readFileSync(fileURLToPath(new URL(
  "../frontend/src/app/api/account/learning-export/route.ts", import.meta.url
)), "utf8");
const passport = readFileSync(fileURLToPath(new URL(
  "../frontend/src/app/(workspace)/passport/page.tsx", import.meta.url
)), "utf8");

describe("private learning data export", () => {
  it("requires validated Supabase session and filters records by its owner", () => {
    expect(route).toContain("authenticatedRequest()");
    expect(route).toContain('auth.status === "unauthorized"');
    expect(route).toMatch(/\.eq\("user_id", auth\.userId\)/g);
    expect(route).toContain('.eq("id", auth.userId)');
    expect(route).not.toContain("createAdminClient");
  });
  it("never puts the private record into shared caches or a public URL", () => {
    expect(route).toContain('private, no-store, max-age=0');
    expect(route).toContain("Content-Disposition");
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(passport).toContain("PassportShareControl");
    expect(passport).toContain("Download my private learning record");
  });
  it("separates trusted scores from self-reported projects and detects missing migration", () => {
    expect(route).toContain('"server_quiz"');
    expect(route).toContain("selfReportedProjectEvidence");
    expect(route).toContain("projectEvidenceAvailable");
    expect(route).toContain("batchSize");
  });
});
