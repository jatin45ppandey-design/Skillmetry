# P1 atomic request throttling handoff

Default **off**: `SKILLMETRY_DB_RATE_LIMITING_ENABLED=false`. This commit adds server-only, SHA-256-keyed Postgres atomic buckets across application instances; it is not active until the new migration is approved, applied and the flag is explicitly enabled.

## Current guarded routes
- Auth sign-in: 12 requests / 15 minutes per normalized email.
- Auth sign-up: 4 requests / hour per normalized email.
- Password reset email: 3 requests / hour per normalized email.
- Authenticated assessment starts: 30 requests / hour per user.
- Authenticated assessment submissions: 40 requests / hour per user.

429 + Retry-After means the limit was exceeded; 503 is returned if the limiter is enabled but cannot reach its database function. With the flag off, current behavior remains unchanged. Keys are SHA-256 hashes of scoped account IDs or email addresses; no email address is stored in the rate-limit table.

## Required before production release
1. Explicitly approve and rehearse `202610160003_api_burst_limits.sql` on staging (after earlier pending migrations).
2. Verify service-only RPC execute permission and forced RLS, including multi-user isolation.
3. Load-test concurrent requests and the 429/recovery/error paths, then enable the server flag.
4. Configure trusted-edge IP-based abuse prevention separately (per-email keys cannot prevent attacks using many emails).
5. Install periodic cleanup of expired `api_burst_limit_windows` rows, monitoring, secret rotation and incident response.

No hosted Supabase schema, secrets, Auth providers or frontend flags are changed automatically.
