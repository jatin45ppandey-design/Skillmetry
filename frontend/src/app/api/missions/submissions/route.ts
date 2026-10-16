import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { missionSubmissionInputSchema, type MissionSubmission } from "@skillmetry/shared/lib/mission-evidence";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const fields = "mission_id,status,checked_deliverables,reflection,evidence_url,updated_at,submitted_at";

function toPublicRecord(row: Record<string, unknown>): MissionSubmission {
  return {
    missionId: String(row.mission_id),
    status: row.status === "submitted" ? "submitted" : "draft",
    checkedDeliverables: Array.isArray(row.checked_deliverables)
      ? row.checked_deliverables.filter((value): value is number => Number.isInteger(value))
      : [],
    reflection: typeof row.reflection === "string" ? row.reflection : "",
    evidenceUrl: typeof row.evidence_url === "string" ? row.evidence_url : null,
    updatedAt: String(row.updated_at),
    submittedAt: typeof row.submitted_at === "string" ? row.submitted_at : null
  };
}

export async function GET() {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud mission evidence is not configured." }, { status: 503 });
  if (auth.status === "unauthorized") return NextResponse.json({ error: "Sign in to view your project evidence." }, { status: 401 });
  const { data, error } = await auth.supabase.from("mission_submissions")
    .select(fields).eq("user_id", auth.userId).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Mission evidence is unavailable until the database setup is completed." }, { status: 503 });
  return NextResponse.json({ records: (data ?? []).map(toPublicRecord) }, { headers });
}

export async function POST(request: Request) {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud mission evidence is not configured." }, { status: 503 });
  if (auth.status === "unauthorized") return NextResponse.json({ error: "Sign in to save project work." }, { status: 401 });
  const parsed = missionSubmissionInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid mission work." }, { status: 400 });
  }
  const input = parsed.data;
  const existing = await auth.supabase.from("mission_submissions").select("status")
    .eq("user_id", auth.userId).eq("mission_id", input.missionId).maybeSingle();
  if (existing.error) return NextResponse.json({ error: "Mission evidence storage is unavailable." }, { status: 503 });
  if (existing.data?.status === "submitted") {
    return NextResponse.json({ error: "This project has already been submitted and cannot be changed." }, { status: 409 });
  }

  const values = {
    checked_deliverables: input.checkedDeliverables,
    reflection: input.reflection,
    evidence_url: input.evidenceUrl || null,
    status: input.action === "submit" ? "submitted" : "draft"
  };
  const query = existing.data
    ? auth.supabase.from("mission_submissions").update(values)
        .eq("user_id", auth.userId).eq("mission_id", input.missionId).eq("status", "draft")
    : auth.supabase.from("mission_submissions").insert({
        user_id: auth.userId, mission_id: input.missionId, ...values
      });
  const result = await query.select(fields).maybeSingle();
  if (result.error?.code === "23505" || !result.data && !result.error) {
    return NextResponse.json({ error: "Project work changed in another session. Reload and try again." }, { status: 409 });
  }
  if (result.error || !result.data) {
    return NextResponse.json({ error: "Project work could not be saved. Check the database setup." }, { status: 503 });
  }
  return NextResponse.json({ record: toPublicRecord(result.data) }, { headers });
}
