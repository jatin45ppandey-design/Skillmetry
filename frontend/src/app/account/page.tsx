import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CloudOff } from "lucide-react";
import { AccountPanel } from "@/components/account-panel";
import { Brand } from "@/components/brand";
import { getServerAuthState } from "@skillmetry/backend/lib/supabase/server";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const auth = await getServerAuthState();
  if (!auth.configured) {
    return <main className="auth-shell"><nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/dashboard">Demo workspace</Link></nav><section className="auth-card"><div className="auth-state"><CloudOff aria-hidden="true"/><h1>Cloud accounts are not configured</h1><p>Add your Supabase URL and publishable key. Skillmetry continues to work as an anonymous local demo without them.</p><Link className="btn btn-primary" href="/onboarding">Continue locally</Link></div></section></main>;
  }
  if (auth.error) {
    return <main className="auth-shell"><nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/dashboard">Demo workspace</Link></nav><section className="auth-card"><div className="auth-state"><CloudOff aria-hidden="true"/><h1>Account service unavailable</h1><p>Your private data was not loaded. Check your connection and sign in again; local demo data remains available.</p><Link className="btn btn-primary" href="/auth/sign-in?next=/account">Try sign-in again</Link></div></section></main>;
  }
  if (!auth.user) redirect("/auth/sign-in?next=/account");

  return <main className="account-shell"><nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/dashboard">Back to workspace</Link></nav><header className="account-heading"><span className="eyebrow">Account & cloud</span><h1>Your private Skillmetry profile</h1><p>Session identity is validated server-side. Career setup syncs privately and assessment grades remain server-controlled.</p></header><AccountPanel/></main>;
}
