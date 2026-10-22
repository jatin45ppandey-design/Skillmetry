"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CloudOff, Github, LockKeyhole } from "lucide-react";
import { getOAuthStartHref, type OAuthProvider } from "@skillmetry/shared/lib/social-oauth";
import { EmailConfirmationPanel } from "@/components/email-confirmation-panel";
import { ActivityIndicator, ActionSpinner } from "@/components/motion-ui";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({ mode, configured, nextPath, initialError, oauthProviders }:{ mode: AuthMode; configured: boolean; nextPath: string; initialError?: string; oauthProviders: readonly OAuthProvider[] }) {
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState<OAuthProvider | null>(null);
  const busy = pending || redirecting || connectingOAuth !== null;
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
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
      setRedirecting(true);
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
    <div className="auth-form-heading"><span className="auth-lock"><LockKeyhole aria-hidden="true"/></span><div><span className="eyebrow">My Account</span><h1>{isSignUp ? "Create your Skillmetry account" : "Welcome back"}</h1><p>{isSignUp ? "Save your career goal and create trusted assessment history." : "Load your career profile and server-graded results."}</p></div></div>
    {error ? <div className="auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div> : null}
    {oauthProviders.length ? <>
      <div className="auth-social-options" role="group" aria-label="Other sign-in methods">
        {oauthProviders.includes("google") ? <a className="auth-social-btn" href={getOAuthStartHref("google", nextPath)} aria-label="Continue with Google" aria-disabled={busy} onClick={e=>{if(busy)e.preventDefault();else setConnectingOAuth("google");}}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M21.35 12.22c0-.72-.06-1.24-.21-1.79H12v3.48h5.35a4.57 4.57 0 0 1-1.98 3l3.06 2.37c1.78-1.65 2.92-4.08 2.92-7.06Z"/>
            <path fill="#34A853" d="M12 21.6c2.63 0 4.83-.87 6.43-2.32l-3.06-2.37c-.85.57-1.94.91-3.37.91-2.59 0-4.78-1.75-5.56-4.1l-3.16 2.45A9.71 9.71 0 0 0 12 21.6Z"/>
            <path fill="#FBBC05" d="M6.44 13.72a5.82 5.82 0 0 1 0-3.72L3.28 7.55a9.6 9.6 0 0 0 0 8.62l3.16-2.45Z"/>
            <path fill="#EA4335" d="M12 6.19c1.44 0 2.72.49 3.74 1.47l2.8-2.8A9.47 9.47 0 0 0 12 2.4a9.72 9.72 0 0 0-8.72 5.15L6.44 10C7.22 7.64 9.41 6.19 12 6.19Z"/>
          </svg>
          Continue with Google
        </a> : null}
        {oauthProviders.includes("github") ? <a className="auth-social-btn" href={getOAuthStartHref("github", nextPath)} aria-label="Continue with GitHub" aria-disabled={busy} onClick={e=>{if(busy)e.preventDefault();else setConnectingOAuth("github");}}>
          <Github aria-hidden="true" size={20}/> Continue with GitHub
        </a> : null}
      </div>
      <div className="auth-social-divider"><span>or continue with email</span></div>
    </> : null}
    <label className="field">Email address<input className="input" name="email" type="email" autoComplete="email" maxLength={254} required disabled={busy}/></label>
    <label className="field">Password<input className="input" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} maxLength={128} required disabled={pending}/></label>
    <button className="btn btn-primary auth-submit" type="submit" disabled={busy} aria-busy={pending || redirecting}>
      {pending ? <ActionSpinner label={isSignUp ? "Creating account…" : "Signing in securely…"}/> :
        redirecting ? <ActionSpinner label="Opening your workspace…"/> :
        isSignUp ? "Create account" : "Sign in"}
    </button>
    {busy?<div className="motion-auth-progress"><ActivityIndicator compact secure
      label={connectingOAuth ? "Connecting your "+connectingOAuth+" account…" :
        redirecting ? "Session confirmed. Opening your private learning space…" :
        isSignUp ? "Creating your account securely…" : "Checking credentials securely…"}
      detail="Please keep this page open while this step completes."/></div>:null}
    {!isSignUp ? <p className="auth-switch"><Link href="/auth/forgot-password">Forgot your password?</Link></p> : null}
    <p className="auth-switch">{isSignUp ? "Already have an account?" : "New to Skillmetry?"} <Link href={`${isSignUp ? "/auth/sign-in" : "/auth/sign-up"}?next=${encodeURIComponent(nextPath)}`}>{isSignUp ? "Sign in" : "Create one"}</Link></p>
    <p className="auth-trust">Authentication is handled by Supabase. Numerical skill scores are created only by the server-side quiz grader.</p>
  </form>;
}
