import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const file=(name:string)=>readFileSync(fileURLToPath(new URL("../"+name,import.meta.url)),"utf8");

describe("Skillmetry UI/UX phases 1–4 release contracts",()=>{
 it("provides a truly interactive, clearly illustrative landing journey",()=>{
  const preview=file("frontend/src/components/landing-journey-preview.tsx");
  const landing=file("frontend/src/app/page.tsx");
  expect(landing).toContain("<LandingJourneyPreview/>");
  expect(preview).toContain("aria-pressed={active===index}");
  expect(preview).toContain("onClick={()=>setActive(index)}");
  expect(preview).toContain("not a real account");
  expect(preview).not.toContain("20/100");
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
  expect(dashboard).toContain('profileSource==="student" && cloudOwnerId===user.id');
  expect(dashboard).toContain("const career = profileReady");
  const account=file("frontend/src/components/account-panel.tsx");
  expect(account).toContain("No saved career setup yet");
 });
 it("establishes responsive palette-preserving components and reduced-motion behavior",()=>{
  const css=file("frontend/src/app/phase1-4-ux.css");
  const layout=file("frontend/src/app/layout.tsx");
  expect(layout).toContain('import "./phase1-4-ux.css"');
  for(const selector of [".sx-journey-tab",".sx-journey-stage",".sx-settings-overview",".sx-goal-actions",".motion-route-progress"])
   expect(css).toContain(selector);
  expect(css).toContain("prefers-reduced-motion:reduce");
  expect(css).toContain("focus-visible");
 });
});
