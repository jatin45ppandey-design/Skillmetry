import { NextResponse } from "next/server";
import { cloudProfileInputSchema } from "@/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

async function authenticatedClient() {
  if (!isSupabaseConfigured()) return { status: "unconfigured" as const };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string") return { status: "unauthorized" as const };
  return { status: "authenticated" as const, supabase, userId };
}

export async function GET() {
  const auth = await authenticatedClient();
  if (auth.status === "unconfigured") {
    return NextResponse.json({ error: "Cloud persistence is not configured." }, { status: 503 });
  }
  if (auth.status === "unauthorized") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const [profileResult, skillsResult] = await Promise.all([
    auth.supabase
      .from("profiles")
      .select("display_name,target_career_id,hours_per_week,onboarding_completed,onboarding_preferences,updated_at")
      .eq("id", auth.userId)
      .maybeSingle(),
    auth.supabase
      .from("user_skills")
      .select("skill_id,claimed_proficiency,demonstrated_proficiency,evidence_confidence,verified_status")
      .eq("user_id", auth.userId)
  ]);

  if (profileResult.error || skillsResult.error) {
    return NextResponse.json({ error: "Your cloud profile is temporarily unavailable." }, { status: 503 });
  }

  if (!profileResult.data) {
    return NextResponse.json({ profile: null }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const rawPreferences = profileResult.data.onboarding_preferences;
  const preferences = typeof rawPreferences === "object" && rawPreferences !== null && !Array.isArray(rawPreferences)
    ? rawPreferences
    : {};
  const claimedSkills = Object.fromEntries(
    (skillsResult.data ?? []).map(row => [row.skill_id, row.claimed_proficiency])
  );
  const trustedSignals = (skillsResult.data ?? []).map(row => ({
    skillId: row.skill_id,
    demonstratedProficiency: row.demonstrated_proficiency,
    evidenceConfidence: row.evidence_confidence,
    verified: row.verified_status
  }));

  return NextResponse.json({
    profile: {
      displayName: profileResult.data.display_name,
      careerId: profileResult.data.target_career_id,
      onboardingCompleted: profileResult.data.onboarding_completed,
      preferences: {
        hoursPerWeek: profileResult.data.hours_per_week ?? preferences.hoursPerWeek ?? 6,
        roadmapView: preferences.roadmapView ?? "graph"
      },
      claimedSkills,
      trustedSignals,
      updatedAt: profileResult.data.updated_at
    }
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient();
  if (auth.status === "unconfigured") {
    return NextResponse.json({ error: "Cloud persistence is not configured." }, { status: 503 });
  }
  if (auth.status === "unauthorized") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = cloudProfileInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Profile data is invalid.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const profileValues = {
    display_name: parsed.data.displayName,
    target_career_id: parsed.data.careerId,
    hours_per_week: parsed.data.preferences.hoursPerWeek,
    onboarding_completed: parsed.data.onboardingCompleted,
    onboarding_preferences: parsed.data.preferences
  };
  const existingProfile = await auth.supabase.from("profiles").select("id").eq("id", auth.userId).maybeSingle();
  if (existingProfile.error) {
    return NextResponse.json({ error: "Your profile could not be saved." }, { status: 503 });
  }

  const profileWrite = existingProfile.data
    ? await auth.supabase.from("profiles").update(profileValues).eq("id", auth.userId)
    : await auth.supabase.from("profiles").insert({ id: auth.userId, ...profileValues });
  if (profileWrite.error) {
    return NextResponse.json({ error: "Your profile could not be saved." }, { status: 503 });
  }

  const existingSkillsResult = await auth.supabase
    .from("user_skills")
    .select("skill_id")
    .eq("user_id", auth.userId);
  if (existingSkillsResult.error) {
    return NextResponse.json({ error: "Your skill claims could not be saved." }, { status: 503 });
  }

  const existingSkillIds = new Set((existingSkillsResult.data ?? []).map(row => row.skill_id));
  const entries = Object.entries(parsed.data.claimedSkills);
  const inserts = entries
    .filter(([skillId]) => !existingSkillIds.has(skillId))
    .map(([skillId, claimedProficiency]) => ({
      user_id: auth.userId,
      skill_id: skillId,
      claimed_proficiency: claimedProficiency
    }));
  const updates = entries.filter(([skillId]) => existingSkillIds.has(skillId));

  if (inserts.length) {
    const { error } = await auth.supabase.from("user_skills").insert(inserts);
    if (error) return NextResponse.json({ error: "Your skill claims could not be saved." }, { status: 503 });
  }

  const updateResults = await Promise.all(updates.map(([skillId, claimedProficiency]) =>
    auth.supabase
      .from("user_skills")
      .update({ claimed_proficiency: claimedProficiency })
      .eq("user_id", auth.userId)
      .eq("skill_id", skillId)
  ));
  if (updateResults.some(result => result.error)) {
    return NextResponse.json({ error: "Some skill claims could not be saved." }, { status: 503 });
  }

  return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "private, no-store" } });
}
