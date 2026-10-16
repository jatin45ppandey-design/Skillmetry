import { NextResponse } from "next/server";
import { passwordUpdateSchema } from "@skillmetry/shared/lib/profile-schema";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";

export async function POST(request: Request) {
  const auth = await authenticatedRequest();
  if (auth.status === "unconfigured") return NextResponse.json({ error: "Cloud authentication is unavailable." }, { status: 503 });
  if (auth.status !== "authenticated") return NextResponse.json({ error: "Your recovery link has expired. Request another reset email." }, { status: 401 });
  const parsed = passwordUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a password between 8 and 128 characters." }, { status: 400 });
  const { error } = await auth.supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return NextResponse.json({ error: "The password could not be updated. Request a fresh reset link." }, { status: 400 });
  return NextResponse.json({ updated: true }, { headers: { "Cache-Control": "private, no-store" } });
}
