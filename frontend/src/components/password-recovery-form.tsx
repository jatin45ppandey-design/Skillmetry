"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CloudOff, LoaderCircle, LockKeyhole } from "lucide-react";

type Props = { mode: "request" | "update"; configured: boolean; nextPath: string };

export function PasswordRecoveryForm({ mode, configured, nextPath }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const requesting = mode === "request";
  const signInHref = `/auth/sign-in?next=${encodeURIComponent(nextPath)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (!requesting && password !== form.get("confirmPassword")) {
      setError("The passwords do not match.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        requesting ? "/api/auth/password-reset/request" : "/api/auth/password-reset/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requesting ? { email: form.get("email") } : { password })
        }
      );
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) {
        setError(result.error ?? "Password recovery is temporarily unavailable.");
      } else {
        setSuccess(result.message ?? "Your request has been processed.");
      }
    } catch {
      setError(navigator.onLine ? "Password recovery is temporarily unavailable." : "You are offline. Reconnect and retry.");
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return <div className="auth-state" role="status"><CloudOff aria-hidden="true" />
      <h2>Cloud accounts are not configured</h2>
      <p>Password recovery needs Supabase Auth. The anonymous demo does not have a password.</p>
      <Link className="btn btn-primary" href="/dashboard">Explore the demo <ArrowRight aria-hidden="true" /></Link>
    </div>;
  }

  return <form className="auth-form" onSubmit={submit}>
    <div className="auth-form-heading">
      <span className="auth-lock"><LockKeyhole aria-hidden="true" /></span>
      <div><span className="eyebrow">Private account recovery</span>
        <h1>{requesting ? "Reset your password" : "Choose a new password"}</h1>
        <p>{requesting ? "Enter your account email. We will send a link if an account exists." :
          "Use the secure recovery link from your email. Your new password must have at least 8 characters."}</p>
      </div>
    </div>
    {error ? <div className="auth-error" role="alert"><AlertCircle aria-hidden="true" /><span>{error}</span></div> : null}
    {success ? <div className="auth-state" role="status"><p>{success}</p>
      <Link className="btn btn-primary" href={signInHref}>Return to sign in <ArrowRight aria-hidden="true" /></Link>
    </div> : <>
      {requesting ? <label className="field">Email address
        <input className="input" name="email" type="email" autoComplete="email" maxLength={254} required disabled={pending} />
      </label> : <>
        <label className="field">New password
          <input className="input" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required disabled={pending} />
        </label>
        <label className="field">Confirm new password
          <input className="input" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required disabled={pending} />
        </label>
      </>}
      <button className="btn btn-primary auth-submit" type="submit" disabled={pending}>
        {pending ? <LoaderCircle className="spin" aria-hidden="true" /> : null}
        {pending ? "Processing securely…" : requesting ? "Send reset link" : "Update password"}
      </button>
    </>}
    <p className="auth-switch"><Link href={signInHref}>Back to sign in</Link></p>
    <p className="auth-trust">Recovery is handled by Supabase Auth. No assessment history or trusted scores are changed.</p>
  </form>;
}
