import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export async function GET(request: NextRequest) {
  const destination = safeInternalPath(request.nextUrl.searchParams.get("next") ?? undefined);
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const isConfirmationLink = Boolean(tokenHash && type === "email");
  if (!isSupabaseConfigured() || (!code && !isConfirmationLink)) {
    const failed = request.nextUrl.clone();
    failed.pathname = "/auth/sign-in";
    failed.search = "";
    failed.searchParams.set("error", isSupabaseConfigured() ? "invalid_callback" : "not_configured");
    return NextResponse.redirect(failed);
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: "email" });
  if (error) {
    const failed = request.nextUrl.clone();
    failed.pathname = "/auth/sign-in";
    failed.search = "";
    failed.searchParams.set("error", "invalid_callback");
    return NextResponse.redirect(failed);
  }

  return NextResponse.redirect(new URL(destination, request.url));
}
