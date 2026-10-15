import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requireSupabaseServerConfig } from "@skillmetry/backend/lib/supabase/config.server";

export function createAdminClient() {
  const { url, elevatedKey } = requireSupabaseServerConfig();
  return createClient(url, elevatedKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false }
  });
}
