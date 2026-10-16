import { NextResponse } from "next/server";
import { checkRequestLimit } from "@skillmetry/backend/lib/security/request-rate-limit.server";

import { authCredentialsSchema, safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Cloud sign-in is not configured. Demo mode is still available." }, { status: 503 });
  }

  const parsed = authCredentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  }

  const limit = await checkRequestLimit("auth:sign-in", parsed.data.email, 12, 900);
  if (limit === "blocked") return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": "900" } });
  if (limit === "unavailable") return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error?.code === "email_not_confirmed") {
    return NextResponse.json(
      { error: "Email not confirmed. Open the verification email, then sign in again. You can request another confirmation email from Create account." },
      { status: 403 }
    );
  }
  if (error || !data.user) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  return NextResponse.json({ next: safeInternalPath(parsed.data.next) });
}
