import { createClient } from "@supabase/supabase-js";

const appUrl = process.env.SKILLMETRY_APP_URL ?? "http://127.0.0.1:3210";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const elevatedKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !elevatedKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and a server-only SUPABASE_SECRET_KEY before running this check.");
}

const admin = createClient(supabaseUrl, elevatedKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const testUserIds = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createRequestClient() {
  const cookieJar = new Map();

  function rememberCookies(response) {
    const setCookies = typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);

    for (const setCookie of setCookies) {
      const firstPart = setCookie.split(";", 1)[0];
      const separator = firstPart.indexOf("=");
      if (separator < 1) continue;
      const name = firstPart.slice(0, separator);
      const value = firstPart.slice(separator + 1);
      if (value) cookieJar.set(name, value);
      else cookieJar.delete(name);
    }
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    if (cookieJar.size) {
      headers.set("cookie", [...cookieJar].map(([name, value]) => `${name}=${value}`).join("; "));
    }

    const response = await fetch(`${appUrl}${path}`, { ...options, headers, redirect: "manual" });
    rememberCookies(response);
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
  }

  async function expectStatus(path, options, expectedStatus) {
    const result = await request(path, options);
    assert(
      result.response.status === expectedStatus,
      `${path} returned ${result.response.status}; expected ${expectedStatus}. ${result.body?.error ?? ""}`
    );
    return result.body;
  }

  return { request, expectStatus };
}

