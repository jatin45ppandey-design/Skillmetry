import {describe,expect,it} from "vitest";
import {normalizeMissionWork} from "@skillmetry/shared/lib/mission-work";
const draft={missionId:"react-dashboard",status:"in_progress" as const,completedIndices:[0],
  repositoryUrl:"",demoUrl:"",notes:"Building project"};
describe("P6 learner project evidence",()=>{
  it("allows private work-in-progress checklists without inventing a skill score",()=>{
    expect(normalizeMissionWork(draft).completedIndices).toEqual([0]);
    expect(Object.keys(normalizeMissionWork(draft))).not.toContain("score");
  });
  it("requires all deliverables and evidence before submission",()=>{
    expect(()=>normalizeMissionWork({...draft,status:"submitted"})).toThrow();
    const submitted=normalizeMissionWork({...draft,status:"submitted",completedIndices:[1,0],
      repositoryUrl:"https://github.com/example/example-repo"});
    expect(submitted.status).toBe("submitted");
    expect(submitted.completedIndices).toEqual([0,1]);
  });
  it("rejects forged IDs, duplicate indices and unsafe project links",()=>{
    expect(()=>normalizeMissionWork({...draft,missionId:"fake-mission"})).toThrow();
    expect(()=>normalizeMissionWork({...draft,completedIndices:[0,0]})).toThrow();
    expect(()=>normalizeMissionWork({...draft,repositoryUrl:"http://github.com/test/repo"})).toThrow();
    expect(()=>normalizeMissionWork({...draft,demoUrl:"https://localhost:3000"})).toThrow();
  });
});
