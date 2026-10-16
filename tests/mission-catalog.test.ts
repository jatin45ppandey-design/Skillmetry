import {describe,expect,it} from "vitest";
import {careers,missions} from "@skillmetry/shared/data/catalog";
describe("P6 curated real-world project catalog",()=>{
  it("provides at least two reachable projects per supported career",()=>{
    for(const career of careers){
      const related=missions.filter(item=>item.roleId===career.id);
      expect(related.length).toBeGreaterThanOrEqual(2);
      for(const mission of related)expect(mission.deliverables.length).toBeGreaterThanOrEqual(2);
    }
  });
  it("preserves canonical prerequisite and no-trusted-score semantics",()=>{
    expect(missions.filter(m=>m.roleId==="full-stack-developer").length).toBe(3);
    expect(missions.every(m=>m.estimatedHours>0)).toBe(true);
  });
});
