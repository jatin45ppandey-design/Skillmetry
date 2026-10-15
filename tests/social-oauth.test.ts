import { describe, expect, it } from "vitest";
import { getOAuthStartHref, parseOAuthProvider } from "@skillmetry/shared/lib/social-oauth";

describe("Google and GitHub OAuth entry contracts", () => {
  it("accepts only supported social providers", () => {
    expect(parseOAuthProvider("google")).toBe("google");
    expect(parseOAuthProvider("github")).toBe("github");
    for (const value of ["", "twitter", "GitHub", "google%0a", "google.com", null]) {
      expect(parseOAuthProvider(value)).toBeNull();
    }
  });

  it("preserves selected assessments and rejects off-site return redirects", () => {
    expect(getOAuthStartHref("github", "/assessments?assessment=sql-foundations"))
      .toBe("/auth/oauth?provider=github&next=%2Fassessments%3Fassessment%3Dsql-foundations");
    expect(getOAuthStartHref("google", "//evil.example"))
      .toBe("/auth/oauth?provider=google&next=%2Faccount");
    expect(getOAuthStartHref("github", "https://evil.example"))
      .toBe("/auth/oauth?provider=github&next=%2Faccount");
  });
});
