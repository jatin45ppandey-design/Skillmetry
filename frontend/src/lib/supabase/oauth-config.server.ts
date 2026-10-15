import "server-only";

import { oauthProviders, type OAuthProvider } from "@skillmetry/shared/lib/social-oauth";

/**
 * Read only by server routes/components. Enable after configuring the
 * corresponding provider Client ID and Secret inside Supabase Auth.
 * No provider client secrets belong in Next.js or NEXT_PUBLIC_* variables.
 */
export function isOAuthProviderEnabled(provider: OAuthProvider): boolean {
  if (provider === "google") return process.env.GOOGLE_OAUTH_ENABLED === "true";
  return process.env.GITHUB_OAUTH_ENABLED === "true";
}

export function enabledOAuthProviders(): OAuthProvider[] {
  return oauthProviders.filter(isOAuthProviderEnabled);
}
