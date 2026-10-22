import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("Landing 2.0 experience contracts", () => {
  it("uses a scoped editorial landing layer without changing the shared application shell", () => {
    const page = read("../frontend/src/app/page.tsx");
    const styles = read("../frontend/src/app/landing-v2.module.css");

    expect(page).toContain('from "./landing-v2.module.css"');
    expect(page).toContain("data-landing-root");
    expect(styles).toContain("#fbf5ea");
    expect(styles).toContain("#283c30");
    expect(styles).toContain("#d9ed82");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("shows the full goal, assessment, evidence, learning and reassessment loop", () => {
    const page = read("../frontend/src/app/page.tsx");

    for (const label of ["Choose a goal", "Take an assessment", "Read the evidence", "Learn & reassess"]) {
      expect(page).toContain(label);
    }
    expect(page).toContain("server-graded quiz is the only source");
  });

  it("derives the career blueprint and active entries from real catalogs", () => {
    const page = read("../frontend/src/app/page.tsx");
    const gallery = read("../frontend/src/components/career-chapter-gallery.tsx");

    expect(gallery).toContain('from "@skillmetry/shared/data/catalog"');
    expect(gallery).toContain('from "@skillmetry/shared/data/assessment-catalog"');
    expect(gallery).toContain("item.skill.prerequisites");
    expect(gallery).toContain("availableAssessments");
    expect(gallery).toContain("/onboarding?career=${encodeURIComponent(selected.id)}");
    expect(gallery).toContain("skillAtlasGraph");
    expect(gallery).toContain("Read every skill as a list");
    expect(page).toContain("/resources?skill=${encodeURIComponent(featuredSkill.id)}");
    expect(page).toContain("/practice?skill=${encodeURIComponent(featuredSkill.id)}");
  });

  it("keeps unknown evidence and learning activity explicitly non-numeric", () => {
    const page = read("../frontend/src/app/page.tsx");
    const preview = read("../frontend/src/components/landing-journey-preview.tsx");

    expect(page).toContain("Unknown never falls back to 0%.");
    expect(page).toContain("Unscored learning activity");
    expect(preview).toContain("No trusted attempt in this preview");
    expect(preview).toContain("Not assessed");
  });

  it("connects the story with progressive, fail-safe motion", () => {
    const page = read("../frontend/src/app/page.tsx");
    const motion = read("../frontend/src/components/landing-scroll-motion.tsx");

    for (const section of ["goal", "loop", "blueprint", "evidence", "learning", "close"]) {
      expect(page).toContain(`data-story-section="${section}"`);
    }
    expect(motion).toContain("--story-progress");
    expect(motion).toContain("revealFallback");
    expect(motion).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
  });
});
