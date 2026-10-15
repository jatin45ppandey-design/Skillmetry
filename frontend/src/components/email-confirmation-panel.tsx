"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";

export function EmailConfirmationPanel({ email, nextPath }: { email: string; nextPath: string }) {
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(token)) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, next: nextPath })
      });
      const result = await response.json() as { error?: string; next?: string };
      if (!response.ok) {
        setError(result.error ?? "Verification failed. Check the latest email and try again.");
        return;
      }
      window.location.assign(result.next ?? nextPath);
    } catch {
      setError("Verification is unavailable. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    setError(null);
    setNotice(null);
    setResendPending(true);
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next: nextPath })
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not request another confirmation email.");
        return;
      }
      setNotice("If your account still needs confirmation, another email has been requested. Check your inbox and spam folder.");
    } catch {
      setError("Could not request another email. Check your connection.");
    } finally {
      setResendPending(false);
    }
  }

  return <div className="auth-state auth-confirmation">
    <CheckCircle2 aria-hidden="true"/>
    <h2>Verify your email to start assessments</h2>
    <p>Confirmation instructions were sent to <strong>{email}</strong>. Open the verification link, or enter the six-digit code below if the email includes one.</p>
    <form className="auth-confirmation-form" onSubmit={verifyCode}>
      <label className="field">Six-digit email code
        <input className="input" name="confirmation-code" type="text" inputMode="numeric"
          value={token} onChange={event => setToken(event.target.value.replace(/\D/g, "").slice(0, 6))}
          pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="123456"
          disabled={pending || resendPending} required/>
      </label>
      <button className="btn btn-primary auth-submit" type="submit" disabled={pending || resendPending || token.length !== 6}>
        {pending ? <LoaderCircle className="spin" aria-hidden="true"/> : <LockKeyhole aria-hidden="true"/>}
        {pending ? "Verifying…" : "Verify and continue to assessments"}
      </button>
    </form>
    {error ? <div className="auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div> : null}
    {notice ? <p className="auth-confirmation-notice" role="status">{notice}</p> : null}
    <button type="button" className="btn btn-quiet" onClick={resendCode} disabled={resendPending || pending}>
      {resendPending ? "Requesting email…" : "Resend confirmation email"}
    </button>
    <Link className="auth-return-link" href={`/auth/sign-in?next=${encodeURIComponent(nextPath)}`}>
      Already verified? Sign in <ArrowRight aria-hidden="true"/>
    </Link>
    <p className="auth-confirmation-footnote">Demo mode only shows sample data. It does not unlock secure quizzes.</p>
  </div>;
}
