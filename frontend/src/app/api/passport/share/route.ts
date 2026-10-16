import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const payload = z.object({ includeName: z.boolean(), includeScores: z.boolean() }).strict();

export async function GET() {
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") return NextResponse.json({ error: "Sign in to manage sharing." }, { status: 401 });
  const { data, error } = await auth.supabase.from("passport_shares")
    .select("expires_at,revoked_at,created_at").eq("user_id", auth.userId).maybeSingle();
  if (error) return NextResponse.json({ error: "Passport sharing is not available until database setup is complete." }, { status: 503 });
  return NextResponse.json({
    active: Boolean(data && !data.revoked_at && new Date(data.expires_at).getTime() > Date.now()),
    expiresAt: data?.expires_at ?? null
  }, { headers });
}

export async function POST(request: Request) {
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") return NextResponse.json({ error: "Sign in before sharing your Passport." }, { status: 401 });
  const parsed = payload.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose which information to share." }, { status: 400 });
  const profile = await auth.supabase.from("profiles")
    .select("display_name,target_career_id").eq("id", auth.userId).maybeSingle();
  if (profile.error || !profile.data) return NextResponse.json({ error: "Complete your cloud profile before sharing." }, { status: 409 });
  const currentProfile = profile.data;
  const career = careers.find(item => item.id === currentProfile.target_career_id);
  if (!career) return NextResponse.json({ error: "Choose a valid career first." }, { status: 409 });

  const snapshot: {
    schema: string; title: string; career: string; disclaimer: string;
    name?: string; measuredSkills?: { name: string; score: number; completedAt: string }[];
  } = {
    schema: "skillmetry-passport-v1",
    title: "Career learning snapshot",
    career: career.title,
    disclaimer: "Student-consented snapshot. Quiz performance is not a certification, career-readiness score or employment prediction."
  };
  if (parsed.data.includeName) snapshot.name = currentProfile.display_name;
  if (parsed.data.includeScores) {
    const history = await auth.supabase.from("assessment_attempts")
      .select("skill_id,score,completed_at,id")
      .eq("user_id", auth.userId).eq("grading_method", "server_quiz")
      .order("completed_at", { ascending: false }).order("id", { ascending: false }).limit(100);
    if (history.error) return NextResponse.json({ error: "Trusted quiz history is temporarily unavailable." }, { status: 503 });
    const known = new Set<string>();
    snapshot.measuredSkills = (history.data ?? []).filter(item => {
      if (known.has(item.skill_id) || !skillById[item.skill_id]) return false;
      known.add(item.skill_id);
      return true;
    }).slice(0,18).map(item => ({
      name: skillById[item.skill_id].label,
      score: Number(item.score), completedAt: String(item.completed_at)
    }));
  }

  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
  // Each student has one active link; rotating replaces the old hash/snapshot.
  const saved = await auth.supabase.from("passport_shares").upsert({
    user_id: auth.userId, token_hash: hash, snapshot, expires_at: expiresAt,
    created_at: new Date().toISOString(), revoked_at: null
  }, { onConflict: "user_id" }).select("user_id").single();
  if (saved.error) return NextResponse.json({ error: "Passport share could not be saved. Verify database migration and RLS." }, { status: 503 });

  const shareUrl = new URL("/passport/s/" + token, request.url).toString();
  return NextResponse.json({ shareUrl, expiresAt,
    notice: "Only selected fields are visible. Generating another link revokes the previous one." }, { headers });
}

export async function DELETE() {
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") return NextResponse.json({ error: "Sign in to revoke sharing." }, { status: 401 });
  const result = await auth.supabase.from("passport_shares")
    .update({ revoked_at: new Date().toISOString() }).eq("user_id", auth.userId);
  if (result.error) return NextResponse.json({ error: "Share could not be revoked." }, { status: 503 });
  return NextResponse.json({ revoked: true }, { headers });
}
