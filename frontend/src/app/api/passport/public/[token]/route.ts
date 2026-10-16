import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@skillmetry/backend/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Public passport is unavailable." }, { status: 503 });
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({ error: "Passport not found." }, { status: 404 });
  const hash = createHash("sha256").update(token).digest("hex");
  const client = await createClient();
  const { data, error } = await client.rpc("read_public_passport", { p_token_hash: hash });
  if (error) return NextResponse.json({ error: "Public passport is unavailable." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Passport not found or link expired." }, { status: 404 });
  return NextResponse.json({ passport: data }, {
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" }
  });
}
