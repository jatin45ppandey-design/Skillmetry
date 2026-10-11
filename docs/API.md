# API contract

## `GET /api/health`
Returns:
```json
{"status":"ok","name":"skillmetry","mode":"local-prototype","version":"0.1.0"}
```

## `POST /api/simulate`
Example request:
```json
{"careerId":"ml-engineer","skills":{"python":80,"docker":10,"deployment":10},"missionIds":["dockerize"]}
```
Response fields: `baseline`, `projected`, `type` (`"hypothetical"`), `disclaimer`.

- Validates shape with Zod.
- Rejects unknown or wrong-career mission IDs.
- Clamps computed proficiency to [0,100] using approved mission gain values.
- Never persists anything.
- Not authenticated because simulation uses self-contained, non-sensitive inputs. Add rate limiting and input cap in production.

## `POST /api/jobs/analyze`
501 Not Implemented. Planned: server-only provider request, bounded description size, structured extracted skill IDs and uncertainty.

## `POST /api/ai/missions`
501 Not Implemented. Planned: server-only LLM, known skill IDs, schema-constrained output, citations/clear AI label, no direct skill mutation.

## Authentication routes

- `POST /api/auth/sign-up`: strict email/password validation; creates a real Supabase Auth user and may require email confirmation.
- `POST /api/auth/sign-in`: exchanges credentials for an SSR cookie session. Errors do not reveal whether an account exists.
- `POST /api/auth/sign-out`: clears the current cookie session.
- `GET /auth/callback`: exchanges a valid PKCE confirmation code and permits only same-origin redirect paths.

## `GET /api/profile`

Requires a server-validated Supabase claim. Returns only the current user's profile, claimed proficiency and read-only trusted signal fields. Responses are private and non-cacheable.

## `PUT /api/profile`

Requires a server-validated Supabase claim and a strict Zod body containing display name, canonical career ID, onboarding preferences and canonical claimed-skill values. The owner ID always comes from the validated claim. Unknown identity, assessment, demonstrated, verification or review fields are rejected.
