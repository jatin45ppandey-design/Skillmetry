import { NextResponse } from "next/server";
import { passwordRecoveryUpdateSchema } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Cloud password recovery is not configured." }, { status: 503 });
  }
  const parsed = passwordRecoveryUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a password between 8 and 128 characters." }, { status: 400 });
  }

  const supabase = await createClient();
  // getUser checks the session against Supabase Auth, not a user ID from the client.
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !user) {
    return NextResponse.json(
      { error: "This recovery link is invalid or expired. Request a new one." },
      { status: 401 }
    );
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return NextResponse.json({ error: "The password could not be updated. Request a new recovery link and retry." }, { status: 400 });
  }
  await supabase.auth.signOut();
  return NextResponse.json(
    { message: "Your password has been updated. Sign in with your new password." },
    { headers: { "Cache-Control": "no-store" } }
  );
}
