import { describe, expect, it } from "vitest";
import { jobAIOutputSchema, groundedJobMentions, missionAIOutputSchema } from "@skillmetry/shared/lib/ai-output-schema";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("AI integration boundaries", () => {
  it("accepts bounded structured plans and rejects client-controlled grading", () => {
    const plan = { title: "Build a simple REST service", objective: "Create a minimal API with documented behavior.",
      steps: ["Design the route contracts.", "Implement the HTTP handlers.", "Write a unit test suite."],
      acceptanceCriteria: ["Endpoints return documented HTTP status codes.", "Tests pass for invalid requests."], caveats: [] };
    expect(missionAIOutputSchema.safeParse(plan).success).toBe(true);
    expect(missionAIOutputSchema.safeParse({ ...plan, score: 100 }).success).toBe(false);
  });
  it("rejects invented skill IDs and verifies quotes in the exact supplied job text", () => {
    expect(jobAIOutputSchema.safeParse({ mentions: [{ skillId: "made-up", evidenceQuote: "React" }] }).success).toBe(false);
    const payload = jobAIOutputSchema.parse({ mentions: [
      { skillId: "react", evidenceQuote: "React" },
      { skillId: "node", evidenceQuote: "Node" },
      { skillId: "react", evidenceQuote: "React" }
    ] });
    expect(groundedJobMentions("Experience in React and SQL.", payload).map(x => x.skillId)).toEqual(["react"]);
  });
  it("keeps provider keys server-only and enforces database-backed quotas", () => {
    const provider = readFileSync(fileURLToPath(new URL("../backend/lib/ai/gemini.server.ts", import.meta.url)), "utf8");
    const sql = readFileSync(fileURLToPath(new URL("../database/supabase/migrations/202610160003_ai_usage_daily.sql", import.meta.url)), "utf8");
    expect(provider).toContain('import "server-only"');
    expect(provider).toContain("GEMINI_API_KEY");
    expect(provider).not.toContain("NEXT_PUBLIC_GEMINI");
    expect(sql).toContain("on conflict (user_id, feature, usage_day)");
    expect(sql).toContain("requests < 3");
    expect(sql).toContain("auth.uid()");
  });
});
