import { NextResponse } from "next/server";
import { passwordRecoveryRequestSchema } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Cloud password recovery is not configured." }, { status: 503 });
  }
  const parsed = passwordRecoveryRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const redirect = new URL("/auth/callback", request.url);
  redirect.searchParams.set("next", "/auth/reset-password");
  try {
    const supabase = await createClient();
    // Supabase Auth owns recovery-email throttling and destination allowlisting.
    // Never reveal whether the supplied address belongs to a real account.
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: redirect.toString()
    });
  } catch {
    // Keep the outcome independent of account existence and SMTP response.
  }
  return NextResponse.json(
    { message: "If an account exists for that address, check your email for a password-reset link." },
    { headers: { "Cache-Control": "no-store" } }
  );
}
