import { beforeEach, describe, expect, it } from "vitest";
import { DEMO_SKILLS, useSkillmetry } from "@/store/use-skillmetry";

describe("local skill twin trust boundaries", () => {
  beforeEach(() => {
    useSkillmetry.setState({
      name:"Demo Student",
      careerId:"ml-engineer",
      skills:{...DEMO_SKILLS},
      baselineSource:"demo",
      attempts:[]
    });
  });

  it("records an assessment without mutating claimed proficiency", () => {
    const before = {...useSkillmetry.getState().skills};
    useSkillmetry.getState().recordAssessment({
      assessmentId:"python-intro",
      score:100,
      passed:true,
      attemptedAt:"2026-10-10T00:00:00.000Z"
    });

    expect(useSkillmetry.getState().skills).toEqual(before);
    expect(useSkillmetry.getState().attempts).toHaveLength(1);
  });
});
