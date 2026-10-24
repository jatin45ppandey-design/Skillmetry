import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("Learning Chapters interface boundaries", () => {
  it("preserves type roles while using scoped warm studio tokens", () => {
    const layout = read("../frontend/src/app/layout.tsx");
    const milestone = read("../frontend/src/app/milestone-b.css");

    expect(layout).toContain("Bricolage_Grotesque");
    expect(layout).toContain("Instrument_Sans");
    expect(layout).toContain("IBM_Plex_Mono");
    expect(layout).toContain('import "./studio.css"');
    expect(layout).toContain('import "./studio-surfaces.css"');
    expect(layout).toContain('import "./milestone-b.css"');
    expect(milestone).toContain("--mb-paper: #fbf5ea");
    expect(milestone).toContain("--mb-citron: #d9ed82");
    expect(milestone).toContain("prefers-reduced-motion");
  });

  it("keeps the learning home grounded in real recommendation and evidence sources", () => {
    const dashboard = read("../frontend/src/app/(workspace)/dashboard/page.tsx");

    expect(dashboard).toContain("buildDigitalTwinSnapshot");
    expect(dashboard).toContain("getPersonalizedResources");
    expect(dashboard).toContain("catalogCoverage.measuredSkillCount");
    expect(dashboard).toContain('typeof score === "number" && Number.isFinite(score)');
    expect(dashboard).toContain("Illustrative demo.");
    expect(dashboard).toContain("Continue Learning");
    expect(dashboard).not.toContain("LearningStreakCard");
    expect(dashboard).toContain('"/onboarding"');
    expect(dashboard).not.toContain("readiness(");
  });

  it("keeps unknown roadmap evidence distinct from a numeric zero", () => {
    const graph = read("../frontend/src/components/roadmap-graph.tsx");

    expect(graph).toContain('data.score === null ? "N/A"');
    expect(graph).toContain("No measured score");
    expect(graph).toContain("Object.hasOwn(proficiency, id)");
    expect(graph).not.toContain("proficiency[id] ?? 0");
  });

  it("never invents a measured zero or a no-goal recommendation", () => {
    const dashboard = read("../frontend/src/app/(workspace)/dashboard/page.tsx");
    const evidenceStatus = read("../frontend/src/components/evidence-status.tsx");

    expect(evidenceStatus).toContain("Number.isFinite(props.score)");
    expect(evidenceStatus).not.toContain("score ?? 0");
    expect(dashboard).toContain("No recommendation yet — choose a direction first.");
    expect(dashboard).toContain("hasFocus ? getPersonalizedResources");
  });

  it("keeps primary and supporting features reachable without a permanent sidebar", () => {
    const shell = read("../frontend/src/components/workspace-shell.tsx");

    for (const route of ["/dashboard", "/careers", "/roadmap", "/assessments", "/twin", "/resources", "/simulator", "/missions", "/jobs", "/passport", "/settings"]) {
      expect(shell).toContain('href: "' + route + '"');
    }
    expect(shell).toContain("PrimaryLinks");
    expect(shell).toContain("secondaryGroups");
    expect(shell).toContain("mb-drawer");
    expect(shell).toContain('aria-label="Mobile learning navigation"');
  });

  it("keeps real career catalog data behind the public landing", () => {
    const landing = read("../frontend/src/app/page.tsx");
    expect(landing).not.toContain('@skillmetry/shared/data/catalog');
    expect(landing).not.toContain("careers.map");
    expect(landing).toContain('href="#about"');
    expect(landing).toContain('href="/auth/sign-in"');
  });

  it("requires deliberate confirmation before a trusted quiz submission", () => {
    const assessments = read("../frontend/src/app/(workspace)/assessments/page.tsx");
    expect(assessments).toContain("submitDialogRef");
    expect(assessments).toContain("dialog.showModal()");
    expect(assessments).toContain("setConfirmSubmit(true)");
    expect(assessments).toContain("Confirm and submit");
    expect(assessments).toContain('sessionId: session.sessionId, answers');
  });
});
