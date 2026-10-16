import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";
import { trustedSiteOrigin } from "@skillmetry/backend/lib/security/site-origin.server";

export async function GET(request: NextRequest) {
  const site = trustedSiteOrigin(request);
  if (!site) return NextResponse.json({ error: "Authentication callback origin is not configured." }, { status: 503 });
  const type = request.nextUrl.searchParams.get("type");
  const destination = type === "recovery" ? "/auth/update-password" : safeInternalPath(request.nextUrl.searchParams.get("next") ?? undefined);
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const providerError = request.nextUrl.searchParams.get("error");
  const isConfirmationLink = Boolean(tokenHash && (type === "email" || type === "recovery"));
  if (!isSupabaseConfigured() || (!code && !isConfirmationLink)) {
    const failed = new URL(request.nextUrl.pathname, site);
    failed.pathname = "/auth/sign-in";
    failed.search = "";
    failed.searchParams.set("error", !isSupabaseConfigured() ? "not_configured" : providerError ? "oauth_cancelled" : "invalid_callback");
    failed.searchParams.set("next", destination);
    return NextResponse.redirect(failed);
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type === "recovery" ? "recovery" : "email" });
  if (error) {
    const failed = request.nextUrl.clone();
    failed.pathname = "/auth/sign-in";
    failed.search = "";
    failed.searchParams.set("error", "oauth_callback_failed");
    failed.searchParams.set("next", destination);
    return NextResponse.redirect(failed);
  }

  return NextResponse.redirect(new URL(destination, site));
}
