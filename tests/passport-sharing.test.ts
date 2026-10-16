import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const load=(path:string)=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),"utf8");
const schema=load("../database/supabase/migrations/202610160004_private_passport_sharing.sql");
const management=load("../frontend/src/app/api/passport/share/route.ts");
const publicRoute=load("../frontend/src/app/api/passport/public/[token]/route.ts");
describe("revocable opt-in passport sharing",()=>{
  it("stores only the hash of 32-byte random public tokens and expires after 30 days",()=>{
    expect(management).toContain("randomBytes(32)");
    expect(management).toContain('createHash("sha256")');
    expect(management).toContain("30 * 86400000");
    expect(management).toContain("includeName");
    expect(management).toContain("includeScores");
    expect(management).toContain('const sharePath = "/passport/s/" + token');
    expect(management).not.toContain("new URL(");
    expect(management).not.toContain("request.url");
  });
  it("does not grant anonymous access to private tables and restricts public RPC",()=>{
    expect(schema).toContain("force row level security");
    expect(schema).toContain("revoke all on public.passport_shares from public, anon, authenticated");
    expect(schema).toContain("s.revoked_at is null");
    expect(schema).toContain("s.expires_at > now()");
    expect(schema).toContain("grant execute on function public.read_public_passport(text) to anon, authenticated");
    expect(publicRoute).toContain("noindex, nofollow");
  });
  it("only shares whitelisted summaries, never emails, private attempts or project notes",()=>{
    expect(management).not.toContain("email:");
    expect(management).not.toContain("reflection");
    expect(management).toContain("createAdminClient");
    expect(schema).not.toContain("grant select, insert, update on public.passport_shares to authenticated");
    expect(schema).toContain("grant select on public.passport_shares to authenticated");
    expect(management).toContain("server_quiz");
  });
});
