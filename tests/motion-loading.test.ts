import {describe,expect,it} from "vitest";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
const read=(file:string)=>readFileSync(fileURLToPath(new URL(file,import.meta.url)),"utf8");

describe("Meaningful loading, not fake progress",()=>{
 it("has semantic status, skeletons and reduced motion styling",()=>{
   const widgets=read("../frontend/src/components/motion-ui.tsx");
   const css=read("../frontend/src/app/motion-system.css");
   expect(widgets).toContain('role="status"');
   expect(widgets).toContain('aria-busy="true"');
   expect(widgets).toContain("ContentSkeleton");
   expect(widgets).not.toContain("setInterval");
   expect(css).toContain("prefers-reduced-motion:reduce");
   expect(css).toContain("motion-route-progress");
 });
 it("shows navigation progress but expires a stuck indicator",()=>{
   const nav=read("../frontend/src/components/navigation-progress.tsx");
   expect(nav).toContain("setTimeout");
   expect(nav).toContain("12000");
   expect(nav).toContain("popstate");
   expect(nav).toContain("event.metaKey");
   expect(nav).toContain("event.ctrlKey");
   expect(nav).toContain('role="status"');
 });
 it("auth forms preserve secure action states and avoid double submit",()=>{
   const auth=read("../frontend/src/components/auth-form.tsx");
   const email=read("../frontend/src/components/email-confirmation-panel.tsx");
   expect(auth).toContain("if (busy) return;");
   expect(auth).toContain("disabled={busy}");
   expect(auth).toContain("redirecting");
   expect(auth).toContain('setConnectingOAuth("google")');
   expect(auth).toContain("Signing in securely");
   expect(email).toContain("Verifying email");
   expect(email).toContain("ActionSuccess");
   for(const route of ["forgot-password","update-password"]){
     const page=read("../frontend/src/app/auth/"+route+"/page.tsx");
     expect(page).toContain("ActionSpinner");
     expect(page).toContain("role=\"alert\"");
   }
 });
 it("works with real process states, not simulated loading promises",()=>{
   const routes=["planner","lab","missions","jobs","tutor","passport","assessments","dashboard","practice"];
   for(const route of routes){
     const s=read("../frontend/src/app/(workspace)/"+route+"/page.tsx");
     expect(s,route).toContain("ActivityIndicator");
   }
   const quiz=read("../frontend/src/app/(workspace)/assessments/page.tsx");
   expect(quiz).toContain("Grading and saving your answers");
   const settings=read("../frontend/src/app/(workspace)/settings/page.tsx");
   expect(settings).toContain("Cloud confirmation is not yet available");
   expect(settings).toContain('syncStatus==="saving"');
   expect(settings).toContain('syncStatus==="synced"');
   const sim=read("../frontend/src/app/(workspace)/simulator/page.tsx");
   expect(sim).not.toContain("Simulating your grade");
 });
 it("has route fallbacks without corrupting revoked public-link HTTP status",()=>{
   const pages=[
    "../frontend/src/app/(workspace)/loading.tsx",
    "../frontend/src/app/auth/loading.tsx",
    "../frontend/src/app/account/loading.tsx",
    "../frontend/src/app/onboarding/loading.tsx"];
   for(const path of pages)expect(read(path)).toContain("ContentSkeleton");
   expect(existsSync(new URL("../frontend/src/app/passport/share/[token]/loading.tsx",import.meta.url))).toBe(false);
   expect(existsSync(new URL("../frontend/src/app/loading.tsx",import.meta.url))).toBe(false);
 });
});
