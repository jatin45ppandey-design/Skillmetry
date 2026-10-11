"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Cloud, CloudOff, LoaderCircle, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { StatusPill } from "@/components/workspace-ui";
import { useSkillmetry } from "@/store/use-skillmetry";

const statusCopy = {
  demo: "Local demo",
  loading: "Loading cloud profile",
  saving: "Saving claimed profile",
  synced: "Cloud synced",
  offline: "Offline — local changes kept",
  error: "Cloud sync needs attention"
} as const;

export function AccountPanel() {
  const { user, syncStatus, syncMessage, retrySync } = useAuth();
  const { name, careerId, skills, baselineSource, preferences, resetDemo } = useSkillmetry();
  const [signOutPending, setSignOutPending] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function signOut() {
    setSignOutPending(true);
    setSignOutError(null);
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" });
      if (!response.ok) throw new Error("sign_out_failed");
      resetDemo();
      window.location.assign("/");
    } catch {
      setSignOutError(navigator.onLine ? "Sign-out could not be completed. Try again." : "You are offline. Reconnect before signing out securely.");
      setSignOutPending(false);
    }
  }

  const statusTone = syncStatus === "synced" ? "success" : syncStatus === "error" || syncStatus === "offline" ? "warning" : "accent";
  return <div className="account-grid">
    <section className="panel account-summary"><div className="panel-header"><div><span className="eyebrow">Authenticated account</span><h2>{user?.email ?? "Skillmetry student"}</h2></div><ShieldCheck aria-hidden="true"/></div><div className="account-status"><StatusPill tone={statusTone}>{statusCopy[syncStatus]}</StatusPill>{syncStatus === "loading" || syncStatus === "saving" ? <LoaderCircle className="spin" aria-hidden="true"/> : syncStatus === "synced" ? <CheckCircle2 aria-hidden="true"/> : syncStatus === "offline" ? <CloudOff aria-hidden="true"/> : <Cloud aria-hidden="true"/>}</div><p className="note">{syncMessage ?? "Your session is validated on the server before private data is read."}</p>{syncStatus === "error" || syncStatus === "offline" ? <button className="btn btn-outline" type="button" onClick={retrySync}><RefreshCw aria-hidden="true"/>Retry sync</button> : null}</section>
    <section className="panel account-data"><div className="panel-header"><div><span className="eyebrow">Persisted student profile</span><h2>Claimed baseline</h2></div><Cloud aria-hidden="true"/></div><dl><div><dt>Student</dt><dd>{name}</dd></div><div><dt>Career</dt><dd>{careerId}</dd></div><div><dt>Claimed skills</dt><dd>{Object.keys(skills).length}</dd></div><div><dt>Weekly preference</dt><dd>{preferences.hoursPerWeek} hours</dd></div><div><dt>Source</dt><dd>{baselineSource === "self-reported" ? "Claimed · self-reported" : "Guided demo data"}</dd></div></dl><Link className="btn btn-outline" href="/onboarding">Edit claimed profile</Link></section>
    <section className="panel account-security"><h2>Trust boundaries</h2><p className="note">This account may save profile preferences and claimed proficiency. Assessment grades, demonstrated proficiency, verified status, and evidence-review decisions are read-only to students and require a trusted server process.</p><div className="trust-labels"><StatusPill>Claimed</StatusPill><StatusPill tone="accent">Assessed</StatusPill><StatusPill tone="success">Demonstrated</StatusPill><StatusPill tone="success">Verified</StatusPill></div>{signOutError ? <div className="auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{signOutError}</span></div> : null}<button className="btn btn-outline" type="button" disabled={signOutPending} onClick={signOut}>{signOutPending ? <LoaderCircle className="spin" aria-hidden="true"/> : <LogOut aria-hidden="true"/>}{signOutPending ? "Signing out…" : "Sign out securely"}</button></section>
  </div>;
}
