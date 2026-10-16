import { describe, expect, it } from "vitest";
import { passwordResetRequestSchema, passwordUpdateSchema } from "@skillmetry/shared/lib/profile-schema";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
describe("password recovery contract", () => {
  it("validates an email-only recovery request", () => {
    expect(passwordResetRequestSchema.safeParse({email:"student@example.org"}).success).toBe(true);
    expect(passwordResetRequestSchema.safeParse({email:"bad",userId:"forged"}).success).toBe(false);
  });
  it("validates a password-only update", () => {
    expect(passwordUpdateSchema.safeParse({password:"a".repeat(12)}).success).toBe(true);
    expect(passwordUpdateSchema.safeParse({password:"short"}).success).toBe(false);
    expect(passwordUpdateSchema.safeParse({password:"longpassword",role:"admin"}).success).toBe(false);
  });
  it("does not build reset-email links from the request Host header", () => {
    const route = source("../frontend/src/app/api/auth/request-password-reset/route.ts");
    expect(route).toContain("SKILLMETRY_SITE_URL");
    expect(route).not.toContain("new URL(\"/auth/callback\", request.url)");
    expect(route).not.toContain("SUPABASE_SECRET_KEY");
    const callback = source("../frontend/src/app/auth/callback/route.ts");
    expect(callback).toContain('type === "recovery"');
  });
});
