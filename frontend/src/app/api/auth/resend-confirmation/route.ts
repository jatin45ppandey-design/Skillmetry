import { NextResponse } from "next/server";
import { resendSignupConfirmationSchema, safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";
import { trustedAuthCallback, trustedSiteOrigin } from "@skillmetry/backend/lib/security/site-origin.server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Cloud authentication is not configured." }, { status: 503 });
  }
  const parsed = resendSignupConfirmationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }
  const callbackUrl = trustedAuthCallback(request, safeInternalPath(parsed.data.next));
  if (!callbackUrl) return NextResponse.json({ error: "Email redirect origin is not configured." }, { status: 503 });
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: callbackUrl.toString() }
  });
  if (error) {
    if (error.status === 429) {
      return NextResponse.json({ error: "Please wait before requesting another confirmation email." }, { status: 429 });
    }
    return NextResponse.json({ error: "Confirmation email could not be requested. Try again later." }, { status: 503 });
  }
  return NextResponse.json({ requested: true }, { headers: { "Cache-Control": "private, no-store" } });
}
