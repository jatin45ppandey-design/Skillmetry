import { NextResponse } from "next/server";
import { checkRequestLimit } from "@skillmetry/backend/lib/security/request-rate-limit.server";

import { authCredentialsSchema, safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Cloud sign-up is not configured. Demo mode is still available." }, { status: 503 });
  }

  const parsed = authCredentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  }

  const limit = await checkRequestLimit("auth:sign-up", parsed.data.email, 4, 3600);
  if (limit === "blocked") return NextResponse.json({ error: "Too many sign-up requests. Retry later." }, { status: 429, headers: { "Retry-After": "3600" } });
  if (limit === "unavailable") return NextResponse.json({ error: "Sign-up is temporarily unavailable." }, { status: 503 });

  const next = safeInternalPath(parsed.data.next);
  const callbackUrl = new URL("/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: callbackUrl.toString() }
  });

  if (error) {
    return NextResponse.json({ error: "We could not create this account. Check the details or try signing in." }, { status: 400 });
  }

  return NextResponse.json({
    next,
    confirmationRequired: !data.session
  });
}
