import { describe, expect, it } from "vitest";
import { getCareerRoadmapBrowseHref, getResourceBrowseHref } from "@skillmetry/shared/lib/resource-intelligence";

describe("resource navigation contracts", () => {
  it("creates validated internal deep links for skills, tools, and canonical Docker", () => {
    expect(getResourceBrowseHref({ kind: "skill", skillId: "javascript" })).toBe("/resources?skill=javascript");
    expect(getResourceBrowseHref({ kind: "tool", toolId: "git" })).toBe("/resources?tool=git");
    expect(getResourceBrowseHref({ kind: "tool", toolId: "docker" })).toBe("/resources?skill=docker");
  });

  it("creates a safe career-roadmap deep link without exposing external URLs", () => {
    expect(getCareerRoadmapBrowseHref("frontend-developer")).toBe("/resources?career=frontend-developer&format=roadmap");
    expect(getCareerRoadmapBrowseHref("ml-engineer")).toBe("/resources?career=ml-engineer&format=roadmap");
    expect(getCareerRoadmapBrowseHref("not-a-career" as "ml-engineer")).toBe("/resources");
  });

  it("does not create a filtered route for unknown canonical IDs", () => {
    expect(getResourceBrowseHref({ kind: "skill", skillId: "unknown-skill" })).toBe("/resources");
  });
});
