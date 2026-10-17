import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const read=(p:string)=>readFileSync(fileURLToPath(new URL("../"+p,import.meta.url)),"utf8");

describe("UI/UX phases 5–7 structural regression gates",()=>{
 it("supports finding courses and accessible, collapsible lesson modules",()=>{
   const page=read("frontend/src/app/(workspace)/courses/page.tsx");
   expect(page).toContain('type="search"');
   expect(page).toContain("item.title+");
   expect(page).toContain('className="sx-course-module"');
   expect(page).toContain("<summary>");
   expect(page).toContain('aria-expanded={openCourse===course.slug}');
   expect(page).toContain("No published course for this filter yet.");
 });
 it("makes practice challenges search/filterable without showing unrelated filtered questions",()=>{
   const lab=read("frontend/src/app/(workspace)/lab/page.tsx");
   expect(lab).toContain('const current=visible.find(');
   expect(lab).toContain('type="search"');
   expect(lab).toContain('aria-pressed={active===exercise.id}');
   expect(lab).toContain("No matching exercises");
   expect(lab).toContain('role="status"');
 });
 it("shows genuine task status and mission evidence on request",()=>{
   const planner=read("frontend/src/app/(workspace)/planner/page.tsx");
   expect(planner).toContain("setView");
   expect(planner).toContain('aria-pressed={view===value}');
   expect(planner).toContain("shownTasks.map");
   expect(planner).toContain("No tasks match");
   const missions=read("frontend/src/app/(workspace)/missions/page.tsx");
   expect(missions).toContain('className="sx-mission-details"');
   expect(missions).toContain('showPriorityOnly');
   expect(missions).toContain("Evidence is learner-reported");
 });
 it("preserves compact learning context and honest simulated results",()=>{
   const resources=read("frontend/src/app/(workspace)/resources/page.tsx");
   expect(resources).toContain('className="sx-resource-details"');
   expect(resources).toContain("FocusedLearningHub");
   const simulator=read("frontend/src/app/(workspace)/simulator/page.tsx");
   expect(simulator).toContain("hypothetical points (not a grade)");
   expect(simulator).not.toContain("projected measured points");
 });
 it("protects unsaved edits on module navigation across all five editors",()=>{
   const shell=read("frontend/src/components/admin-studio-workspace.tsx");
   for(const name of ["Guide","Roadmap","Course","Mission","Assessment"]){
     expect(shell).toContain("set"+name+"Dirty");
   }
   for(const [type,flag] of [["guides","guideDirty"],["roadmaps","roadmapDirty"],["courses","courseDirty"],["missions","missionDirty"],["assessments","assessmentDirty"]]){
     expect(shell).toContain('mode==="'+type+'"&&'+flag);
   }
   for(const name of ["guide","roadmap","course","mission","assessment"]){
     const editor=read("frontend/src/components/admin-"+name+"-editor.tsx");
     expect(editor,name).toContain("onDirtyChange");
     expect(editor,name).toContain('className="sx-admin-preview"');
     expect(editor,name).toContain('id="admin-save-actions"');
     expect(editor,name).toContain("Revision history · {history.length} entries");
     expect(editor,name).toContain('role="status"');
   }
 });
 it("uses real publishing revision for assessment preview and discloses draft scope",()=>{
   const assessment=read("frontend/src/components/admin-assessment-editor.tsx");
   expect(assessment).toContain("Boolean(current?.published_version)");
   expect(assessment).not.toContain("Boolean(current?.published)");
   const guide=read("frontend/src/components/admin-guide-editor.tsx");
   expect(guide).toContain("publish a valid version directly as an owner");
 });
 it("honors the same responsive layout and reduced-motion behavior on student and admin",()=>{
   const css=read("frontend/src/app/phase5-7-ux.css");
   const root=read("frontend/src/app/layout.tsx");
   expect(root).toContain('import "./phase5-7-ux.css"');
   for(const cls of [".sx-course-module",".sx-planner-view",".sx-lab-workspace",".sx-mission-details",".sx-resource-details",".sx-admin-preview",".admin-manager-tabs"])expect(css).toContain(cls);
   expect(css).toContain("@media(max-width:760px)");
   expect(css).toContain("@media(prefers-reduced-motion:reduce)");
   expect(css).toContain("scroll-margin-top:85px");
 });
});
