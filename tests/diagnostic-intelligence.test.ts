import { describe,expect,it } from "vitest";
import { buildTopicDiagnosis,getTopicResources,recommendedWeakTopics } from "@skillmetry/shared/lib/diagnostic-intelligence";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";

describe("D2 evidence-aware diagnosis",()=>{
  const topic=diagnosticTopics["javascript-foundations"][0].id;
  const row=(index:number,correct:boolean)=>({questionId:"q"+index,topicId:topic,difficulty:"beginner" as const,selectedIndex:correct?1:2,correctIndex:1,explanation:"Because.",ordinal:index});
  it("distinguishes no evidence and genuine zero scores",()=>{
    const empty=buildTopicDiagnosis("javascript-foundations",[]);
    expect(empty.every(x=>x.status==="insufficient-evidence" && x.percent===null)).toBe(true);
    const weak=buildTopicDiagnosis("javascript-foundations",[row(1,false),row(2,false),row(3,false)]);
    expect(weak[0]).toMatchObject({questions:3,correct:0,percent:0,status:"needs-practice"});
    expect(recommendedWeakTopics(weak)).toHaveLength(1);
    const limited=buildTopicDiagnosis("javascript-foundations",[row(1,false)]);
    expect(limited[0].status).toBe("insufficient-evidence");
  });
  it("maps weaknesses to the curated and allowlisted skill library",()=>{
    const resources=getTopicResources("javascript-foundations",topic);
    expect(resources.length).toBeGreaterThan(0);
    expect(resources.every(r=>r.url.startsWith("https://"))).toBe(true);
    expect(getTopicResources("javascript-foundations","invalid")).toEqual([]);
  });
});
