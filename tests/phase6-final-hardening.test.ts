import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {careers,skills} from "@skillmetry/shared/data/catalog";
import {curriculumCatalog} from "@skillmetry/shared/data/curriculum";

const source=(path:string)=>readFileSync(fileURLToPath(new URL(`../${path}`,import.meta.url)),"utf8");

describe("Phase 6 final integration guards",()=>{
  it("derives public catalog counts from the expanded canonical data",()=>{
    expect(careers).toHaveLength(14);
    expect(skills).toHaveLength(42);
    expect(curriculumCatalog.topics).toHaveLength(126);
    const shell=source("frontend/src/components/workspace-shell.tsx");
    const explorer=source("frontend/src/components/curriculum-explorer.tsx");
    const practice=source("frontend/src/app/(workspace)/practice/page.tsx");
    const lab=source("frontend/src/app/(workspace)/lab/page.tsx");
    expect(shell).toContain("Compare ${careers.length} curated paths");
    expect(explorer).toContain("All {careers.length} careers");
    expect(explorer).toContain("of {skills.length} skills");
    expect(practice).toContain("All {skills.length} skills");
    expect(lab).toContain("All {skills.length} skills");
  });

  it("turns a linked skill into a filtered topic picker without inventing activity or scores",()=>{
    const practice=source("frontend/src/app/(workspace)/practice/page.tsx");
    expect(practice).toContain('const requestedSkill=params.get("skill")??""');
    expect(practice).toContain("if(!hasSelection&&linkedSkill)setSkillFilter(linkedSkill)");
    expect(practice).toContain("Practice activity stays separate from trusted quiz scores.");
  });

  it("renders every expanded career on the public landing page",()=>{
    const gallery=source("frontend/src/components/career-chapter-gallery.tsx");
    expect(gallery).toContain('CareerMotif careerId={career.id}');
    expect(gallery).toContain("careers.map(career");
  });

  it("keeps shared control feedback restrained and disables it for reduced motion",()=>{
    const motion=source("frontend/src/app/motion-system.css");
    expect(motion).toContain(".studio-app details>summary");
    expect(motion).toContain("details[open]>summary");
    expect(motion).toContain("details>summary:focus-visible");
    expect(motion).toContain("prefers-reduced-motion:reduce");
  });

  it("keeps the dark guided-practice surface legible at narrow widths",()=>{
    const practiceStyles=source("frontend/src/app/phase3-practice.css");
    expect(practiceStyles).toContain('.studio-app[data-route="practice"] .p3-practice-session');
    expect(practiceStyles).toContain("color:#f7fbf2");
    expect(practiceStyles).toContain("label:has(input:checked)");
  });
});
