import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("SIGNAL interface boundaries", () => {
  it("centralizes the approved palette and typography roles", () => {
    const layout = read("../frontend/src/app/layout.tsx");
    const styles = read("../frontend/src/app/globals.css");

    expect(layout).toContain("Bricolage_Grotesque");
    expect(layout).toContain("Instrument_Sans");
    expect(layout).toContain("IBM_Plex_Mono");
    expect(styles).toContain("--forest-ink:#121914");
    expect(styles).toContain("--signal-citron:#d9ed82");
    expect(styles).toContain("--burnt-terracotta:#e88c69");
    expect(styles).toContain("--font-technical");
  });

  it("keeps the command center grounded in existing intelligence sources", () => {
    const dashboard = read("../frontend/src/app/(workspace)/dashboard/page.tsx");

    expect(dashboard).toContain("buildDigitalTwinSnapshot");
    expect(dashboard).toContain("getPersonalizedResources");
    expect(dashboard).toContain("unknown skills excluded");
    expect(dashboard).not.toContain("readiness(");
  });

  it("keeps unknown roadmap evidence distinct from a numeric zero", () => {
    const graph = read("../frontend/src/components/roadmap-graph.tsx");

    expect(graph).toContain('data.score === null ? "N/A"');
    expect(graph).toContain("No measured score");
    expect(graph).toContain("Object.hasOwn(proficiency, id)");
    expect(graph).not.toContain("proficiency[id] ?? 0");
  });

  it("keeps the complete learning system reachable in primary navigation", () => {
    const shell = read("../frontend/src/components/workspace-shell.tsx");

    for (const route of ["/dashboard", "/roadmap", "/assessments", "/resources", "/twin"]) {
      expect(shell).toContain(`href:"${route}"`);
    }
    expect(shell).toContain('group:"Learning system"');
  });
});
