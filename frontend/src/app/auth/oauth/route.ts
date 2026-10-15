import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@skillmetry/backend/lib/supabase/server";
import { isSupabaseConfigured, requireSupabaseConfig } from "@/lib/supabase/config";
import { isOAuthProviderEnabled } from "@/lib/supabase/oauth-config.server";
import { parseOAuthProvider } from "@skillmetry/shared/lib/social-oauth";
import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const next = safeInternalPath(request.nextUrl.searchParams.get("next") ?? undefined);
  function backToSignIn(error: "oauth_unavailable" | "oauth_disabled" | "oauth_invalid") {
    const url = new URL("/auth/sign-in", request.url);
    url.searchParams.set("next", next);
    url.searchParams.set("error", error);
    return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
  }

  const provider = parseOAuthProvider(request.nextUrl.searchParams.get("provider"));
  if (!provider) return backToSignIn("oauth_invalid");
  if (!isSupabaseConfigured()) return backToSignIn("oauth_unavailable");
  if (!isOAuthProviderEnabled(provider)) return backToSignIn("oauth_disabled");

  const callbackUrl = new URL("/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() }
    });

    if (error || !data.url) return backToSignIn("oauth_unavailable");

    // Redirect only to our configured Supabase Auth endpoint, not arbitrary URLs.
    const destination = new URL(data.url);
    const supabaseOrigin = new URL(requireSupabaseConfig().url).origin;
    if (destination.origin !== supabaseOrigin || destination.pathname !== "/auth/v1/authorize") {
      return backToSignIn("oauth_unavailable");
    }
    return NextResponse.redirect(destination, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return backToSignIn("oauth_unavailable");
  }
}
