import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
describe("private account export contract", () => {
  it("uses authenticated owner scope and no-store, never a service-role client", () => {
    const code = read("../frontend/src/app/api/account/export/route.ts");
    expect(code).toContain("authenticatedRequest()");
    expect(code).toContain(".eq(table.owner, auth.userId)");
    expect(code).toContain('Cache-Control": "private, no-store"');
    expect(code).not.toContain("createAdminClient");
    expect(code).not.toContain("NEXT_PUBLIC_SUPABASE_SECRET");
  });
  it("supports bounded pagination instead of silently discarding large data sets", () => {
    const code = read("../frontend/src/app/api/account/export/route.ts");
    expect(code).toContain("MAX_ROWS_PER_TABLE");
    expect(code).toContain(".range(start, start + PAGE_SIZE - 1)");
    expect(code).toContain(".order(table.order, { ascending: true })");
    expect(code).toContain('secondOrder: "ordinal"');
    expect(code).toContain("no partial export was created");
    expect(code).toContain("assessment_question_reviews");
  });
});
