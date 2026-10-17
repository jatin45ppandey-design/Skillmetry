"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Brand } from "@/components/brand";
import { ActionSpinner, ActionSuccess, ActivityIndicator } from "@/components/motion-ui";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) { setError(body.error ?? "Password update failed."); return; }
      setSuccess(true); setPassword(""); setConfirm("");
    } catch {
      setError("Network error. Please reconnect and try again.");
    } finally { setPending(false); }
  }
  return <main className="auth-shell">
    <nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/auth/sign-in">Sign in</Link></nav>
    <section className="auth-card">{success ? <div className="auth-form">
      <h1>Password updated</h1><ActionSuccess>Your password was changed successfully.</ActionSuccess>
      <Link className="btn btn-primary" href="/auth/sign-in">Go to sign in</Link>
    </div> : <form className="auth-form" onSubmit={update}>
      <h1>Choose a new password</h1>
      <p>Open this page from your private email recovery link.</p>
      <label className="field">New password<input className="input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={event=>setPassword(event.target.value)} required disabled={pending}/></label>
      <label className="field">Confirm password<input className="input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirm} onChange={event=>setConfirm(event.target.value)} required disabled={pending}/></label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>{pending ? <ActionSpinner label="Securing new password…"/> : "Update password"}</button>
      {pending ? <ActivityIndicator compact secure label="Updating your private account password…"/> : null}
    </form>}</section>
  </main>;
}
