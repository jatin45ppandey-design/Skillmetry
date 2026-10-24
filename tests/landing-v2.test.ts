import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("Public landing experience contracts", () => {
  it("uses a scoped editorial layer without changing the shared application shell", () => {
    const page = read("../frontend/src/app/page.tsx");
    const styles = read("../frontend/src/app/landing-v2.module.css");
    expect(page).toContain('from "./landing-v2.module.css"');
    expect(page).toContain("data-landing-root");
    expect(styles).toContain("#f3eee4");
    expect(styles).toContain("#191a17");
    expect(styles).toContain("#f15a38");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps the public story to hero, about and closing sections", () => {
    const page = read("../frontend/src/app/page.tsx");
    for (const label of ["Learn", "Keep curiosity", "Your growth"]) expect(page).toContain(label);
    expect(page.match(/<section/g)).toHaveLength(3);
    expect(page).toContain('id="about"');
  });

  it("uses only Explore and Sign In as public actions", () => {
    const page = read("../frontend/src/app/page.tsx");
    expect(page).toContain('href="#about"');
    expect(page).toContain('href="/auth/sign-in"');
    expect(page).not.toContain('href="/onboarding"');
    expect(page).not.toContain("Get Started");
    expect(page).not.toContain("Find Your Path");
  });

  it("keeps product data and previews outside the public page", () => {
    const page = read("../frontend/src/app/page.tsx");
    expect(page).not.toContain("careers.map");
    expect(page).not.toContain("assessmentCatalog");
    expect(page).not.toContain("LivingLearningPath");
    expect(page).not.toMatch(/\d+%/);
  });

  it("connects the three-part composition with fail-safe motion", () => {
    const page = read("../frontend/src/app/page.tsx");
    const motion = read("../frontend/src/components/landing-scroll-motion.tsx");
    for (const section of ["hero", "about", "close"]) expect(page).toContain(`data-story-section="${section}"`);
    expect(motion).toContain("revealFallback");
    expect(motion).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
  });
});
