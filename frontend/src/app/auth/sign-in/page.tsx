import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

const errorMessages: Record<string, string> = {
  auth_unavailable: "Your session could not be verified. Check your connection and try again.",
  invalid_callback: "That confirmation link is invalid or expired. Request a new one from Supabase.",
  not_configured: "Cloud authentication is not configured for this deployment."
};

export default async function SignInPage({ searchParams }:{ searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  const nextPath = safeInternalPath(query.next);
  return <main className="auth-shell"><nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/dashboard">Use demo workspace</Link></nav><section className="auth-card"><AuthForm mode="sign-in" configured={isSupabaseConfigured()} nextPath={nextPath} initialError={query.error ? errorMessages[query.error] : undefined}/></section></main>;
}
