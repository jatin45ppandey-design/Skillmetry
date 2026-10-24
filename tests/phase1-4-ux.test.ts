import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const file=(name:string)=>readFileSync(fileURLToPath(new URL("../"+name,import.meta.url)),"utf8");

describe("Skillmetry UI/UX phases 1–4 release contracts",()=>{
 it("provides a catalog-backed living path and interactive career explorer",()=>{
  const path=file("frontend/src/components/living-learning-path.tsx");
  const landing=file("frontend/src/app/page.tsx");
  expect(landing).toContain('<LivingLearningPath mode="hero" />');
  expect(landing).toContain('<LivingLearningPath mode="explorer" />');
  expect(path).toContain('from "@skillmetry/shared/data/catalog"');
  expect(path).toContain("Catalog-backed");
  expect(path).toContain("aria-pressed={active}");
  expect(path).toContain("setCareerId(nextCareer.id);");
  expect(path).toContain('setSelectedSkillId(nextCareer.skills[0]?.skillId ?? "");');
  expect(path).not.toContain("20/100");
 });
 it("does not present local edits as a completed remote profile save",()=>{
  const settings=file("frontend/src/app/(workspace)/settings/page.tsx");
  expect(settings).toContain("cloudOwnerId===user.id");
  expect(settings).toContain('syncStatus==="saving"');
  expect(settings).toContain('syncStatus==="synced"');
  expect(settings).toContain("Cloud confirmation is not yet available");
  expect(settings).toContain("No pending changes");
  expect(settings).not.toContain('changed ? "Save learning goals" : "Saved"');
 });
 it("keeps goal editor usable via actual search and selected-state feedback",()=>{
  const editor=file("frontend/src/components/learning-goal-editor.tsx");
  expect(editor).toContain('type="search"');
  expect(editor).toContain("visibleSkills.map");
  expect(editor).toContain('aria-pressed={selected}');
  expect(editor).toContain("No skills match");
 });
 it("distinguishes signed-in guest/demo state from saved student career",()=>{
  const dashboard=file("frontend/src/app/(workspace)/dashboard/page.tsx");
  expect(dashboard).toContain('profileSource === "student" && cloudOwnerId === user.id');
  expect(dashboard).toContain("const career = profileReady");
  const account=file("frontend/src/components/account-panel.tsx");
  expect(account).toContain("No saved career setup yet");
 });
 it("establishes responsive palette-preserving components and reduced-motion behavior",()=>{
  const css=file("frontend/src/app/milestone-b.css");
  const layout=file("frontend/src/app/layout.tsx");
  expect(layout).toContain('import "./milestone-b.css"');
  for(const selector of [".mb-loop-preview",".mb-career-browser",".mb-bottom-nav",".mb-now",".mb-truth-state"])
   expect(css).toContain(selector);
  expect(css).toContain("prefers-reduced-motion: reduce");
  expect(css).toContain("focus-visible");
 });
});
