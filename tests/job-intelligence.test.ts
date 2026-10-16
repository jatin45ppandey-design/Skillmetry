import {describe,expect,it} from "vitest";
import {findCanonicalRequirements,analyzeJobDescription} from "@skillmetry/shared/lib/job-intelligence";
describe("P7 deterministic job requirement mapping",()=>{
 it("maps recognized skills and preserves genuine measured zero",()=>{
   const result=analyzeJobDescription("Need React, TypeScript, REST APIs and PostgreSQL.",{react:0,sql:82});
   expect(result.requirements.map(x=>x.skillId).sort()).toEqual(["react","rest-api","sql","typescript"]);
   expect(result.requirements.find(x=>x.skillId==="react")).toMatchObject({evidence:"measured",score:0,nextStep:"learning"});
   expect(result.requirements.find(x=>x.skillId==="typescript")).toMatchObject({evidence:"not-assessed",score:null});
 });
 it("does not mistake SQL for NoSQL or Java for JavaScript",()=>{
   const ids=findCanonicalRequirements("NoSQL, Java and Go developers").map(x=>x.skillId);
   expect(ids).not.toContain("sql");
   expect(ids).not.toContain("javascript");
 });
 it("does not claim placement odds",()=>{
   const x=analyzeJobDescription("Candidates with Python and Docker.",{});
   expect(JSON.stringify(x)).not.toMatch(/placement probability|hiring chance|employability score/i);
 });
});
