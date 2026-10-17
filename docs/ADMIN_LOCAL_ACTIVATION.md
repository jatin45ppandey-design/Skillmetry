# Skillmetry — use the existing Owner Admin Studio locally

The existing **Skilllmetry** Supabase Free project `qepaepqrhgrejzarqlrd` has Admin Studio SQL migrations `202610170001`–`202610170005` and the previously verified Google owner membership. **Do not create a new project, organization, API key or OAuth configuration.**

## After pulling the latest GitHub main

From the Skillmetry repository root, with your existing `frontend/.env.local` configuration already in place:

```powershell
git pull --ff-only origin main
npm install
npm run dev:admin:check
npm run dev:admin
```

You can also run `npm run dev:admin` from `frontend/`. The readiness check validates the project without showing or changing credentials.

Open the local URL printed by Next.js (usually `http://localhost:3000/admin`). Sign in **through the existing Google OAuth login for the previously verified Owner account**. Do not use the unrelated email identity or invite a replacement account.

You should see five tabs:
1. Docs, Lectures & Notes
2. Career Roadmaps
3. Courses & Lessons
4. Missions & Projects
5. Assessment Bank

The local launcher reads existing `frontend/.env.local` using Next.js's development env precedence. It then overrides **only in the spawned local dev-server process**:

```dotenv
SKILLMETRY_ADMIN_STUDIO_ENABLED=true
SKILLMETRY_ADMIN_MISSIONS_ENABLED=true
SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED=true
```

These values are deliberately **not** written to `.env.local`, Git tracked secrets, Vercel or Supabase. The standard `npm run dev` and production build keep their previous flag behavior. The launcher refuses to start when `NEXT_PUBLIC_SUPABASE_URL` points anywhere other than `https://qepaepqrhgrejzarqlrd.supabase.co`, and requires existing local public/server Supabase credentials. Database roles are enforced by server-side membership checks; an unrelated account does not become an admin.

## Limitations / verification

- The GitHub push cannot edit `frontend/.env.local` on the developer's PC, nor can it restart their VS Code terminal. Use `npm run dev:admin` after pulling.
- No new SQL migrations are required *for the five Admin Studio modules* because migrations 001–005 have already been applied to this project. Other learning/diagnostic migrations remain pending; do not enable unrelated features.
- Verify the authenticated owner flow manually: create a draft guide, edit a course/mission, preview and publish a harmless test item, then check published-only student visibility. Assessment Bank publications alter which questions later students receive; do not publish arbitrary content during testing.
- A successful build or local startup **does not** prove production readiness or manual accessibility/security acceptance. Keep hosted production flags disabled until separately approved and tested.
- If access shows unavailable, confirm that `npm run dev:admin` was run instead of the normal dev command, verify the selected Google account and check the server console for errors without exposing secrets.

**No SafeRelay access and Free tiers only.**
