import {describe,expect,it} from "vitest";
import {buildWeeklyStudyPlan,resolveLearningActivity,weekStartUtc} from "@skillmetry/shared/lib/learning-plan";
import {defaultLearningPreferences} from "@skillmetry/shared/lib/profile-schema";
describe("P3 / P4 deterministic study planner",()=>{
  const learning=defaultLearningPreferences("frontend-developer");
  it("uses a stable UTC week and bounded schedule",()=>{
    expect(weekStartUtc(new Date("2026-10-16T12:00:00Z"))).toBe("2026-10-12");
    const input={learning,trustedScores:{javascript:35},hoursPerWeek:3,monday:"2026-10-12"};
    const tasks=buildWeeklyStudyPlan(input);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.reduce((sum,t)=>sum+t.estimatedMinutes,0)).toBeLessThanOrEqual(180);
    expect(tasks).toEqual(buildWeeklyStudyPlan(input));
    expect(new Set(tasks.map(t=>t.taskKey)).size).toBe(tasks.length);
    expect(tasks.every(t=>t.plannedDate>="2026-10-12"&&t.plannedDate<="2026-10-18")).toBe(true);
  });
  it("does not invent scores for a learner with no evidence",()=>{
    const tasks=buildWeeklyStudyPlan({learning,trustedScores:{},hoursPerWeek:2,monday:"2026-10-12"});
    expect(tasks.some(t=>t.kind==="learn")).toBe(true);
    expect(tasks.every(t=>t.status==="todo")).toBe(true);
  });
  it("keeps project, practice and learning activity separate from measured evidence",()=>{
    const tasks=buildWeeklyStudyPlan({learning,trustedScores:{},hoursPerWeek:2,monday:"2026-10-12"});
    const skillId=tasks[0].skillId;
    expect(resolveLearningActivity(skillId,tasks,new Set(),new Set())).toBe("planned");
    expect(resolveLearningActivity(skillId,tasks,new Set([skillId]),new Set())).toBe("practiced");
    expect(resolveLearningActivity(skillId,tasks,new Set(),new Set([skillId]))).toBe("project_submitted");
    expect(resolveLearningActivity("python",[],new Set(),new Set())).toBe("not_started");
  });
  it("validates the week boundary",()=>{
    expect(()=>buildWeeklyStudyPlan({learning,trustedScores:{},hoursPerWeek:3,monday:"2026-10-16"})).toThrow();
  });
});
