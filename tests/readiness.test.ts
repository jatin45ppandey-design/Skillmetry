import { describe, expect, it } from "vitest";
import { careers, missions } from "@/data/catalog";
import { applyScenario, catalogIsValid, clamp, getNextSkills, getSkillGaps, getSkillState, readiness, selectCareer } from "@/lib/readiness";

describe("curated career knowledge base", () => {
 it("has valid weights, references and an acyclic dependency graph",()=>expect(catalogIsValid()).toBe(true));
 it("includes three career paths",()=>expect(careers).toHaveLength(3));
});
describe("readiness engine", () => {
 const role=selectCareer("ml-engineer");
 it("returns zero for an empty profile",()=>expect(readiness(role,{})).toBe(0));
 it("returns 100 when all role skills are 100",()=>expect(readiness(role,Object.fromEntries(role.skills.map(s=>[s.skillId,100])))).toBe(100));
 it("clamps out-of-range and invalid inputs",()=>{expect(clamp(-200)).toBe(0);expect(clamp(150)).toBe(100);expect(clamp(NaN)).toBe(0)});
 it("does not mutate input profile during what-if",()=>{
  const baseline={docker:10,python:80};const projection=applyScenario(baseline,[missions.find(m=>m.id==="dockerize")!]);
  expect(baseline.docker).toBe(10);expect(projection.docker).toBe(50);
 });
 it("clamps multiple gains at 100",()=>expect(applyScenario({docker:95},[missions.find(m=>m.id==="dockerize")!]).docker).toBe(100));
 it("prioritizes missing important skills",()=>expect(getSkillGaps(role,{}).length).toBe(role.skills.length));
 it("marks downstream skills blocked until prerequisites reach the threshold",()=>{
  expect(getSkillState("ml-foundations",{python:80,math:40,"data-processing":70})).toBe("blocked");
  expect(getSkillState("ml-foundations",{python:80,math:50,"data-processing":70})).toBe("available");
 });
 it("recommends only actionable, non-strong skills",()=>{
  const profile={python:80,math:60,"data-processing":65,"ml-foundations":50};
  const next=getNextSkills(role,profile,4);
  expect(next).toHaveLength(4);
  expect(next.every(item=>getSkillState(item.skillId,profile)!=="blocked" && item.proficiency<70)).toBe(true);
 });
});