async function run() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const password = `E2e-${suffix}-Secure!`;
  const aliceEmail = `skillmetry-e2e-alice-${suffix}@example.test`;
  const bobEmail = `skillmetry-e2e-bob-${suffix}@example.test`;

  for (const email of [aliceEmail, bobEmail]) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`Could not create isolated test user: ${error?.message ?? "unknown error"}`);
    testUserIds.push(data.user.id);
  }

  const alice = createRequestClient();
  const bob = createRequestClient();
  const unauthenticated = await alice.request("/api/assessments/start", {
    method: "POST",
    body: JSON.stringify({ assessmentId: "javascript-foundations" })
  });
  assert(unauthenticated.response.status === 401, "Assessment start must reject an anonymous request.");

  await alice.expectStatus("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email: aliceEmail, password, next: "/assessments" })
  }, 200);

  const profileInput = {
    displayName: "Assessment E2E Student",
    careerId: "frontend-developer",
    onboardingCompleted: true,
    preferences: { hoursPerWeek: 6, roadmapView: "graph", learning: { primaryCareerId: "frontend-developer", selectedSkillIds: [], selectedToolIds: [] } }
  };
  await alice.expectStatus("/api/profile", { method: "PUT", body: JSON.stringify(profileInput) }, 200);
  const storedProfile = await alice.expectStatus("/api/profile", { method: "GET" }, 200);
  assert(storedProfile.profile?.displayName === profileInput.displayName, "Profile did not persist through the API.");
  assert(storedProfile.profile?.preferences?.learning?.primaryCareerId === "frontend-developer", "Onboarding goal did not persist.");
  const nextAction = await alice.expectStatus("/api/learning/overview", {method: "GET"}, 200);
  assert(nextAction.state === "ready" && nextAction.trustedEvidenceOnly === true, "Next action did not use the verified profile.");

  const startRequest = () => alice.expectStatus("/api/assessments/start", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "python-foundations" })
    }, 200);
  const [firstStart, concurrentStart] = await Promise.all([startRequest(), startRequest()]);
  assert(firstStart.session?.questions?.length === 10, "Expected a ten-question assessment session.");
  assert(firstStart.session.sessionId === concurrentStart.session.sessionId, "Concurrent starts created more than one active session.");
  assert(!JSON.stringify(firstStart).includes("correctIndex"), "The public assessment payload exposed an answer key.");

  await bob.expectStatus("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email: bobEmail, password, next: "/assessments" })
  }, 200);

  const firstAnswers = Object.fromEntries(firstStart.session.questions.map(question => [question.id, 3]));
  const crossUserSubmission = await bob.request("/api/assessments/submit", {
    method: "POST",
    body: JSON.stringify({ sessionId: firstStart.session.sessionId, answers: firstAnswers })
  });
  assert(crossUserSubmission.response.status === 404, "A second student reached another student's assessment session.");
  const bobHistory = await bob.expectStatus("/api/assessments/history", { method: "GET" }, 200);
  assert(bobHistory.attempts.length === 0, "A second student could read another student's assessment history.");

  const submitRequest = () => alice.expectStatus("/api/assessments/submit", {
      method: "POST",
      body: JSON.stringify({ sessionId: firstStart.session.sessionId, answers: firstAnswers })
    }, 200);
  const [firstSubmission, concurrentSubmission] = await Promise.all([submitRequest(), submitRequest()]);
  assert(firstSubmission.attempt?.score === 0, "A genuine zero-score result was not preserved as 0%.");
  assert(firstSubmission.attempt.passThreshold === 75, "The current assessment pass threshold was not persisted.");
  assert(firstSubmission.attempt.id === concurrentSubmission.attempt.id, "Concurrent submissions returned different attempts.");
  assert([firstSubmission, concurrentSubmission].filter(result => result.replayed === true).length === 1, "A concurrent duplicate was not returned as an idempotent replay.");

  const replay = await alice.expectStatus("/api/assessments/submit", {
    method: "POST",
    body: JSON.stringify({ sessionId: firstStart.session.sessionId, answers: firstAnswers })
  }, 200);
  assert(replay.replayed === true, "A repeated submission was not identified as an idempotent retry.");
  assert(replay.attempt?.id === firstSubmission.attempt.id, "A repeated submission did not return the original result.");

  const completedAttemptIds = [firstSubmission.attempt.id];
  for (let attemptNumber = 2; attemptNumber <= 6; attemptNumber += 1) {
    const retake = await startRequest();
    assert(retake.session.sessionId !== firstStart.session.sessionId, "A retake reused a consumed session.");
    const answers = Object.fromEntries(retake.session.questions.map(question => [question.id, attemptNumber % 4]));
    const submission = await alice.expectStatus("/api/assessments/submit", {
      method: "POST",
      body: JSON.stringify({ sessionId: retake.session.sessionId, answers })
    }, 200);
    completedAttemptIds.push(submission.attempt.id);
  }

  const historyBeforeSignOut = await alice.expectStatus("/api/assessments/history", { method: "GET" }, 200);
  assert(historyBeforeSignOut.attempts.length === 6, "Immediate retakes did not preserve all six completed attempts.");
  assert(historyBeforeSignOut.attempts[0].id === completedAttemptIds.at(-1), "The newest valid attempt was not current.");
  assert(historyBeforeSignOut.attempts.some(attempt => attempt.id === firstSubmission.attempt.id), "The earliest attempt was not preserved.");
  if (process.env.SKILLMETRY_STREAKS_ENABLED === "true") {
    const streak = await alice.expectStatus("/api/learning/streak?timeZone=Asia/Kolkata", {method: "GET"}, 200);
    assert(streak.activeToday === true && streak.currentStreak >= 1, "Real graded attempts did not count toward today's streak.");
    assert(streak.totalActiveDays === 1, "Multiple same-day assessments counted as multiple active days.");
    assert(streak.last7Days.length === 7, "Streak calendar did not include seven local days.");
    const otherStreak = await bob.expectStatus("/api/learning/streak?timeZone=Asia/Kolkata", {method: "GET"}, 200);
    assert(otherStreak.totalActiveDays === 0 && otherStreak.currentStreak === 0, "Student B inherited student A's streak.");
  }


  await alice.expectStatus("/api/auth/sign-out", { method: "POST" }, 204);
  const signedOutProfile = await alice.request("/api/profile", { method: "GET" });
  assert(signedOutProfile.response.status === 401, "Sign-out did not clear access to the private profile.");

  await alice.expectStatus("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email: aliceEmail, password, next: "/twin" })
  }, 200);
  const restoredProfile = await alice.expectStatus("/api/profile", { method: "GET" }, 200);
  const restoredHistory = await alice.expectStatus("/api/assessments/history", { method: "GET" }, 200);
  assert(restoredProfile.profile?.displayName === profileInput.displayName, "Profile was not restored after sign-in.");
  assert(restoredHistory.attempts.length === 6, "Assessment history was not restored after sign-in.");
  const noLeak = await bob.expectStatus("/api/learning/overview", {method: "GET"}, 200);
  assert(noLeak.state === "onboarding-required", "Student B inherited student A's private profile.");


  console.log("Authenticated E2E: profile and goals, next action, concurrent assessment, idempotent result, cross-user isolation, genuine zero, six retakes, streak isolation and session restoration passed.");
}

try {
  await run();
} finally {
  for (const testUserId of testUserIds) {
    const { error } = await admin.auth.admin.deleteUser(testUserId);
    if (error) throw new Error(`The isolated test user could not be cleaned up: ${error.message}`);
  }
}
