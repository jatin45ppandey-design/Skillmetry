import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export async function GET(request: NextRequest) {
  const destination = safeInternalPath(request.nextUrl.searchParams.get("next") ?? undefined);
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const providerError = request.nextUrl.searchParams.get("error");
  const isConfirmationLink = Boolean(tokenHash && type === "email");
  const isRecoveryLink = Boolean(tokenHash && type === "recovery");
  if (!isSupabaseConfigured() || (!code && !isConfirmationLink && !isRecoveryLink)) {
    const failed = request.nextUrl.clone();
    failed.pathname = "/auth/sign-in";
    failed.search = "";
    failed.searchParams.set("error", !isSupabaseConfigured() ? "not_configured" : providerError ? "oauth_cancelled" : "invalid_callback");
    failed.searchParams.set("next", destination);
    return NextResponse.redirect(failed);
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: isRecoveryLink ? "recovery" : "email" });
  if (error) {
    const failed = request.nextUrl.clone();
    failed.pathname = "/auth/sign-in";
    failed.search = "";
    failed.searchParams.set("error", "oauth_callback_failed");
    failed.searchParams.set("next", destination);
    return NextResponse.redirect(failed);
  }

  // Recovery links must lead to the password form, not an arbitrary saved page.
  return NextResponse.redirect(new URL(isRecoveryLink ? "/auth/reset-password" : destination, request.url));
}
