"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CloudOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { EmailConfirmationPanel } from "@/components/email-confirmation-panel";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({ mode, configured, nextPath, initialError }:{ mode: AuthMode; configured: boolean; nextPath: string; initialError?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          next: nextPath
        })
      });
      const result = await response.json() as { error?: string; next?: string; confirmationRequired?: boolean };
      if (!response.ok) {
        setError(result.error ?? "Authentication is temporarily unavailable.");
        return;
      }
      if (result.confirmationRequired) {
        setVerificationEmail(String(form.get("email") ?? "").trim());
        return;
      }
      window.location.assign(result.next ?? "/account");
    } catch {
      setError(navigator.onLine ? "Authentication is temporarily unavailable." : "You are offline. Reconnect to sign in.");
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return <div className="auth-state" role="status"><CloudOff aria-hidden="true"/><h2>Cloud accounts are not configured</h2><p>Add the public Supabase project settings to enable real authentication. The local demo cannot unlock secure assessments.</p><Link className="btn btn-primary" href="/onboarding">Preview local demo <ArrowRight aria-hidden="true"/></Link></div>;
  }

  if (verificationEmail) {
    return <EmailConfirmationPanel email={verificationEmail} nextPath={nextPath}/>;
  }

  return <form className="auth-form" onSubmit={submit}>
    <div className="auth-form-heading"><span className="auth-lock"><LockKeyhole aria-hidden="true"/></span><div><span className="eyebrow">Private cloud workspace</span><h1>{isSignUp ? "Create your Skillmetry account" : "Welcome back"}</h1><p>{isSignUp ? "Save your career goal and create trusted assessment history." : "Load your career profile and server-graded results."}</p></div></div>
    {error ? <div className="auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div> : null}
    <label className="field">Email address<input className="input" name="email" type="email" autoComplete="email" maxLength={254} required disabled={pending}/></label>
    <label className="field">Password<input className="input" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} maxLength={128} required disabled={pending}/></label>
    <button className="btn btn-primary auth-submit" type="submit" disabled={pending}>{pending ? <LoaderCircle className="spin" aria-hidden="true"/> : null}{pending ? "Checking securely…" : isSignUp ? "Create account" : "Sign in"}</button>
    <p className="auth-switch">{isSignUp ? "Already have an account?" : "New to Skillmetry?"} <Link href={`${isSignUp ? "/auth/sign-in" : "/auth/sign-up"}?next=${encodeURIComponent(nextPath)}`}>{isSignUp ? "Sign in" : "Create one"}</Link></p>
    <p className="auth-trust">Authentication is handled by Supabase. Numerical skill scores are created only by the server-side quiz grader.</p>
  </form>;
}
