export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  || "";

export function isSupabaseConfigured() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return false;
  try {
    const url = new URL(SUPABASE_URL);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  return { url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY };
}
