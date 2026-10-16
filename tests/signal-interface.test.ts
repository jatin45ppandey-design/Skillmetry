import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("Learning Chapters interface boundaries", () => {
  it("preserves type roles while using scoped warm studio tokens", () => {
    const layout = read("../frontend/src/app/layout.tsx");
    const studio = read("../frontend/src/app/studio.css");
    const chapterLanding = read("../frontend/src/app/chapter-landing.css");

    expect(layout).toContain("Bricolage_Grotesque");
    expect(layout).toContain("Instrument_Sans");
    expect(layout).toContain("IBM_Plex_Mono");
    expect(layout).toContain('import "./studio.css"');
    expect(layout).toContain('import "./studio-surfaces.css"');
    expect(studio).toContain("--bg: #fbf5ea");
    expect(chapterLanding).toContain("--paper: #fbf5ea");
    expect(chapterLanding).toContain("prefers-reduced-motion");
  });

  it("keeps the learning home grounded in real recommendation and evidence sources", () => {
    const dashboard = read("../frontend/src/app/(workspace)/dashboard/page.tsx");

    expect(dashboard).toContain("buildDigitalTwinSnapshot");
    expect(dashboard).toContain("getPersonalizedResources");
    expect(dashboard).toContain("catalogCoverage.measuredSkillCount");
    expect(dashboard).toContain("Object.hasOwn(scores,item.skillId)");
    expect(dashboard).toContain("This is a sample learning journey");
    expect(dashboard).toContain("LearningStreakCard");
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

  it("keeps primary and supporting features reachable without a permanent sidebar", () => {
    const shell = read("../frontend/src/components/workspace-shell.tsx");

    for (const route of ["/dashboard", "/careers", "/roadmap", "/assessments", "/twin", "/resources", "/simulator", "/missions", "/jobs", "/passport", "/settings"]) {
      expect(shell).toContain('href: "' + route + '"');
    }
    expect(shell).toContain("StudioLinks");
    expect(shell).toContain("studio-more-list");
    expect(shell).toContain("studio-drawer");
    expect(shell).toContain('aria-label="Mobile learning navigation"');
  });

  it("uses real career catalog data in the interactive landing preview", () => {
    const gallery = read("../frontend/src/components/career-chapter-gallery.tsx");
    const landing = read("../frontend/src/app/page.tsx");

    expect(gallery).toContain('from "@skillmetry/shared/data/catalog"');
    expect(gallery).toContain("careers.map");
    expect(gallery).toContain("aria-pressed={active}");
    expect(landing).toContain("CareerChapterGallery");
    expect(landing).toContain("Explore without an account");
    expect(landing).toContain("EXAMPLE ONLY");
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
