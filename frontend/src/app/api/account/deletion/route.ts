import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { createAdminClient } from "@skillmetry/backend/lib/supabase/admin";
import { hasSupabaseServerCredentials } from "@skillmetry/backend/lib/supabase/config.server";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const schema = z.object({
  confirmation: z.literal("DELETE MY ACCOUNT"),
  password: z.string().min(8).max(128)
}).strict();

export async function GET() {
  return NextResponse.json({
    enabled: process.env.ACCOUNT_DELETION_ENABLED === "true" && hasSupabaseServerCredentials(),
    method: "Verified email/password account only"
  }, { headers });
}

export async function POST(request: Request) {
  if (process.env.ACCOUNT_DELETION_ENABLED !== "true" || !hasSupabaseServerCredentials()) {
    return NextResponse.json({ error: "Self-service account deletion is disabled until security verification is complete." }, { status: 503 });
  }
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated") return NextResponse.json({ error: "Sign in before deleting your account." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your current password and exact deletion confirmation." }, { status: 400 });
  const { data: current, error: currentError } = await auth.supabase.auth.getUser();
  if (currentError || !current.user?.email || current.user.id !== auth.userId) {
    return NextResponse.json({ error: "The account could not be reverified. Sign in again." }, { status: 401 });
  }
  // A session alone is insufficient; revalidate the existing password with Supabase.
  const confirmed = await auth.supabase.auth.signInWithPassword({
    email: current.user.email, password: parsed.data.password
  });
  if (confirmed.error || confirmed.data.user?.id !== auth.userId) {
    return NextResponse.json({ error: "Current account password could not be verified. OAuth-only accounts need a separate assisted flow." }, { status: 403 });
  }
  // The admin client is server-only. On Storage ownership failures, do not claim success.
  const deleted = await createAdminClient().auth.admin.deleteUser(auth.userId);
  if (deleted.error) return NextResponse.json({ error: "Account deletion could not be completed. Check Storage ownership or request assisted deletion." }, { status: 503 });
  try { await auth.supabase.auth.signOut(); } catch { /* Account already removed. */ }
  return NextResponse.json({ deleted: true }, { headers });
}
