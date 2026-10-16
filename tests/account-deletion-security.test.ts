import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const route=readFileSync(fileURLToPath(new URL("../frontend/src/app/api/account/deletion/route.ts",import.meta.url)),"utf8");
describe("irreversible account deletion gates",()=>{
  it("requires opt-in, current password, account ownership and server-only admin client",()=>{
    expect(route).toContain('ACCOUNT_DELETION_ENABLED !== "true"');
    expect(route).toContain('z.literal("DELETE MY ACCOUNT")');
    expect(route).toContain("authenticatedRequest()");
    expect(route).toContain("auth.getUser()");
    expect(route).toContain("signInWithPassword");
    expect(route).toContain("confirmed.data.user?.id !== auth.userId");
    expect(route).toContain("createAdminClient().auth.admin.deleteUser(auth.userId)");
  });
  it("does not accept arbitrary identity or claim deletion on errors",()=>{
    expect(route).not.toContain("parsed.data.userId");
    expect(route).toContain("if (deleted.error)");
    expect(route).toContain("hasSupabaseServerCredentials()");
  });
});
