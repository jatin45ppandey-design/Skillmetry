import { NextResponse } from "next/server";
import { emailConfirmationOtpSchema, safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Cloud authentication is not configured." }, { status: 503 });
  }
  const parsed = emailConfirmationOtpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the valid six-digit code from your verification email." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email"
  });
  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: "This code is invalid or expired. Check the latest email or request a new confirmation." }, { status: 400 });
  }
  return NextResponse.json(
    { next: safeInternalPath(parsed.data.next) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
