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



  // End-to-end saved learning workflows: a second account cannot see, modify
  // or inherit authenticated learning or practice history.
  if (process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED === "true") {
    const plan = await alice.expectStatus("/api/learning/plan", { method:"POST",body:"{}" }, 200);
    assert(plan.tasks?.length > 0, "Could not generate a real saved learning plan.");
    const task = plan.tasks[0];
    const updatedTask = await alice.expectStatus("/api/learning/plan", {method:"PATCH",
      body:JSON.stringify({taskKey:task.taskKey,status:"completed"})}, 200);
    assert(updatedTask.task?.status === "completed", "Saved study task progress did not persist.");
    const bobPlan = await bob.expectStatus("/api/learning/plan",{method:"GET"},200);
    assert(bobPlan.tasks.length === 0, "Student B could see student A's saved plan.");
    const crossPlan = await bob.request("/api/learning/plan",{method:"PATCH",
      body:JSON.stringify({taskKey:task.taskKey,status:"completed"})});
    assert(crossPlan.response.status === 404, "Student B could update student A's study task.");

    const practice = await alice.expectStatus("/api/learning/lab",{method:"GET"},200);
    const exercise = practice.exercises.find(item=>item.kind==="choice");
    assert(Boolean(exercise), "No guided practice exercise available.");
    const graded = await alice.expectStatus("/api/learning/lab",{method:"POST",
      body:JSON.stringify({exerciseId:exercise.id,selectedIndex:0})},200);
    assert(graded.persisted === true && typeof graded.correct === "boolean",
      "Server-graded practice attempt was not saved.");
    const bobPractice = await bob.expectStatus("/api/learning/lab",{method:"GET"},200);
    assert(bobPractice.history.length === 0, "Student B could see student A's practice history.");

    const missionInput = {missionId:"react-dashboard",status:"in_progress",
      completedIndices:[],repositoryUrl:"",demoUrl:"",notes:"E2E local-only learner draft"};
    const savedMission = await alice.expectStatus("/api/learning/missions",{
      method:"PUT",body:JSON.stringify(missionInput)},200);
    assert(savedMission.work?.missionId === "react-dashboard", "Mission draft was not saved.");
    const bobMissions = await bob.expectStatus("/api/learning/missions",{method:"GET"},200);
    assert(!bobMissions.work?.some(item=>item.missionId==="react-dashboard"),
      "Student B could see student A's project draft.");
  }

  if(process.env.SKILLMETRY_ADMIN_STUDIO_ENABLED==="true"){
    const {error:membershipError}=await admin.from("admin_members")
      .insert({user_id:testUserIds[0],role:"owner"});
    assert(!membershipError, "Disposable test owner could not be provisioned.");
    const denied=await bob.request("/api/admin/guides",{method:"GET"});
    assert(denied.response.status===403,"An ordinary student reached private Admin Studio data.");
    const listed=await alice.expectStatus("/api/admin/guides",{method:"GET"},200);
    assert(listed.role==="owner","Server did not verify an actual owner membership.");
    const guide={documentation:{title:"JavaScript testing guide",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"},
      lecture:{title:"JavaScript lessons video",url:"https://www.youtube.com/watch?v=Zi-Q0t4gMC8",format:"video"},
      notes:["Scope controls which variables you can access.","Closures retain surrounding lexical bindings.","Promises represent future asynchronous work."],
      challenge:"Make a searchable list of tasks using vanilla JavaScript."};
    const mutation={method:"PUT",headers:{origin:appUrl},
      body:JSON.stringify({skillId:"javascript",expectedRevision:0,draft:guide,publish:false})};
    const blocked=await bob.request("/api/admin/guides",mutation);
    assert(blocked.response.status===403,"Student B could modify editorial drafts.");
    const saved=await alice.expectStatus("/api/admin/guides",mutation,200);
    assert(saved.result.revision===1,"Admin draft was not saved as revision one.");
    const unpublished=await alice.expectStatus("/api/content/skill-guides?skill=javascript",{method:"GET"},200);
    assert(unpublished.guide===null,"Private draft became publicly accessible.");
    const published=await alice.expectStatus("/api/admin/guides",{method:"PUT",
      headers:{origin:appUrl},body:JSON.stringify({skillId:"javascript",
        expectedRevision:1,draft:guide,publish:true})},200);
    assert(published.result.publishedRevision===2,"Owner could not publish guide version two.");
    const publicGuide=await bob.expectStatus("/api/content/skill-guides?skill=javascript",{method:"GET"},200);
    assert(publicGuide.guide?.documentation?.title===guide.documentation.title,
      "Published guide did not reach the student content API.");
    const outdated=await alice.request("/api/admin/guides",mutation);
    assert(outdated.response.status===409,"A stale editor unexpectedly overwrote the current draft.");
    const history=await alice.expectStatus("/api/admin/guides/history?skill=javascript",{method:"GET"},200);
    assert(history.history?.length===2,"A guide revision was not audit logged.");
  }

  const description="We need a frontend developer with React, TypeScript, JavaScript, CSS, HTML, REST API integration and unit testing experience.";
  const job = await alice.expectStatus("/api/jobs/analyze",{method:"POST",
    body:JSON.stringify({description})},200);
  assert(job.mode==="private-assessment-comparison" && job.requirements.length>0,
    "Career requirement comparison did not use account-local quiz evidence.");
  const savedJob = await alice.expectStatus("/api/jobs/saved",{method:"POST",
    body:JSON.stringify({title:"Frontend test role",description})},200);
  assert(Boolean(savedJob.saved?.id), "Private job requirement summary did not save.");
  const bobJobs = await bob.expectStatus("/api/jobs/saved",{method:"GET"},200);
  assert(!bobJobs.saved?.some(item=>item.id===savedJob.saved.id),
    "Student B could read student A's saved job requirements.");

  if (process.env.SKILLMETRY_PASSPORT_SHARING_ENABLED==="true") {
    const shared = await alice.expectStatus("/api/passport/shares",{method:"POST",
      body:JSON.stringify({skillIds:["python"],consent:true})},200);
    assert(shared.link?.id && shared.url, "Consented passport link was not created.");
    const publicBefore=await fetch(shared.url,{redirect:"manual"});
    assert(publicBefore.status===200, "Consent-based passport share did not load.");
    const bobLinks=await bob.expectStatus("/api/passport/shares",{method:"GET"},200);
    assert(!bobLinks.links?.some(item=>item.id===shared.link.id),
      "Student B could access student A's private Passport metadata.");
    const bobRevoke=await bob.expectStatus("/api/passport/shares",{method:"DELETE",
      body:JSON.stringify({id:shared.link.id})},200);
    assert(bobRevoke.revoked===false, "Student B could revoke student A's link.");
    const aliceRevoke=await alice.expectStatus("/api/passport/shares",{method:"DELETE",
      body:JSON.stringify({id:shared.link.id})},200);
    assert(aliceRevoke.revoked===true, "Student A could not revoke their Passport link.");
    const publicAfter=await fetch(shared.url,{redirect:"manual"});
    assert(publicAfter.status===404, "Revoked Passport URL remained public.");
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
