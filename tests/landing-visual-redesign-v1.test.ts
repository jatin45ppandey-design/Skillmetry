import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("final public landing release", () => {
  it("uses the approved pointer-responsive learning-card artwork instead of a product demo", () => {
    const artwork = source("frontend/src/components/landing-kinetic-art.tsx");
    for (const label of ["Learn", "Practice", "Improve", "Grow"]) expect(artwork).toContain(label);
    expect(artwork).toContain("cardStack");
    expect(artwork).toContain("artPath");
    expect(artwork).toContain("onPointerMove={move}");
    expect(artwork).toContain('(hover: hover) and (pointer: fine)');
    expect(artwork).not.toContain("career");
  });

  it("uses the approved book and progressive growth-plant artwork in the public story", () => {
    const page = source("frontend/src/app/page.tsx");
    expect(page).toContain("/images/landing/about-open-book.png");
    expect(page).toContain("/images/landing/growth-steps-plants.png");
    expect(page).toContain("An open book with learning pages rising from it");
    expect(page).toContain("Three ascending blocks with progressively larger plants");
    expect(page).not.toContain("growth-pathway.png");
  });

  it("removes redundant landing counters and taglines", () => {
    const page = source("frontend/src/app/page.tsx");
    expect(page).not.toContain("heroIndex");
    expect(page).not.toContain("01</strong>");
    expect(page).not.toContain("Learn with direction");
    expect(page).not.toContain("Simple. Focused. Impactful.");
  });

  it("gives Explore an on-page target and Sign In the real auth route", () => {
    const page = source("frontend/src/app/page.tsx");
    expect(page).toContain('id="about"');
    expect(page).toContain('href="#about"');
    expect(page).toContain('href="/auth/sign-in"');
    expect(page).not.toContain('href="/onboarding"');
  });

  it("keeps content visible without motion and provides touch safeguards", () => {
    const styles = source("frontend/src/app/landing-v2.module.css");
    expect(styles).toContain("prefers-reduced-motion: reduce");
    expect(styles).toContain("(hover: none), (pointer: coarse)");
    expect(styles).toContain('[data-reveal] { opacity: 1 !important');
  });
});
