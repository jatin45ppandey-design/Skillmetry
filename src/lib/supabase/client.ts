"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const { url, publishableKey } = requireSupabaseConfig();
  browserClient ??= createBrowserClient(url, publishableKey);
  return browserClient;
}
