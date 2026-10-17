"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Brand } from "@/components/brand";
import { ActionSpinner, ActionSuccess, ActivityIndicator } from "@/components/motion-ui";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) { setError(body.error ?? "Password recovery is unavailable."); return; }
      setMessage("If this email belongs to an account, a recovery link will arrive shortly.");
    } catch {
      setError("Network error. Please reconnect and try again.");
    } finally { setPending(false); }
  }
  return <main className="auth-shell">
    <nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/auth/sign-in">Back to sign in</Link></nav>
    <section className="auth-card"><form className="auth-form" onSubmit={requestReset}>
      <h1>Reset your password</h1>
      <p>Enter your account email. We will send you a private recovery link.</p>
      <label className="field">Email address<input className="input" type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} maxLength={254} required disabled={pending}/></label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      {message ? <ActionSuccess>{message}</ActionSuccess> : null}
      <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>{pending ? <ActionSpinner label="Sending recovery link…"/> : "Send recovery email"}</button>
      {pending ? <ActivityIndicator compact label="Requesting a private recovery email…"/> : null}
    </form></section>
  </main>;
}
