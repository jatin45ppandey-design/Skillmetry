import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, requireSupabaseConfig } from "@/lib/supabase/config";

const protectedPrefixes = ["/account"];

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const { url, publishableKey } = requireSupabaseConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const isProtected = protectedPrefixes.some(prefix => request.nextUrl.pathname.startsWith(prefix));
  let subject: string | undefined;
  let validationFailed = false;

  try {
    const { data, error } = await supabase.auth.getClaims();
    subject = typeof data?.claims?.sub === "string" ? data.claims.sub : undefined;
    validationFailed = Boolean(error);
  } catch {
    validationFailed = true;
  }

  if (isProtected && (validationFailed || !subject)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth/sign-in";
    signInUrl.search = "";
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    if (validationFailed) signInUrl.searchParams.set("error", "auth_unavailable");
    return NextResponse.redirect(signInUrl);
  }

  return response;
}
