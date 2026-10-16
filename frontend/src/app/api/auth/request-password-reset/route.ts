import { NextResponse } from "next/server";
import { checkRequestLimit } from "@skillmetry/backend/lib/security/request-rate-limit.server";

import { passwordResetRequestSchema } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

/** A fixed origin prevents attacker-controlled Host headers entering reset emails. */
function recoveryRedirect(): URL | null {
  const configured = process.env.SKILLMETRY_SITE_URL?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    const local = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return null;
    const callback = new URL("/auth/callback", url);
    callback.searchParams.set("next", "/auth/update-password");
    return callback;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Cloud authentication is not configured." }, { status: 503 });
  const callback = recoveryRedirect();
  if (!callback) return NextResponse.json({ error: "Password recovery has not been configured for this deployment." }, { status: 503 });
  const parsed = passwordResetRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const limit = await checkRequestLimit("auth:reset", parsed.data.email, 3, 3600);
  if (limit === "blocked") return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
  if (limit === "unavailable") return NextResponse.json({ error: "Password recovery is temporarily unavailable." }, { status: 503 });

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: callback.toString()
  });
  if (error?.status === 429) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  if (error) return NextResponse.json({ error: "The reset request could not be processed. Try again later." }, { status: 503 });
  // The public response must not reveal whether an address has an account.
  return NextResponse.json({ requested: true }, { headers: { "Cache-Control": "no-store" } });
}
