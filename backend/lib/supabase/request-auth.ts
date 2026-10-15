import "server-only";

import { isSupabaseConfigured } from "@skillmetry/backend/lib/supabase/config.server";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export async function authenticatedRequest() {
  if (!isSupabaseConfigured()) return { status: "unconfigured" as const };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string" || !userId) return { status: "unauthorized" as const };
  return { status: "authenticated" as const, supabase, userId };
}
