import { NextResponse } from "next/server";
import { careerIdSchema, cloudProfileInputSchema, normalizeOnboardingPreferences } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

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

  const profileResult = await auth.supabase
    .from("profiles")
    .select("display_name,target_career_id,hours_per_week,onboarding_completed,onboarding_preferences,updated_at")
    .eq("id", auth.userId)
    .maybeSingle();

  if (profileResult.error) {
    return NextResponse.json({ error: "Your cloud profile is temporarily unavailable." }, { status: 503 });
  }

  if (!profileResult.data) {
    return NextResponse.json({ profile: null }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const career = careerIdSchema.safeParse(profileResult.data.target_career_id);
  if (!career.success) {
    return NextResponse.json({ error: "Your cloud profile has an unsupported career selection." }, { status: 503 });
  }
  const rawPreferences = profileResult.data.onboarding_preferences;
  const storedPreferences = typeof rawPreferences === "object" && rawPreferences !== null && !Array.isArray(rawPreferences)
    ? rawPreferences as Record<string, unknown>
    : {};
  const preferences = normalizeOnboardingPreferences({
    ...storedPreferences,
    hoursPerWeek: profileResult.data.hours_per_week ?? storedPreferences.hoursPerWeek ?? 6
  }, career.data);
  return NextResponse.json({
    profile: {
      displayName: profileResult.data.display_name,
      careerId: career.data,
      onboardingCompleted: profileResult.data.onboarding_completed,
      preferences,
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

  return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "private, no-store" } });
}
