import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = fileURLToPath(new URL("../frontend/src", import.meta.url));
const read = (path: string) => readFileSync(join(frontendRoot, path), "utf8");

function tsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? tsxFiles(path) : extname(entry.name) === ".tsx" ? [path] : [];
  });
}

describe("Phase 1 product language and navigation", () => {
  it("keeps the five primary learning areas and adds route-aware secondary navigation", () => {
    const shell = read("components/workspace-shell.tsx");
    const styles = read("app/milestone-c-foundation.css");
    for (const label of ["Home", "My Path", "Learn", "Practice", "Progress"]) expect(shell).toContain(`label: "${label}"`);
    for (const label of ["My Learning Path", "Learning Resources", "Coding Practice", "Projects", "My Skill Progress", "Skill Summary"]) expect(shell).toContain(label);
    expect(shell).toContain('aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}');
    expect(shell).toContain('aria-label="Breadcrumb"');
    expect(styles).toContain(".mb-area-nav");
    expect(styles).toContain("min-height: 44px");
    expect(styles).toContain("flex-wrap: wrap");
  });

  it("removes retired student-facing terminology from rendered TSX copy", () => {
    const source = tsxFiles(frontendRoot).map(path => readFileSync(path, "utf8")).join("\n").toLowerCase();
    const retiredTerms = [
      "digital twin",
      "private cloud workspace",
      "career passport",
      "what-if career simulator",
      "mission workshop",
      "guided coding lab",
      "guided coding practice",
      "learning tutor",
      "learning companion",
      "adaptive roadmap",
      "diagnostic intelligence",
      "learning planner",
      "job description analyzer",
      "learning desk",
      "learning shelf",
      "chapter 05",
      "chapter 06",
      "chapter 07",
      "chapter 08",
      "chapter 09",
      "chapter 10"
    ];
    for (const term of retiredTerms) expect(source, term).not.toContain(term);
  });

  it("uses the approved plain-language names on their existing routes", () => {
    expect(read("app/(workspace)/twin/page.tsx")).toContain('eyebrow="My Skill Progress"');
    expect(read("app/(workspace)/roadmap/page.tsx")).toContain('eyebrow="My Learning Path"');
    expect(read("app/(workspace)/simulator/page.tsx")).toContain('eyebrow="Compare Study Plans"');
    expect(read("app/(workspace)/missions/page.tsx")).toContain('eyebrow="Projects"');
    expect(read("app/(workspace)/lab/page.tsx")).toContain('eyebrow="Coding Practice"');
    expect(read("app/(workspace)/tutor/page.tsx")).toContain('eyebrow="Study Help"');
    expect(read("app/(workspace)/planner/page.tsx")).toContain('eyebrow="Weekly Study Plan"');
    expect(read("app/(workspace)/jobs/page.tsx")).toContain('eyebrow="Job Skill Checker"');
    expect(read("app/(workspace)/passport/page.tsx")).toContain('eyebrow="Skill Summary"');
  });
});
