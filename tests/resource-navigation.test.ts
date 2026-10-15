import { describe, expect, it } from "vitest";
import { getResourceBrowseHref } from "@skillmetry/shared/lib/resource-intelligence";

describe("resource navigation contracts", () => {
  it("creates validated internal deep links for skills, tools, and canonical Docker", () => {
    expect(getResourceBrowseHref({ kind: "skill", skillId: "javascript" })).toBe("/resources?skill=javascript");
    expect(getResourceBrowseHref({ kind: "tool", toolId: "git" })).toBe("/resources?tool=git");
    expect(getResourceBrowseHref({ kind: "tool", toolId: "docker" })).toBe("/resources?skill=docker");
  });

  it("does not create a filtered route for unknown canonical IDs", () => {
    expect(getResourceBrowseHref({ kind: "skill", skillId: "unknown-skill" })).toBe("/resources");
  });
});
