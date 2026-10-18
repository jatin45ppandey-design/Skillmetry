import {describe,it,expect} from "vitest";
import {analyzeJobDescription,findUnknownRequirements} from "@skillmetry/shared/lib/job-intelligence";
import type {SkillMap} from "@skillmetry/shared/types/domain";

describe("job description unknown requirements",()=>{
  it("surfaces explicit unfamiliar technologies for human review",()=>{
    expect(findUnknownRequirements("Experience with AWS, Kubernetes, and Terraform."))
      .toEqual(["AWS","Kubernetes","Terraform"]);
  });
  it("does not classify recognized canonical skills as unknown",()=>{
    expect(findUnknownRequirements("Proficient in Python and SQL.")).toEqual([]);
  });
  it("keeps unknown requirements separate from measured evidence",()=>{
    const result=analyzeJobDescription(
      "Experience with Python and Kubernetes.",
      {} as SkillMap
    );
    expect(result.requirements.map(item=>item.skillId)).toContain("python");
    expect(result.unknownRequirements).toEqual(["Kubernetes"]);
    expect(result.requirements.every(item=>item.score===null)).toBe(true);
    expect(result.summary).toContain("human review");
  });
  it("does not infer unknown requirements from unrelated prose",()=>{
    expect(findUnknownRequirements("We offer a supportive team and flexible hours.")).toEqual([]);
  });
});
