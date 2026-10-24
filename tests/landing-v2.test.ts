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
    expect(styles).toContain("#f3eee4");
    expect(styles).toContain("#191a17");
    expect(styles).toContain("#f05a37");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps the release landing to the requested three-section story", () => {
    const page = read("../frontend/src/app/page.tsx");
    for (const label of ["Stop guessing.", "Follow what", "Your next chapter"]) expect(page).toContain(label);
    expect(page.match(/<section/g)).toHaveLength(3);
  });

  it("derives the living path and all career choices from real catalogs", () => {
    const page = read("../frontend/src/app/page.tsx");
    const path = read("../frontend/src/components/living-learning-path.tsx");
    expect(path).toContain('from "@skillmetry/shared/data/catalog"');
    expect(path).toContain('from "@skillmetry/shared/data/assessment-catalog"');
    expect(path).toContain("career.skills.slice");
    expect(path).toContain("careers.map");
    expect(path).toContain("/onboarding?career=${encodeURIComponent(career.id)}");
    expect(path).toContain("mobilePath");
    expect(page).toContain('<LivingLearningPath mode="explorer" />');
  });

  it("does not invent landing scores or completion claims", () => {
    const page = read("../frontend/src/app/page.tsx");
    const path = read("../frontend/src/components/living-learning-path.tsx");
    expect(page).not.toMatch(/\d+%/);
    expect(path).not.toContain("score:");
    expect(path).not.toContain("completed");
  });

  it("connects the story with progressive, fail-safe motion", () => {
    const page = read("../frontend/src/app/page.tsx");
    const motion = read("../frontend/src/components/landing-scroll-motion.tsx");
    for (const section of ["goal", "explorer", "close"]) expect(page).toContain(`data-story-section="${section}"`);
    expect(motion).toContain("--story-progress");
    expect(motion).toContain("revealFallback");
    expect(motion).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
  });
});
