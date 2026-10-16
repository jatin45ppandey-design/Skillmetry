import {describe,expect,it} from "vitest";
import {buildTutorContext,localTutorGuidance} from "@skillmetry/shared/lib/tutor-guidance";
import {readFileSync} from "node:fs";import {fileURLToPath} from "node:url";
describe("P8 opt-in AI tutor",()=>{
 it("produces safe local guidance with curated references",()=>{
   const context=buildTutorContext("javascript");
   expect(context.skillId).toBe("javascript");
   expect(context.resources.length).toBeGreaterThan(0);
   const guided=localTutorGuidance("javascript","Explain Promise.all");
   expect(guided.mode).toBe("curated");
   expect(guided.disclaimer).toContain("No model was called");
 });
 it("requires explicit provider consent and server-side protected credentials",()=>{
   const src=readFileSync(fileURLToPath(new URL("../frontend/src/app/api/ai/tutor/route.ts",import.meta.url)),"utf8");
   expect(src).toContain("if(!useAI)");
   expect(src).toContain('SKILLMETRY_AI_TUTOR_ENABLED');
   expect(src).toContain('SKILLMETRY_DB_RATE_LIMITING_ENABLED');
   expect(src).toContain('checkRequestLimit("ai:tutor"');
   expect(src).not.toContain("NEXT_PUBLIC_GEMINI_API_KEY");
   expect(src).toContain("No email, session, user ID");
 });
});
