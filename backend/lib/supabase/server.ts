import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { isSupabaseConfigured, requireSupabaseConfig } from "@skillmetry/backend/lib/supabase/config.server";
import type { ServerAuthState } from "@skillmetry/shared/types/auth";

export async function createClient() {
  const { url, publishableKey } = requireSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. middleware.ts performs refreshes.
        }
      }
    }
  });
}

export const getServerAuthState = cache(async (): Promise<ServerAuthState> => {
  if (!isSupabaseConfigured()) {
    return { configured: false, user: null, error: null };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const subject = data?.claims?.sub;

    if (error) {
      return { configured: true, user: null, error: "unavailable" };
    }

    if (typeof subject !== "string" || !subject) {
      return { configured: true, user: null, error: null };
    }

    const email = typeof data.claims.email === "string" ? data.claims.email : null;
    return { configured: true, user: { id: subject, email }, error: null };
  } catch {
    return { configured: true, user: null, error: "unavailable" };
  }
});
