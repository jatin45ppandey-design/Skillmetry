"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Flame, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {ActivityIndicator} from "@/components/motion-ui";
import type { LearningStreakSummary } from "@skillmetry/shared/lib/learning-streak";

const enabled = process.env.NEXT_PUBLIC_LEARNING_STREAK_ENABLED === "true";

export function LearningStreakCard() {
  const { user, assessmentStatus } = useAuth();
  const ownerId = user?.id ?? null;
  type OwnerStreak = { ownerId: string; status: "loading" | "ready" | "error"; summary: LearningStreakSummary | null };
  const [result, setResult] = useState<OwnerStreak | null>(null);

  useEffect(() => {
    // A result is displayed only for the exact signed-in owner who requested it.
    // This prevents an account-switch flash of the previous user's private days.
    if (!enabled || !ownerId || assessmentStatus === "loading") return;
    const controller = new AbortController();
    const requestedOwner = ownerId;
    void (async () => {
      setResult({ownerId:requestedOwner, status:"loading", summary:null});
      try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
        const response = await fetch("/api/learning/streak?timeZone=" + encodeURIComponent(zone), {
          cache: "no-store", signal: controller.signal
        });
        if (!response.ok) throw new Error("streak_unavailable");
        const data = await response.json() as LearningStreakSummary;
        if (!controller.signal.aborted)
          setResult({ownerId:requestedOwner, status:"ready", summary:data});
      } catch {
        if (!controller.signal.aborted)
          setResult({ownerId:requestedOwner, status:"error", summary:null});
      }
    })();
    return () => controller.abort();
  }, [ownerId, assessmentStatus]);

  const owned = result?.ownerId === ownerId ? result : null;
  const streak = owned?.status === "ready" ? owned.summary : null;

  return <section className="sx-streak-card" aria-labelledby="sx-streak-heading">
    <div className="sx-panel-heading"><span className="sx-eyebrow"><Flame size={16} aria-hidden="true"/> LEARNING CONSISTENCY</span>
      <CalendarDays size={21} aria-hidden="true"/></div>
    <h2 id="sx-streak-heading">Every learning day counts.</h2>
    {!enabled ? <>
      <p>Streaks are being prepared for a secure release. Until then, each genuine quiz and coding practice still matters.</p>
      <span className="sx-small-muted">Calendar activates after the approved streak database rollout.</span>
    </> : !user ? <>
      <p>Sign in to see your learning days. Demo quiz results never count toward a real streak.</p>
      <Link href="/auth/sign-in?next=/dashboard" className="sx-inline-link">Sign in to track learning →</Link>
    </> : !owned || owned.status === "loading" ? <ActivityIndicator compact label="Checking your verified learning days…"/>
      : owned.status === "error" ? <p role="status">Streak details could not be loaded. Your quiz history is unchanged.</p>
      : streak ? <>
        <div className="sx-streak-numbers">
          <div><strong>{streak.currentStreak} {streak.currentStreak === 1 ? "day" : "days"}</strong><span>Current streak</span></div>
          <div><strong>{streak.longestStreak}</strong><span>Longest streak</span></div>
        </div>
        <div className="sx-streak-days" role="list" aria-label={"Recent verified learning days in " + streak.timeZone}>
          {streak.last7Days.map(day => <div key={day.date} role="listitem"
            className={"sx-streak-day " + (day.active ? "is-active" : "")}
            aria-label={day.date + (day.active ? ": Learning activity recorded" : ": No graded activity")}>
            <span>{new Date(day.date + "T12:00:00Z").toLocaleDateString("en-US",{timeZone:"UTC",weekday:"narrow"})}</span>
            <span className="sx-streak-mark" aria-hidden="true">{day.active ? "✓" : "·"}</span>
          </div>)}
        </div>
        <p>{streak.activeToday ? "You have already shown up today. Nice work." :
          streak.dueToday ? "A short quiz or practice exercise can extend your streak today." :
          "A graded quiz or practice exercise can start your next learning day."}</p>
        <span className="sx-small-muted"><ShieldCheck size={13} aria-hidden="true"/> Counts verified participation, not skill scores · {streak.timeZone}</span>
      </> : null}
  </section>;
}
