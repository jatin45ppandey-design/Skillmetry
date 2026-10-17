import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {skillLearningGuides,curatedGuideSkillIds} from "@skillmetry/shared/data/skill-learning-guides";
import {skills} from "@skillmetry/shared/data/catalog";
const read=(p:string)=>readFileSync(fileURLToPath(new URL(p,import.meta.url)),"utf8");
const routes=["dashboard","careers","roadmap","assessments","twin","resources","planner","lab","missions","jobs","simulator","tutor","passport","settings","practice"];
describe("V3 meaningful content and compact workspace contracts",()=>{
 it("has separate docs, attributable lecture, original notes and practical challenge for every canonical skill",()=>{
   expect(curatedGuideSkillIds.length).toBe(skills.length);
   expect(new Set(curatedGuideSkillIds).size).toBe(skills.length);
   for(const skill of skills){
     const guide=skillLearningGuides[skill.id];
     expect(guide,skill.id).toBeDefined();
     expect(guide.skillId).toBe(skill.id);
     expect(guide.notes.length).toBeGreaterThanOrEqual(3);
     expect(guide.challenge.length).toBeGreaterThan(20);
     for(const content of [guide.documentation,guide.lecture]){
       const url=new URL(content.url);
       expect(url.protocol).toBe("https:");
       expect(url.username).toBe("");
       expect(url.password).toBe("");
       expect(url.hash).toBe("");
     }
   }
 });
 it("makes notes a session-only review, never a verified proficiency edit",()=>{
  const hub=read("../frontend/src/components/focused-learning-hub.tsx");
  expect(hub).toContain("reviewed this session");
  expect(hub).toContain("not graded proficiency");
  expect(hub).not.toContain("localStorage.setItem");
  expect(hub).not.toContain("/api/assessments/submit");
 });
 it("keeps advanced catalog intact behind student-first learning desk",()=>{
   const page=read("../frontend/src/app/(workspace)/resources/page.tsx");
   expect(page).toContain("<FocusedLearningHub/>");
   expect(page).toContain("v3-legacy-catalog");
   expect(page).toContain("getPersonalizedResources");
   expect(page).toContain("ResourceCard");
 });
 it("keeps core student destinations accessible without duplicated focus banners",()=>{
   const shell=read("../frontend/src/components/workspace-shell.tsx");
   // A global question/shortcut bar repeated the page title, wasting the first viewport.
   expect(shell).not.toContain("<LearningQuickBar/>");
   expect(shell).toContain("studio-primary-nav");
   expect(shell).toContain("studio-drawer");
   expect(shell).toContain("studio-bottom-nav");
   // All ordinary workspaces remain discoverable through primary or grouped navigation.
   for(const route of routes.filter(value=>value!=="practice")){
     expect(shell).toContain('href: "/'+route+'"');
   }
   // Guided practice stays linked contextually from the learning desk.
   const resources=read("../frontend/src/app/(workspace)/resources/page.tsx");
   expect(resources).toContain("FocusedLearningHub");
 });
 it("distinguishes signed-in identity from an illustrative local profile",()=>{
   const account=read("../frontend/src/components/account-panel.tsx");
   const dashboard=read("../frontend/src/app/(workspace)/dashboard/page.tsx");
   expect(account).toContain('cloudOwnerId===user.id');
   expect(account).toContain("No saved career setup yet");
   expect(account).toContain("Saved student profile");
   expect(dashboard).toContain("onboardingCompleted && Boolean");
   expect(dashboard).toContain("sx-latest-panel");
 });
 it("reduces oversized landing-style headings while retaining responsive controls",()=>{
   const css=read("../frontend/src/app/experience-v3.css");
   expect(css).toContain(".section-head h1");
   expect(css).toContain(".sx-next-step");
   expect(css).toContain("@media(max-width:760px)");
   expect(css).toContain("@media(max-width:540px)");
 });
});
