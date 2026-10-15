import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("Digital Twin C2 workspace boundary", () => {
  it("renders the C1-backed workspace from the Twin route", () => {
    const route = read("../frontend/src/app/(workspace)/twin/page.tsx");
    expect(route).toContain('import { DigitalTwinWorkspace } from "@/components/digital-twin-workspace"');
    expect(route).toContain("<DigitalTwinWorkspace />");
  });

  it("uses C1 evidence and only existing internal assessment/resource destinations", () => {
    const workspace = read("../frontend/src/components/digital-twin-workspace.tsx");
    expect(workspace).toContain("buildDigitalTwinSnapshot");
    expect(workspace).toContain("getResourceBrowseHref");
    expect(workspace).toContain('href="/roadmap"');
    expect(workspace).toContain("/assessments?assessment=");
    expect(workspace).toContain("assessment-unavailable");
    expect(workspace).toContain("Not Assessed");
  });

  it("does not cross the server-only assessment boundary", () => {
    const workspace = read("../frontend/src/components/digital-twin-workspace.tsx");
    expect(workspace).not.toMatch(/from\s+["'][^"']*question-bank/);
    expect(workspace).not.toMatch(/from\s+["'][^"']*grading\.server/);
    expect(workspace).not.toContain("correctIndex");
  });
});
