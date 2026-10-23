import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("signature navigation motion", () => {
  it("maps each primary area to a route-aware symbol in the shared shell", () => {
    const shell = source("frontend/src/components/workspace-shell.tsx");
    const motion = source("frontend/src/components/signature-navigation-motion.tsx");
    for (const area of ["home", "path", "learn", "practice", "progress"]) {
      expect(shell).toContain(`area: "${area}"`);
      expect(motion).toContain(`case "${area}"`);
    }
    expect(shell).toContain("onSignatureNavigate={beginSignatureNavigation}");
    expect(shell).toContain("data-signature-phase={signatureTransition?.phase}");
  });

  it("keeps the animation optional, short, and cancellable", () => {
    const motion = source("frontend/src/components/signature-navigation-motion.tsx");
    const css = source("frontend/src/app/signature-navigation-motion.css");
    expect(motion).toContain("prefers-reduced-motion: reduce");
    expect(motion).toContain("clearTimer()");
    expect(motion).toContain("sessionStorage");
    expect(motion).toContain("expectedArea");
    expect(css).toContain("pointer-events: none");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("signature-content-arrive");
  });
});
