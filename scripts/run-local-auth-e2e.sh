#!/usr/bin/env bash
set -euo pipefail
# Safe by construction: this workflow consumes ONLY the disposable local Supabase.
# Refuse to run if the stack cannot be positively identified as local loopback.
# The CLI can return a non-zero exit code when optional local services are
# stopped even while the API, Auth and Postgres containers needed below are
# healthy. Keep its environment output, then let the explicit loopback/key
# checks decide whether this isolated runner may proceed.
STATUS=$(npx supabase status --workdir database -o env || true)
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
export SUPABASE_SECRET_KEY="$LOCAL_SERVICE"
export SKILLMETRY_SITE_URL=http://127.0.0.1:3210
export SKILLMETRY_APP_URL=http://127.0.0.1:3210
export SKILLMETRY_DB_RATE_LIMITING_ENABLED=true
export SKILLMETRY_STREAKS_ENABLED=true
export SKILLMETRY_ADMIN_STUDIO_ENABLED=true
export SKILLMETRY_ADMIN_MISSIONS_ENABLED=true
export SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED=true
export NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED=true
export NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED=false
# Ten-item baseline flow tests zero-grade/retake semantics. Run advanced 15-item
# diagnostic separately with explicit version-aware expectations.
export NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED=true
# No external AI / mail / public share provider calls.
export SKILLMETRY_AI_TUTOR_ENABLED=false
export SKILLMETRY_PASSPORT_SHARING_ENABLED=true
export NEXT_PUBLIC_PASSPORT_SHARING_ENABLED=true
NODE_BIN=node
if ! command -v "$NODE_BIN" >/dev/null 2>&1; then NODE_BIN=node.exe; fi
if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "Local Node runtime is unavailable." >&2
  exit 1
fi
# WSL only forwards temporary exports to a Windows node.exe process when they
# are named in WSLENV. Git Bash and Linux ignore this variable safely.
LOCAL_E2E_ENV_NAMES="NEXT_PUBLIC_SUPABASE_URL:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:SUPABASE_SERVICE_ROLE_KEY:SUPABASE_SECRET_KEY:SKILLMETRY_SITE_URL:SKILLMETRY_APP_URL:SKILLMETRY_DB_RATE_LIMITING_ENABLED:SKILLMETRY_STREAKS_ENABLED:SKILLMETRY_ADMIN_STUDIO_ENABLED:SKILLMETRY_ADMIN_MISSIONS_ENABLED:SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED:NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED:NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED:NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED:SKILLMETRY_AI_TUTOR_ENABLED:SKILLMETRY_PASSPORT_SHARING_ENABLED:NEXT_PUBLIC_PASSPORT_SHARING_ENABLED"
export WSLENV="${WSLENV:+${WSLENV}:}${LOCAL_E2E_ENV_NAMES}"
# Build against disposable Supabase credentials and exercise Next.js production SSR
# and API runtime rather than relying on dev-server behavior.
npm --prefix frontend run build > /tmp/skillmetry-auth-e2e-build.log 2>&1 || {
  echo "Disposable Supabase production build failed." >&2
  tail -n 70 /tmp/skillmetry-auth-e2e-build.log >&2
  exit 1
}
if command -v curl.exe >/dev/null 2>&1 && curl.exe -fsS http://127.0.0.1:3210/api/health >/dev/null 2>&1; then
  echo "Refusing E2E: port 3210 is already serving an app with unknown test configuration." >&2
  exit 1
fi
npm --prefix frontend run start -- -H 127.0.0.1 -p 3210 > /tmp/skillmetry-auth-e2e-next.log 2>&1 &
app_pid=$!
app_windows_pid=""
cleanup() {
  kill "$app_pid" 2>/dev/null || true
  if [[ -n "$app_windows_pid" ]] && command -v taskkill.exe >/dev/null 2>&1; then
    taskkill.exe /PID "$app_windows_pid" /T /F >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
ready=0
for i in $(seq 1 75); do
  # WSL curl cannot always reach a Windows loopback listener started through
  # the Windows npm shim. Prefer curl.exe where available, otherwise use curl.
  if { command -v curl.exe >/dev/null 2>&1 && curl.exe -fsS http://127.0.0.1:3210/api/health >/dev/null 2>&1; } || \
     { ! command -v curl.exe >/dev/null 2>&1 && curl -fsS http://127.0.0.1:3210/api/health >/dev/null 2>&1; }; then ready=1; break; fi
  sleep 2
done
if [[ "$ready" != 1 ]]; then
  echo "Local Next.js test app did not become ready." >&2
  tail -n 65 /tmp/skillmetry-auth-e2e-next.log >&2
  exit 1
fi
if command -v netstat.exe >/dev/null 2>&1; then
  app_windows_pid=$(netstat.exe -ano | tr -d '\r' | awk '/127\.0\.0\.1:3210[[:space:]].*LISTENING/{print $NF; exit}' || true)
fi
"$NODE_BIN" scripts/verify-assessment-flow.mjs
