import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@skillmetry/backend/lib/supabase/admin";
import { hasSupabaseServerCredentials } from "@skillmetry/backend/lib/supabase/config.server";

export type RateLimitResult = "allow" | "blocked" | "unavailable";

/**
 * Server-side atomic throttling across instances when enabled. Default OFF
 * until the staged PostgreSQL migration is explicitly approved and applied.
 * The database holds only an irreversible SHA-256 token, never raw email/IP.
 */
export async function checkRequestLimit(
  scope: string,
  subject: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (process.env.SKILLMETRY_DB_RATE_LIMITING_ENABLED !== "true") return "allow";
  if (!hasSupabaseServerCredentials()) return "unavailable";
  if (!Number.isInteger(maxRequests) || maxRequests < 1 || maxRequests > 1000
      || !Number.isInteger(windowSeconds) || windowSeconds < 60 || windowSeconds > 86400) return "unavailable";
  const key = createHash("sha256").update(scope + ":" + subject.toLowerCase()).digest("hex");
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("try_consume_api_burst", {
      p_key_hash: key,
      p_window_seconds: windowSeconds,
      p_limit: maxRequests
    });
    if (error || typeof data !== "boolean") return "unavailable";
    return data ? "allow" : "blocked";
  } catch {
    return "unavailable";
  }
}
