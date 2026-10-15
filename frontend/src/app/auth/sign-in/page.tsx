import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { enabledOAuthProviders } from "@/lib/supabase/oauth-config.server";

export const metadata: Metadata = { title: "Sign in" };

const errorMessages: Record<string, string> = {
  auth_unavailable: "Your session could not be verified. Check your connection and try again.",
  invalid_callback: "That confirmation link is invalid or expired. Return to Create account to request a new email.",
  not_configured: "Cloud authentication is not configured for this deployment.",
  oauth_unavailable: "Social sign-in is temporarily unavailable. Check the provider configuration or use email sign-in.",
  oauth_disabled: "That sign-in provider is not enabled yet. Use email sign-in or ask the site owner to configure it.",
  oauth_invalid: "Unsupported sign-in provider.",
  oauth_cancelled: "Google or GitHub sign-in was cancelled. You can try again or use email.",
  oauth_callback_failed: "Could not complete social sign-in. Please retry the same provider."
};

export default async function SignInPage({ searchParams }:{ searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  const nextPath = safeInternalPath(query.next);
  return <main className="auth-shell"><nav className="auth-nav"><Brand/><Link className="btn btn-quiet" href="/dashboard">Preview demo (no quizzes)</Link></nav><section className="auth-card"><AuthForm mode="sign-in" configured={isSupabaseConfigured()} oauthProviders={enabledOAuthProviders()} nextPath={nextPath} initialError={query.error ? errorMessages[query.error] : undefined}/></section></main>;
}
