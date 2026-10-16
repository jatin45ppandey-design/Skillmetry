import { NextResponse } from "next/server";
import { pilotFeedbackSchema } from "@skillmetry/shared/lib/pilot-feedback";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const auth = await authenticatedRequest();
  if (auth.status !== "authenticated")
    return NextResponse.json({ error: "Sign in to submit voluntary feedback." }, { status: 401 });
  const parsed = pilotFeedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a rating and a valid feedback area." }, { status: 400 });
  const result = await auth.supabase.from("pilot_feedback").insert({
    user_id: auth.userId, ...parsed.data
  });
  if (result.error?.code === "23505")
    return NextResponse.json({ error: "One response per student per day. Thanks for your previous feedback!" }, { status: 409 });
  if (result.error)
    return NextResponse.json({ error: "Feedback storage is unavailable until its migration is approved." }, { status: 503 });
  return NextResponse.json({ submitted: true,
    notice: "Thanks for your feedback. It does not affect grades, progress or career recommendations." },
    { headers: { "Cache-Control": "private, no-store" } });
}
