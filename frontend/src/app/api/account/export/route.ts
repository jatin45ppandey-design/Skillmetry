import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";

export const runtime = "nodejs";
const PAGE_SIZE = 250;
const MAX_ROWS_PER_TABLE = 10000;

const exportTables = [
  { name: "profiles", owner: "id", order: "id" },
  { name: "user_skills", owner: "user_id", order: "skill_id" },
  { name: "user_missions", owner: "user_id", order: "id" },
  { name: "assessment_attempts", owner: "user_id", order: "id" },
  { name: "assessment_question_reviews", owner: "user_id", order: "attempt_id", secondOrder: "ordinal", optionalMigration: true },
  { name: "evidence", owner: "user_id", order: "id" },
  { name: "scenario_runs", owner: "user_id", order: "id" },
  { name: "job_analyses", owner: "user_id", order: "id" },
  { name: "passport_settings", owner: "user_id", order: "user_id" },
  { name: "learning_plan_tasks", owner: "user_id", order: "id", optionalMigration: true },
  { name: "practice_lab_attempts", owner: "user_id", order: "id", optionalMigration: true },
  { name: "mission_work", owner: "user_id", order: "id", optionalMigration: true }
] as const;

export async function GET() {
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") {
    return NextResponse.json(
      { error: auth.status === "unconfigured" ? "Cloud accounts are unavailable." : "Sign in to export your private data." },
      { status: auth.status === "unconfigured" ? 503 : 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const records: Record<string, unknown[]> = {};
  const omitted: string[] = [];
  for (const table of exportTables) {
    const rows: unknown[] = [];
    for (let start = 0; start <= MAX_ROWS_PER_TABLE; start += PAGE_SIZE) {
      const query = auth.supabase
        .from(table.name)
        .select("*")
        .eq(table.owner, auth.userId)
        .order(table.order, { ascending: true });
      const { data, error } = "secondOrder" in table
        ? await query.order(table.secondOrder, { ascending: true }).range(start, start + PAGE_SIZE - 1)
        : await query.range(start, start + PAGE_SIZE - 1);
      if (error) {
        if ("optionalMigration" in table && ["PGRST205", "42P01"].includes(error.code ?? "")) {
          omitted.push(table.name + " (optional migration not present)");
          break;
        }
        return NextResponse.json({ error: "Export failed to retrieve all private records; no partial export was created." },
          { status: 503, headers: { "Cache-Control": "private, no-store" } });
      }
      rows.push(...(data ?? []));
      if ((data ?? []).length < PAGE_SIZE) break;
      if (rows.length >= MAX_ROWS_PER_TABLE) {
        return NextResponse.json({ error: "Your export is too large for an automatic download. Please contact support for an extended export." },
          { status: 413, headers: { "Cache-Control": "private, no-store" } });
      }
    }
    records[table.name] = rows;
  }

  const { data: authUser, error: userError } = await auth.supabase.auth.getUser();
  if (userError || !authUser.user || authUser.user.id !== auth.userId) {
    return NextResponse.json({ error: "Your account identity could not be verified for export." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
  const payload = {
    format: "skillmetry-account-export-v1",
    generatedAt: new Date().toISOString(),
    account: { id: auth.userId, email: authUser.user.email ?? null },
    records,
    omitted,
    limitations: "Does not include Supabase-managed authentication logs, storage objects or external provider records."
  };
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"skillmetry-account-export.json\"",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
