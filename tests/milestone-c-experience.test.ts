import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Milestone C product experience", () => {
  it("loads modular Direction B Lite layers after Milestone B", () => {
    const layout = read("frontend/src/app/layout.tsx");
    expect(layout).toContain('import "./milestone-b.css"');
    expect(layout).toContain('import "./milestone-c-foundation.css"');
    expect(layout).toContain('import "./milestone-c-learning.css"');
    expect(layout).toContain('import "./milestone-c-tools.css"');
  });

  it("keeps the five-area shell while exposing route families for scoped compositions", () => {
    const shell = read("frontend/src/components/workspace-shell.tsx");
    expect(shell).toContain('label: "Home"');
    expect(shell).toContain('label: "My Path"');
    expect(shell).toContain('label: "Learn"');
    expect(shell).toContain('label: "Practice"');
    expect(shell).toContain('label: "Progress"');
    expect(shell).toContain("data-area={routeFamily(pathname)}");
  });

  it("makes the staged roadmap primary and keeps graph exploration optional", () => {
    const roadmap = read("frontend/src/app/(workspace)/roadmap/page.tsx");
    expect(roadmap).toContain('className="roadmap-stage-list"');
    expect(roadmap).toContain('className="roadmap-graph-explorer"');
    expect(roadmap).toContain("Explore prerequisite relationships");
    expect(roadmap).not.toContain("selectedScore ?? 0");
  });

  it("offers a useful practice index instead of treating the base route as an error", () => {
    const practice = read("frontend/src/app/(workspace)/practice/page.tsx");
    expect(practice).toContain('className="practice-topic-picker"');
    expect(practice).toContain("Choose a skill topic");
    expect(practice).not.toContain("This practice topic does not exist");
  });

  it("surfaces evidence-first overview, skills and history navigation", () => {
    const twin = read("frontend/src/components/digital-twin-workspace.tsx");
    expect(twin).toContain("My Skill Progress sections");
    expect(twin).toContain('href="#twin-overview"');
    expect(twin).toContain('href="#twin-skills-title"');
    expect(twin).toContain('href="#twin-history"');
  });

  it("documents Direction B Lite as the Milestone C source of truth", () => {
    const plan = read("docs/redesign/milestone-a/MILESTONE_C_PLAN.md");
    expect(plan).toContain("Direction B Lite");
    expect(plan).not.toContain("approved Direction A");
  });
});
