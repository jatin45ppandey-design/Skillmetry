import { safeInternalPath } from "@skillmetry/shared/lib/profile-schema";

export const oauthProviders = ["google", "github"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

/** Browser-safe allowlist, also enforced by the server route. */
export function parseOAuthProvider(value: string | null): OAuthProvider | null {
  return value === "google" || value === "github" ? value : null;
}

/** Never send untrusted absolute URLs to the authorization route. */
export function getOAuthStartHref(provider: OAuthProvider, nextPath: string) {
  const params = new URLSearchParams({
    provider,
    next: safeInternalPath(nextPath)
  });
  return `/auth/oauth?${params.toString()}`;
}
