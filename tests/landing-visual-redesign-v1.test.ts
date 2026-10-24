import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("landing final visual release", () => {
  it("uses a catalog-backed living learning path instead of a dashboard mockup", () => {
    const path = source("frontend/src/components/living-learning-path.tsx");
    expect(path).toContain('from "@skillmetry/shared/data/catalog"');
    expect(path).toContain('from "@skillmetry/shared/data/assessment-catalog"');
    expect(path).toContain("careers.map");
    expect(path).toContain('value={career.id}');
    expect(path).toContain("pathPoints");
  });

  it("gives hero, explorer and closing CTA real route handoffs", () => {
    const page = source("frontend/src/app/page.tsx");
    const path = source("frontend/src/components/living-learning-path.tsx");
    expect(page).toContain('id="career-explorer"');
    expect(page).toContain('href="/onboarding"');
    expect(page).toContain('href="/auth/sign-in"');
    expect(path).toContain("/onboarding?career=${encodeURIComponent(career.id)}");
  });

  it("keeps static content visible and honours reduced motion", () => {
    const styles = source("frontend/src/app/landing-v2.module.css");
    expect(styles).toContain(".pathExperience");
    expect(styles).toContain("opacity: .72");
    expect(styles).toContain("prefers-reduced-motion: reduce");
    expect(styles).toContain(".pathStroke { stroke: var(--accent)");
  });
});
