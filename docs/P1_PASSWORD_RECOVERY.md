# P1 password recovery implementation

- Forgot-password form: `/auth/forgot-password`.
- POST `/api/auth/request-password-reset` sends a Supabase recovery email without disclosing whether a user exists.
- Recovery callback supports the token_hash `recovery` type or PKCE code path.
- Reset form: `/auth/update-password`, calling authenticated `POST /api/auth/update-password`.
- Request and password fields are strictly validated. No password or reset token is placed in application logs.
- The email link uses the explicitly configured `SKILLMETRY_SITE_URL`, not an untrusted request host. HTTPS required outside localhost.

## Configuration required before real users
1. Set `SKILLMETRY_SITE_URL=https://your-deployment-domain` in server-only deployment settings.
2. Add the canonical `https://your-deployment-domain/auth/callback` URL to Supabase Auth redirect allowlist.
3. Verify configured outbound recovery email and password recovery template.
4. Validate expired/replayed links, normal sessions, and cross-device recovery in staging.
5. Configure auth email rate limits and general distributed burst controls separately.

No hosted Auth configuration is changed by this commit.
