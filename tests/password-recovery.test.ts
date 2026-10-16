import { describe, expect, it } from "vitest";
import { passwordRecoveryRequestSchema, passwordRecoveryUpdateSchema, safeInternalPath } from "@skillmetry/shared/lib/profile-schema";

describe("password recovery input boundaries", () => {
  it("accepts a valid email and rejects identity, tokens and scoring fields", () => {
    expect(passwordRecoveryRequestSchema.safeParse({ email: "learner@example.com" }).success).toBe(true);
    expect(passwordRecoveryRequestSchema.safeParse({ email: "invalid" }).success).toBe(false);
    expect(passwordRecoveryRequestSchema.safeParse({ email: "learner@example.com", userId: "another-owner" }).success).toBe(false);
    expect(passwordRecoveryRequestSchema.safeParse({ email: "learner@example.com", score: 100 }).success).toBe(false);
  });

  it("only accepts a bounded new password with no client-supplied user identity", () => {
    expect(passwordRecoveryUpdateSchema.safeParse({ password: "correct horse battery" }).success).toBe(true);
    expect(passwordRecoveryUpdateSchema.safeParse({ password: "short" }).success).toBe(false);
    expect(passwordRecoveryUpdateSchema.safeParse({ password: "x".repeat(129) }).success).toBe(false);
    expect(passwordRecoveryUpdateSchema.safeParse({ password: "safepassword", userId: "victim" }).success).toBe(false);
    expect(passwordRecoveryUpdateSchema.safeParse({ password: "safepassword", token: "forged" }).success).toBe(false);
  });

  it("keeps return destinations on the application origin", () => {
    expect(safeInternalPath("/assessments?assessment=python-foundations")).toBe("/assessments?assessment=python-foundations");
    expect(safeInternalPath("//evil.example")).toBe("/account");
    expect(safeInternalPath("https://evil.example")).toBe("/account");
  });
});
