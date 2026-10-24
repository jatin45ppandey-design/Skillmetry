import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("final public landing release", () => {
  it("uses original pointer-responsive abstract artwork instead of a product demo", () => {
    const artwork = source("frontend/src/components/landing-kinetic-art.tsx");
    expect(artwork).toContain("artBackPage");
    expect(artwork).toContain("artFrontPage");
    expect(artwork).toContain("onPointerMove={move}");
    expect(artwork).toContain('(hover: hover) and (pointer: fine)');
    expect(artwork).not.toContain("career");
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
