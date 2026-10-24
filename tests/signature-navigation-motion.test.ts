import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("workspace primary navigation stability", () => {
  it("keeps the five intended real route targets", () => {
    const shell = source("frontend/src/components/workspace-shell.tsx");
    for (const [href, label] of [
      ["/dashboard", "Home"],
      ["/roadmap", "My Path"],
      ["/learn", "Learn"],
      ["/assessments", "Practice"],
      ["/twin", "Progress"]
    ]) {
      expect(shell).toContain(`href: "${href}", label: "${label}"`);
    }
    expect(shell).toContain('prefetch={true}');
    expect(shell).toContain('onClick={onNavigate}');
    expect(shell).toContain('aria-current={active ? "page" : undefined}');
  });

  it("does not mount decorative stateful route overlays over functional navigation", () => {
    const shell = source("frontend/src/components/workspace-shell.tsx");
    expect(shell).not.toContain("useSignatureNavigation");
    expect(shell).not.toContain("<SignatureNavigationMotion");
    expect(shell).not.toContain("onSignatureNavigate");
  });

  it("renders the approved Skillmetry name without a Signal subtitle", () => {
    const brand = source("frontend/src/components/brand.tsx");
    expect(brand).toContain("brand-name");
    expect(brand).not.toContain("<small>signal</small>");
  });
});
