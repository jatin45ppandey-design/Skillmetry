import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const load=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");
const route=load("../frontend/src/app/api/github/repository/route.ts");
const status=load("../frontend/src/app/api/github/connection/route.ts");
const panel=load("../frontend/src/components/github-connection-panel.tsx");
describe("GitHub link and provenance trust boundaries",()=>{
  it("matches provider ID to GitHub repository owner ID, not a user-submitted login",()=>{
    expect(route).toContain("identity_data as Record<string,unknown>");
    expect(route).toContain("result.owner.id");
    expect(route).toContain("linkedGitHubOwner");
    expect(route).toContain("not who wrote the code");
  });
  it("does not delete the only connected sign-in method and requires verified owner",()=>{
    expect(status).toContain("authenticatedRequest()");
    expect(status).toContain("data.user?.id!==auth.userId");
    expect(status).toContain("unlinkIdentity(identity)");
    expect(status).toContain("Add another sign-in method");
  });
  it("uses explicit user consent and no private repository tokens",()=>{
    expect(panel).toContain('auth.linkIdentity');
    expect(panel).toContain('provider:"github"');
    expect(panel).toContain("Disconnect GitHub");
    expect(route).not.toContain("GITHUB_PRIVATE_TOKEN");
  });
});
