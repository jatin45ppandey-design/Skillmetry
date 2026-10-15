import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@skillmetry/backend/lib/supabase/server";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Cloud authentication is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    return NextResponse.json({ error: "Sign-out could not be completed. Try again." }, { status: 503 });
  }

  return new NextResponse(null, { status: 204 });
}
