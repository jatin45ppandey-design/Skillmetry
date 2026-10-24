import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { careers } from "@skillmetry/shared/data/catalog";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("Phase 2 career motifs", () => {
  it("gives every canonical career its own declared motif", () => {
    const motif = source("frontend/src/components/career-motif.tsx");
    expect(careers).toHaveLength(14);
    for (const career of careers) expect(motif).toContain(`"${career.id}"`);
  });

  it("keeps motifs in the workspace while the landing uses its connected path language", () => {
    const landingPath = source("frontend/src/components/living-learning-path.tsx");
    expect(landingPath).toContain("careers.map(item");
    expect(landingPath).toContain("pathPoints");
    expect(source("frontend/src/app/(workspace)/careers/page.tsx")).toContain("CareerMotif careerId={career.id}");
  });
});
