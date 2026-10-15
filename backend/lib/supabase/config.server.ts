import "server-only";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  || "";

const SUPABASE_ELEVATED_KEY =
  process.env.SUPABASE_SECRET_KEY?.trim()
  || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
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

export function hasSupabaseServerCredentials() {
  return isSupabaseConfigured() && Boolean(SUPABASE_ELEVATED_KEY);
}

export function requireSupabaseServerConfig() {
  const { url } = requireSupabaseConfig();
  if (!SUPABASE_ELEVATED_KEY) {
    throw new Error("Supabase server credentials are not configured.");
  }
  return { url, elevatedKey: SUPABASE_ELEVATED_KEY };
}
