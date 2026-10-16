import { describe, expect, it } from "vitest";
import { careers, missions } from "@skillmetry/shared/data/catalog";
import { applyScenario, catalogIsValid, clamp, getNextSkills, getSkillGaps, getSkillState, getPrerequisiteEvidence, readiness, selectCareer } from "@skillmetry/shared/lib/readiness";

describe("curated career knowledge base", () => {
 it("has valid weights, references and an acyclic dependency graph",()=>expect(catalogIsValid()).toBe(true));
 it("includes the four supported career paths",()=>expect(careers).toHaveLength(4));
 it("keeps Full Stack weights on canonical skills and totals exactly 100",()=>{
  const fullStack=selectCareer("full-stack-developer");
  expect(fullStack.skills.reduce((sum, skill)=>sum+skill.weight,0)).toBe(100);
  expect(fullStack.skills.map(skill=>skill.skillId)).toEqual(["html","css","javascript","typescript","react","node","rest-api","sql","authentication","testing","docker","deployment"]);
 });
});
describe("readiness engine", () => {
 const role=selectCareer("ml-engineer");
 it("returns unknown for an empty profile instead of treating it as zero",()=>expect(readiness(role,{})).toBeNull());
 it("returns 100 when all role skills are 100",()=>expect(readiness(role,Object.fromEntries(role.skills.map(s=>[s.skillId,100])))).toBe(100));
 it("clamps out-of-range and invalid inputs",()=>{expect(clamp(-200)).toBe(0);expect(clamp(150)).toBe(100);expect(clamp(NaN)).toBe(0)});
 it("does not mutate input profile during what-if",()=>{
  const baseline={docker:10,python:80};const projection=applyScenario(baseline,[missions.find(m=>m.id==="dockerize")!]);
  expect(baseline.docker).toBe(10);expect(projection.docker).toBe(50);
 });
 it("clamps multiple gains at 100",()=>expect(applyScenario({docker:95},[missions.find(m=>m.id==="dockerize")!]).docker).toBe(100));
 it("prioritizes missing important skills",()=>expect(getSkillGaps(role,{}).length).toBe(role.skills.length));
 it("keeps assessment recommendations separate from numeric skill gaps",()=>{
  const [first]=getSkillGaps(role,{});
  expect(first.recommendation).toBe("assessment-recommended");
  expect(first.proficiency).toBeNull();
  expect(first.priority).toBeNull();
 });
 it("calculates a numeric gap only for an assessed skill",()=>{
  const python=getSkillGaps(role,{python:0}).find(item=>item.skillId==="python")!;
  expect(python.recommendation).toBe("skill-development");
  expect(python.proficiency).toBe(0);
  expect(typeof python.priority).toBe("number");
 });
 it("marks downstream skills blocked until prerequisites reach the threshold",()=>{
  expect(getSkillState("ml-foundations",{python:80,math:40,"data-processing":70})).toBe("blocked");
  expect(getSkillState("ml-foundations",{python:80,math:50,"data-processing":70})).toBe("unassessed");
 });
 it("does not block React solely because CSS has no available quiz",()=> {
  expect(getSkillState("react", {javascript:80,html:80})).toBe("unassessed");
  expect(getPrerequisiteEvidence("react",{javascript:80,html:80}).find(item=>item.skillId==="css")?.state).toBe("not-assessed");
  expect(getSkillState("react",{javascript:80,html:80,css:0})).toBe("blocked");
 });
 it("recommends only actionable, non-strong skills",()=>{
  const profile={python:80,math:60,"data-processing":65,"ml-foundations":50};
  const next=getNextSkills(role,profile,4);
  expect(next).toHaveLength(4);
  expect(next.every(item=>getSkillState(item.skillId,profile)!=="blocked" && (item.proficiency === null || item.proficiency<70))).toBe(true);
 });
 it("does not project a missing assessment from an assumed zero",()=>{
  expect(applyScenario({},[missions.find(m=>m.id==="dockerize")!])).toEqual({});
 });
});
