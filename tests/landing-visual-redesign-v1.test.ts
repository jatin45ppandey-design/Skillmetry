import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("landing visual redesign v1", () => {
  it("uses a catalog-backed connected learning canvas instead of a static dashboard mockup", () => {
    const preview = source("frontend/src/components/landing-journey-preview.tsx");
    expect(preview).toContain('const stages = ["career", "learn", "practice", "evidence", "next"]');
    expect(preview).toContain('from "@skillmetry/shared/data/catalog"');
    expect(preview).toContain('from "@skillmetry/shared/data/assessment-catalog"');
    expect(preview).toContain('role="tablist"');
    expect(preview).toContain('value={career.id}');
    expect(preview).toContain("Unknown, not 0%");
  });

  it("gives learning, practice, evidence and final onboarding separate real route handoffs", () => {
    const page = source("frontend/src/app/page.tsx");
    expect(page).toContain('id="practice-preview"');
    expect(page).toContain("Illustrative topic practice flow");
    expect(page).toContain("/practice?skill=${encodeURIComponent(featuredSkill.id)}");
    expect(page).toContain("/assessments?assessment=${encodeURIComponent(featuredAssessment.id)}");
    expect(page).toContain('href="/onboarding"');
  });

  it("keeps scroll enhancement visible while the observer is pending and honours reduced motion", () => {
    const styles = source("frontend/src/app/landing-v2.module.css");
    expect(styles).toContain("Connected Learning Canvas");
    expect(styles).toContain("opacity: .74");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });
});
