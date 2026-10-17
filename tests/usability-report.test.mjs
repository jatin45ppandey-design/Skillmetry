import {describe,it,expect} from "vitest";
import {summarizeUsability} from "../scripts/analyze-usability-feedback.mjs";

const response=(complete,difficulty,note="")=>({study:"skillmetry-usability-v1",
  general:"Private note must not appear in aggregation",
  answers:[{taskId:"dashboard",complete,difficulty,note},
  {taskId:"dashboard",complete:"no",difficulty:5,note:"duplicate must not count"},
  {taskId:"unknown-task",complete:"yes",difficulty:1,note:"unknown must not count"}]});
describe("Local opt-in student research summaries",()=>{
 it("aggregates task results without transmitting or exposing notes",()=>{
   const result=summarizeUsability([
     response("yes",2,"secret personal narrative"),
     response("no",4,"private message"),
     response("partly",3)
   ]);
   expect(result.exportsAnalyzed).toBe(3);
   expect(result.uniqueParticipantsNotVerifiable).toBe(true);
   const item=result.summary.find(x=>x.task==="dashboard");
   expect(item).toMatchObject({tested:3,completed:1,failed:1,partly:1,
     completionRate:33,meanDifficulty:3});
   expect(JSON.stringify(result)).not.toContain("secret");
   expect(JSON.stringify(result)).not.toContain("private message");
   expect(result.notStatisticallyRepresentative).toBe(true);
 });
 it("ignores unknown formats, duplicate answers and out-of-range difficulty",()=>{
   const result=summarizeUsability([
     {study:"other",answers:[{taskId:"admin",complete:"yes",difficulty:3}]},
     {study:"skillmetry-usability-v1",answers:[{taskId:"course",complete:"yes",difficulty:8}]}
   ]);
   expect(result.exportsAnalyzed).toBe(1);
   const course=result.summary.find(x=>x.task==="course");
   expect(course.tested).toBe(1);
   expect(course.meanDifficulty).toBeNull();
 });
});
