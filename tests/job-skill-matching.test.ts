import { describe, expect, it } from "vitest";
import { matchJobSkillMentions } from "@skillmetry/shared/lib/job-skill-matching";

describe("private deterministic job description matching", () => {
  it("matches explicit canonical skill terms without inventing grades", () => {
    const matches = matchJobSkillMentions("Build React and TypeScript UIs, deploy with Docker.", {});
    expect(matches.map(item => item.skillId)).toEqual(["docker", "typescript", "react"]);
    expect(matches.every(item => item.score === null && item.evidenceState === "not-assessed")).toBe(true);
  });
  it("distinguishes trusted 0 from missing evidence", () => {
    const matches = matchJobSkillMentions("Strong SQL and Node.js experience with unit tests.", { sql: 0, node: 85 });
    expect(matches.find(item => item.skillId === "sql")?.evidenceState).toBe("needs-practice");
    expect(matches.find(item => item.skillId === "sql")?.score).toBe(0);
    expect(matches.find(item => item.skillId === "node")?.score).toBe(85);
    expect(matches.find(item => item.skillId === "testing")?.score).toBe(null);
  });
  it("avoids common substring false positives", () => {
    expect(matchJobSkillMentions("We reactivate a NoSQL cluster and use node graphs.", {}).map(x => x.skillId)).toEqual([]);
  });
  it("never evaluates or stores arbitrary pasted text, and imposes an explicit size cap", () => {
    expect(matchJobSkillMentions("", {})).toEqual([]);
    expect(() => matchJobSkillMentions("x".repeat(12001), {})).toThrow(/12,000/);
  });
});
