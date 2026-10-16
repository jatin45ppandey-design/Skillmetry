import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@skillmetry/shared/lib/recommendations";
import { defaultLearningPreferences } from "@skillmetry/shared/lib/profile-schema";
import { resolveNextLearningAction } from "@skillmetry/shared/lib/next-learning-action";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("Backend next-step bridge", () => {
  it("guides a new student to choose goals without fictional evidence", () => {
    const recommendations = buildRecommendations({
      learning: defaultLearningPreferences(), trustedScores: {}
    });
    const action = resolveNextLearningAction(recommendations);
    expect(action.kind).toBe("choose-goals");
    expect(action.href).toBe("/settings");
  });
  it("shows an actionable, catalog-grounded next step without fake scores", () => {
    const recommendations = buildRecommendations({
      learning: defaultLearningPreferences("frontend-developer"), trustedScores: {}
    });
    const action = resolveNextLearningAction(recommendations);
    expect(["assessment", "learning"]).toContain(action.kind);
    expect(action.href.startsWith("/assessments?assessment=") ||
      action.href.startsWith("/resources")).toBe(true);
    expect(JSON.stringify(action)).not.toMatch(/placement probability|hire chance/i);
  });
  it("loads only the student's latest server-graded evidence", () => {
    const source = readFileSync(fileURLToPath(new URL("../frontend/src/app/api/learning/overview/route.ts", import.meta.url)),"utf8");
    expect(source).toContain("authenticatedRequest()");
    expect(source).toContain('.eq("user_id", auth.userId)');
    expect(source).toContain('.eq("grading_method", "server_quiz")');
    expect(source).toContain('private, no-store');
    expect(source).not.toContain("createAdminClient");
    expect(source).not.toContain("request.json()");
  });
});
