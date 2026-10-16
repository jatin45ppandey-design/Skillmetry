import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
describe("trusted authentication redirect origins", () => {
  it("rejects untrusted request hosts for email and OAuth callbacks", () => {
    const helper = read("../backend/lib/security/site-origin.server.ts");
    expect(helper).toContain("SKILLMETRY_SITE_URL");
    expect(helper).toContain("VERCEL_PROJECT_PRODUCTION_URL");
    expect(helper).toContain('process.env.NODE_ENV === "development"');
    expect(helper).toContain('["localhost", "127.0.0.1"]');
  });
  it("uses the canonical callback URL across signup, email resend and OAuth", () => {
    for (const path of ["../frontend/src/app/api/auth/sign-up/route.ts",
                        "../frontend/src/app/api/auth/resend-confirmation/route.ts",
                        "../frontend/src/app/auth/oauth/route.ts"]) {
      expect(read(path)).toContain("trustedAuthCallback(request,");
      expect(read(path)).not.toContain('new URL("/auth/callback", request.url)');
    }
    expect(read("../frontend/src/app/auth/callback/route.ts")).toContain("trustedSiteOrigin(request)");
  });
});
