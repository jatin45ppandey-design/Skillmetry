import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("answer-key boundary", () => {
  it("keeps browser assessment metadata free of answer keys", () => {
    expect(read("../shared/data/assessment-catalog.ts")).not.toContain("correctIndex");
    expect(read("../frontend/src/app/(workspace)/assessments/page.tsx")).not.toContain("correctIndex");
  });

  it("marks the production question bank server-only", () => {
    const bank = read("../backend/lib/assessments/question-bank.server.ts");
    expect(bank).toContain('import "server-only"');
    expect(bank.match(/correctIndex:/g)).toHaveLength(90);
  });

  it("keeps trusted grading out of the client-safe scoring module", () => {
    const clientScoring = read("../shared/lib/assessments/grading.ts");
    const serverGrading = read("../backend/lib/assessments/grading.server.ts");
    expect(clientScoring).not.toContain("correctIndex");
    expect(clientScoring).not.toContain("gradeAnswers");
    expect(serverGrading).toContain('import "server-only"');
    expect(serverGrading).toContain("ASSESSMENT_PASS_THRESHOLD = 75");
  });

  it("keeps the Digital Twin intelligence layer on the public evidence boundary", () => {
    const twin = read("../shared/lib/digital-twin-intelligence.ts");
    expect(twin).not.toContain("question-bank");
    expect(twin).not.toContain("correctIndex");
    expect(twin).not.toContain("gradeAnswers");
  });

  it("contains the reviewed SQL and Python wording corrections", () => {
    const bank = read("../backend/lib/assessments/question-bank.server.ts");
    expect(bank).toContain("Which clause limits an UPDATE to rows matching a condition?");
    expect(bank).toContain("SELECT DISTINCT department FROM employees");
    expect(bank).toContain("Which operator checks whether two Python values compare equal?");
  });
});
