import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {buildSpacedRevisionDates,curriculumTopicForDiagnostic,dateKeyInTimeZone,revisionTopicContext} from "@skillmetry/shared/lib/revision";

describe("Phase 3 deterministic revision",()=>{
  it("uses stable spaced intervals without producing mastery or scores",()=>{
    expect(buildSpacedRevisionDates("2026-10-23","needs-practice")).toEqual(["2026-10-24","2026-10-26","2026-10-30"]);
    expect(buildSpacedRevisionDates("2026-10-23","practice-selected")).toEqual(["2026-10-24","2026-10-27","2026-11-01"]);
    expect(dateKeyInTimeZone(new Date("2026-10-22T20:30:00Z"))).toBe("2026-10-23");
    expect(()=>buildSpacedRevisionDates("bad","developing")).toThrow("Invalid revision anchor date");
  });
  it("maps real diagnostic topics to lessons, practice and prerequisite recovery",()=>{
    const topic=curriculumTopicForDiagnostic("python-foundations","exceptions");
    expect(topic?.difficulty).toBe("advanced");
    const context=revisionTopicContext(topic!.id);
    expect(context?.lessonHref).toMatch(/^\/learn\/python\//);
    expect(context?.practiceHref).toContain(encodeURIComponent(topic!.id));
    expect(context?.prerequisites.length).toBeGreaterThan(0);
    expect(curriculumTopicForDiagnostic("python-foundations","not-real")).toBeNull();
  });
  it("keeps revision persistence owner-authenticated, same-origin and outside assessment writes",()=>{
    const route=readFileSync("frontend/src/app/api/learning/revision/route.ts","utf8");
    expect(route).toContain("authenticatedRequest");
    expect(route).toContain("Same-origin revision scheduling required");
    expect(route).toContain('from("learning_plan_tasks")');
    expect(route).not.toContain('from("assessment_attempts").insert');
    expect(route).not.toContain("complete_assessment_session");
  });
});
