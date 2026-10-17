import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const read=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");
describe("Phase 4 unsaved draft navigation guards",()=>{
 it("asks before changing Admin Studio tabs with a modified mission draft",()=>{
   const studio=read("../frontend/src/components/admin-studio-workspace.tsx");
   expect(studio).toContain("missionDirty");
   expect(studio).toContain("Discard unsaved mission edits?");
   expect(studio).toContain("onDirtyChange={setMissionDirty}");
   expect(studio).not.toContain('onClick={()=>setMode("courses")}');
 });
 it("warns before a dirty mission is discarded by refresh or career change",()=>{
   const editor=read("../frontend/src/components/admin-mission-editor.tsx");
   expect(editor).toContain('window.addEventListener("beforeunload",warn)');
   expect(editor).toContain('window.removeEventListener("beforeunload",warn)');
   expect(editor).toContain("Changing careers resets the current draft.");
   expect(editor).toContain("onDirtyChange?.(changed)");
 });
});