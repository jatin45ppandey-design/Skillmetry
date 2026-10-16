import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (relative) => readFileSync(join(root, relative), "utf8");
const errors = [];
const checks = [];
const assert = (condition, message) => { checks.push(message); if (!condition) errors.push(message); };

const migrationDirectory = "database/supabase/migrations";
const prefixes = ["0001_phase_d_diagnostics", "0002_expand_foundational_assessments",
  "0003_api_burst_limits", "0004_learning_workflows", "0005_passport_sharing", "0006_learning_streak"];
const sql = prefixes.map(prefix => {
  const file = join(migrationDirectory, "20261016" + prefix + ".sql");
  assert(existsSync(join(root, file)), "Additive migration present: " + file);
  return existsSync(join(root, file)) ? read(file) : "";
});

// Conservative lexical check only. PostgreSQL parser + pgTAP must run separately.
// Catch malformed bare-dollar delimiters; don't misrepresent this as a SQL execution test.
for (let index = 0; index < sql.length; index++) {
  const text = sql[index];
  assert(!/\bas\s+\$(?![\w$])/i.test(text), "No malformed bare-dollar PL/pgSQL opening: " + prefixes[index]);
  assert(!/\bend;\s*\$\s*;/i.test(text), "No malformed bare-dollar closing: " + prefixes[index]);
  const dollarPairs = (text.match(/\$\$/g) || []).length;
  const namedPairs = (text.match(/\$streak\$/g) || []).length;
  assert(dollarPairs % 2 === 0 && namedPairs % 2 === 0, "Function dollar-quotes balanced: " + prefixes[index]);
}

assert(sql[3].includes("grant select, update (status, planned_date, updated_at)") &&
  !sql[3].includes("grant select,insert,update on public.learning_plan_tasks to authenticated"),
  "Plan creation is server-only; browser updates constrained to scheduling fields");
assert(sql[3].includes("grant select on public.mission_work to authenticated") &&
  !sql[3].includes("grant select,insert,update on public.mission_work to authenticated"),
  "Mission writes require server validation");
assert(sql[4].includes("grant update (revoked_at)") &&
  sql[4].includes("passport share link metadata is immutable"), "Passport revocation grants and immutable snapshot");
assert(sql[5].includes("security invoker") &&
  sql[5].includes("auth.uid()") &&
  sql[5].includes("a.grading_method = 'server_quiz'") &&
  sql[5].includes("public.practice_lab_attempts") &&
  !sql[5].includes("public.mission_work") &&
  !sql[5].includes("public.learning_plan_tasks"),
  "Streak uses owner-scoped trusted activity, excluding self-reported events");
assert(sql[5].includes("revoke execute on function public.get_learning_streak") &&
  sql[5].includes("grant execute on function public.get_learning_streak"),
  "Anonymous streak RPC execution denied");

const planner = read("frontend/src/app/api/learning/plan/route.ts");
const missions = read("frontend/src/app/api/learning/missions/route.ts");
const streak = read("frontend/src/app/api/learning/streak/route.ts");
assert(planner.includes('createAdminClient().from("learning_plan_tasks").upsert') &&
  planner.includes("auth.userId"), "Server-authorized plan creation");
assert(missions.includes('createAdminClient().from("mission_work").upsert') &&
  missions.includes("normalizeMissionWork") && missions.includes("auth.userId"),
  "Server-authorized mission validation and saving");
assert(streak.includes("authenticatedRequest()") &&
  streak.includes('rpc("get_learning_streak"') &&
  !streak.includes("request.json()"), "Authenticated, read-only streak API");
const env = read(".env.example");
for (const name of ["NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED", "SKILLMETRY_STREAKS_ENABLED",
  "SKILLMETRY_DB_RATE_LIMITING_ENABLED", "SKILLMETRY_PASSPORT_SHARING_ENABLED"]) {
  assert(env.includes(name + "=false"), name + " default off");
}
for (const name of ["learning_workflows_rls", "learning_streak_rls", "passport_sharing_rls"]) {
  assert(existsSync(join(root, "database/supabase/tests/" + name + ".test.sql")),
    "pgTAP scenario present: " + name);
}
if (errors.length) {
  console.error("Backend source gates failed:\n" + errors.map(e => "- " + e).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Backend static gates: " + checks.length + " passed.");
  console.log("Not executed: PostgreSQL migrations, pgTAP, authenticated E2E or hosted Supabase.");
}
