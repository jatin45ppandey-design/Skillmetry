import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("Phase 4 signature final experience", () => {
  it("uses the five learning-area symbols in the real primary navigation", () => {
    const shell = source("frontend/src/components/workspace-shell.tsx");
    for (const symbol of ["House", "Route", "BookOpen", "Code2", "ChartNoAxesCombined"]) {
      expect(shell).toContain(symbol);
    }
  });

  it("acknowledges real dashboard, planner and progress state changes without manufacturing evidence", () => {
    const dashboard = source("frontend/src/app/(workspace)/dashboard/page.tsx");
    const planner = source("frontend/src/app/(workspace)/planner/page.tsx");
    const twin = source("frontend/src/components/digital-twin-workspace.tsx");
    expect(dashboard).toContain("p4-dashboard-next");
    expect(dashboard).toContain('key={continuation.href}');
    expect(planner).toContain("Your weekly plan was saved.");
    expect(planner).toContain("The task status was saved.");
    expect(twin).toContain('key={`skill-${selectedSkill.skillId}`}');
    expect(twin).toContain('key={selectedCareer.careerId}');
    expect(twin).toContain("server-graded");
  });

  it("serves the branded icon for conventional favicon requests and disables added motion when requested", () => {
    const favicon = source("frontend/src/app/favicon.ico/route.ts");
    const styles = source("frontend/src/app/signature-final.css");
    expect(existsSync(fileURLToPath(new URL("../frontend/src/app/icon.svg", import.meta.url)))).toBe(true);
    expect(favicon).toContain('new URL("/icon.svg", request.url)');
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });
});
