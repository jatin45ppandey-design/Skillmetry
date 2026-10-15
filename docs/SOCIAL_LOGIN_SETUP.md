# Skillmetry social sign-in — Google and GitHub

Skillmetry uses **Supabase Auth** as the sole session authority. Google/GitHub OAuth adds new sign-in methods, not another assessment-scoring system or user database. The app exchanges the OAuth PKCE code in `frontend/src/app/auth/callback/route.ts` and keeps the original sanitized `next` path (for example, `/assessments`).

## 1. Set provider credentials in Supabase (never in Git)

Go to Supabase Dashboard → **Authentication → Sign In / Providers** (or Providers, depending on Dashboard UI).

- **Google:** Create a *Web application* OAuth client in the [Google Cloud Auth Platform](https://console.cloud.google.com/auth/clients), with the required consent screen/test users. Authorized JavaScript origin for local app: `http://localhost:3000`. Google **Authorized redirect URI** should be the **Supabase provider callback**, not the Next.js application callback:
  `https://<your-project-ref>.supabase.co/auth/v1/callback`.
  In Supabase → Providers → Google, enable the provider and securely enter its Client ID and Client Secret.
- **GitHub:** GitHub → Settings → Developer settings → OAuth Apps → New OAuth App. Set the Homepage URL to `http://localhost:3000` (or your deployed app). **Authorization callback URL** must be `https://<your-project-ref>.supabase.co/auth/v1/callback`. Generate Client ID/Client Secret, then enter them in Supabase → Providers → GitHub and enable.
- Do not grant `repo`, `gist`, or other broad scopes. Basic authentication only; there is no provider-repository reading or scoring.
- Existing Supabase publishable URL/key and the server-only assessment credential remain as before. **No Google/GitHub Client Secret belongs in `.env.local`, any `NEXT_PUBLIC_*` value, code, or commit.**

Supabase gives the exact provider callback URL in each provider's configuration; use it instead of manually guessing it if your project uses a custom Auth domain.

## 2. Allow the redirect back to Skillmetry

Supabase → Authentication → URL Configuration:

- Set **Site URL** to your current application origin for the environment.
- Add `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/callback**` (if you need dynamic `?next=...` paths).
- For production, add `https://YOUR-DOMAIN/auth/callback**`. Only allow trusted deployed domains, never `*`.

Your app's redirect URL for OAuth is `http://localhost:3000/auth/callback?next=%2Fassessments`, but the Google/GitHub OAuth App callback is **Supabase `/auth/v1/callback`**. These are deliberately different hops.

## 3. Enable the code after configuring providers

In the ignored local `frontend/.env.local` add:

```dotenv
GOOGLE_OAUTH_ENABLED=true
GITHUB_OAUTH_ENABLED=true
```

Keep the original `NEXT_PUBLIC_SUPABASE_URL` and publishable key intact, along with the existing server-only assessment secret. These **two flags are not credentials**; they simply expose the buttons and allow the server authorization route. If you configure one provider only, enable just that one. Restart `npm run dev` after editing these values.

## 4. Flow

`/assessments` → Sign in / Create account → **Continue with Google** or **Continue with GitHub** → Supabase OAuth provider → `/auth/callback?code=...&next=...` → Supabase cookie session → requested `/assessments`.

- Server validates provider to `google`/`github` only and confirms that the returned authorization URL is the configured Supabase Auth endpoint.
- Missing or disabled providers redirect back to sign-in with safe, actionable errors.
- The existing email/password, email OTP confirmation and demo mode remain available.
- Signed-in user identity is still validated via Supabase Auth; RLS and server-only grading remain unchanged.

## 5. Manual acceptance testing (requires your provider credentials)

1. Configure **Google only**, enable Google flag, restart dev server. Confirm Google button is visible on both sign-in and signup; GitHub is hidden.
2. From signed-out `/assessments?assessment=python-foundations`, use Google, complete provider consent, and verify the original selected assessment opens with a signed-in session.
3. Sign out, configure GitHub, enable GitHub flag, restart. Repeat for `/assessments`.
4. Test provider cancellation, disabled-provider direct URLs and `?next=https://evil.example` (must not leave the app).
5. Confirm fresh authenticated user can create a private profile and take a server-graded assessment; changing providers must not expose any other account's attempts.
6. Check desktop/mobile, keyboard focus and links. Provider identity linking is controlled by Supabase Auth settings and verified email, not by merging local profile rows.

Do not apply Supabase database migrations or rotate existing hosted service credentials for this task.

## Official provider setup references

- [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase GitHub login](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Supabase redirect allowlist](https://supabase.com/docs/guides/auth/redirect-urls)
