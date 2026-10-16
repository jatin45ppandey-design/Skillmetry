import "server-only";

/**
 * Canonical origin for authentication emails and OAuth callbacks.
 * Never use a remote request Host as the destination of an auth email.
 */
export function trustedSiteOrigin(request: Request): URL | null {
  const configured = process.env.SKILLMETRY_SITE_URL?.trim()
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "");
  if (configured) {
    try {
      const site = new URL(configured);
      const local = site.hostname === "localhost" || site.hostname === "127.0.0.1";
      if ((site.protocol !== "https:" && !(local && site.protocol === "http:"))
        || site.username || site.password || site.pathname !== "/" || site.search || site.hash) return null;
      return new URL(site.origin);
    } catch {
      return null;
    }
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const local = new URL(request.url);
      if (local.protocol === "http:" && ["localhost", "127.0.0.1"].includes(local.hostname)) {
        return new URL(local.origin);
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function trustedAuthCallback(request: Request, next: string): URL | null {
  const origin = trustedSiteOrigin(request);
  if (!origin) return null;
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", next);
  return callback;
}
