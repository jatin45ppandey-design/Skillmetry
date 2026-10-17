#!/usr/bin/env bash
set -euo pipefail
# Safe by construction: this workflow consumes ONLY the disposable local Supabase.
# Refuse to run if the stack cannot be positively identified as local loopback.
STATUS=$(npx supabase status --workdir database -o env)
read_env() {
  printf '%s\n' "$STATUS" | sed -n "s/^$1=//p" | head -n1 | tr -d '"'
}
LOCAL_API=$(read_env API_URL)
LOCAL_ANON=$(read_env ANON_KEY)
LOCAL_SERVICE=$(read_env SERVICE_ROLE_KEY)
if [[ "$LOCAL_API" != http://127.0.0.1:55421 && "$LOCAL_API" != http://localhost:55421 ]]; then
  echo 'Refusing E2E: expected disposable Supabase API on port 55421.' >&2
  exit 2
fi
if [[ -z "$LOCAL_ANON" || -z "$LOCAL_SERVICE" ]]; then
  echo 'Refusing E2E: disposable local Supabase keys not found.' >&2
  exit 2
fi
export NEXT_PUBLIC_SUPABASE_URL="$LOCAL_API"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$LOCAL_ANON"
export SUPABASE_SERVICE_ROLE_KEY="$LOCAL_SERVICE"
export SKILLMETRY_SITE_URL=http://127.0.0.1:3210
export SKILLMETRY_APP_URL=http://127.0.0.1:3210
export SKILLMETRY_DB_RATE_LIMITING_ENABLED=true
export SKILLMETRY_STREAKS_ENABLED=true
export NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED=true
export NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=false
# Ten-item baseline flow tests zero-grade/retake semantics. Run advanced 15-item
# diagnostic separately with explicit version-aware expectations.
export NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED=true
# No external AI / mail / public share provider calls.
export SKILLMETRY_AI_TUTOR_ENABLED=false
export SKILLMETRY_PASSPORT_SHARING_ENABLED=false
npm --prefix frontend run dev -- -H 127.0.0.1 -p 3210 > /tmp/skillmetry-auth-e2e-next.log 2>&1 &
app_pid=$!
trap 'kill "$app_pid" 2>/dev/null || true' EXIT
ready=0
for i in $(seq 1 75); do
  if curl -fsS http://127.0.0.1:3210/api/health >/dev/null 2>&1; then ready=1; break; fi
  sleep 2
done
if [[ "$ready" != 1 ]]; then
  echo "Local Next.js test app did not become ready." >&2
  tail -n 65 /tmp/skillmetry-auth-e2e-next.log >&2
  exit 1
fi
node scripts/verify-assessment-flow.mjs
