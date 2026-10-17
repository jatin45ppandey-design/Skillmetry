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

    const canonical=["html","css","javascript","typescript","react","accessibility","testing","deployment"];
    const roadmap={headline:"Frontend learning pathway",introduction:
      "Learn front-end technologies in prerequisite order, with short practice challenges.",
      steps:canonical.map(skillId=>({skillId,
        explanation:"Learn the fundamentals of "+skillId+" with real-life examples.",
        task:"Build a small interactive example using "+skillId+" knowledge."}))};
    const privateRoadmap=await alice.expectStatus("/api/admin/roadmaps",{method:"GET"},200);
    assert(privateRoadmap.role==="owner","Roadmap admin did not verify owner.");
    const bobRoadmapPrivate=await bob.request("/api/admin/roadmaps",{method:"GET"});
    assert(bobRoadmapPrivate.response.status===403,"Non-admin could read private career roadmaps.");
    const input={careerId:"frontend-developer",expectedRevision:0,draft:roadmap,publish:false};
    const savedRoadmap=await alice.expectStatus("/api/admin/roadmaps",{
      method:"PUT",headers:{origin:appUrl},body:JSON.stringify(input)},200);
    assert(savedRoadmap.result.revision===1,"Roadmap draft revision not saved.");
    const publicUnpublished=await bob.expectStatus("/api/content/career-roadmaps?career=frontend-developer",
      {method:"GET"},200);
    assert(publicUnpublished.roadmap===null,"Unpublished roadmap leaked to students.");
    const publishedRoadmap=await alice.expectStatus("/api/admin/roadmaps",{method:"PUT",
      headers:{origin:appUrl},body:JSON.stringify({...input,expectedRevision:1,publish:true})},200);
    assert(publishedRoadmap.result.publishedRevision===2,"Owner failed to publish study roadmap.");
    const studentRoadmap=await bob.expectStatus("/api/content/career-roadmaps?career=frontend-developer",
      {method:"GET"},200);
    assert(studentRoadmap.roadmap?.headline===roadmap.headline,"Published career plan not available to students.");
    const staleRoadmap=await alice.request("/api/admin/roadmaps",{
      method:"PUT",headers:{origin:appUrl},body:JSON.stringify(input)});
    assert(staleRoadmap.response.status===409,"Stale roadmap revision overwrote recent editor.");
    const roadmapAudit=await alice.expectStatus("/api/admin/roadmaps/history?career=frontend-developer",
      {method:"GET"},200);
    assert(roadmapAudit.history?.length===2,"Roadmap edit audit history is incomplete.");

    const content={title:"JavaScript Foundations Course",summary:
      "A practical beginner-friendly course with a video, short notes and a coding assignment.",
      modules:[{id:"getting-started",title:"JavaScript basics",
        lessons:[{id:"first-video",title:"A beginner JavaScript video",
          summary:"Learn the most important basics and implement an interactive example.",
          kind:"video",url:"https://www.youtube.com/watch?v=Zi-Q0t4gMC8",
          notes:["Functions organize reusable behavior.","Promises represent asynchronous tasks."],
          task:"Build a working interactive task list and test its sorting.",
          estimatedMinutes:30}]}]};
    const courseData={slug:"javascript-foundations",skillId:"javascript",
      expectedRevision:0,draft:content,publish:false};
    const bobCourseAdmin=await bob.request("/api/admin/courses",{method:"GET"});
    assert(bobCourseAdmin.response.status===403,"Student B could read private course drafts.");
    const courseSave=await alice.expectStatus("/api/admin/courses",{method:"PUT",
      headers:{origin:appUrl},body:JSON.stringify(courseData)},200);
    assert(courseSave.result.revision===1,"Owner could not save a private course.");
    const hiddenCourse=await bob.expectStatus("/api/content/courses",{method:"GET"},200);
    assert(!hiddenCourse.courses.some(c=>c.slug===courseData.slug),"Private course leaked.");
    const coursePublish=await alice.expectStatus("/api/admin/courses",{method:"PUT",
      headers:{origin:appUrl},body:JSON.stringify({...courseData,expectedRevision:1,publish:true})},200);
    assert(coursePublish.result.publishedRevision===2,"Owner could not publish the course.");
    const studentCourses=await bob.expectStatus("/api/content/courses?skill=javascript",{method:"GET"},200);
    assert(studentCourses.courses.some(c=>c.slug===courseData.slug && c.modules.length===1),
      "Published course and lessons did not reach students.");
    const staleCourse=await alice.request("/api/admin/courses",{method:"PUT",
      headers:{origin:appUrl},body:JSON.stringify(courseData)});
    assert(staleCourse.response.status===409,"Outdated course edit incorrectly overwrote publication.");
    const courseHistory=await alice.expectStatus("/api/admin/courses/history?slug=javascript-foundations",
      {method:"GET"},200);
    assert(courseHistory.history?.length===2,"Course revision history incomplete.");

    if(process.env.SKILLMETRY_ADMIN_MISSIONS_ENABLED==="true"){
      const missionContent={
        title:"Create an accessible React task board",
        description:"Implement a responsive React task board with real keyboard controls and document its integration tests.",
        estimatedHours:6,
        deliverables:["Working accessible task board","Recorded keyboard audit","Documented UI integration tests"]
      };
      const missionData={id:"cms-e2e-react-taskboard",careerId:"frontend-developer",
        skillId:"react",expectedRevision:0,draft:missionContent,publish:false};
      const blockedMission=await bob.request("/api/admin/missions",{method:"GET"});
      assert(blockedMission.response.status===403,"Learner could inspect private mission drafts.");
      const savedMission=await alice.expectStatus("/api/admin/missions",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify(missionData)},200);
      assert(savedMission.result.revision===1,"Owner mission draft did not save.");
      const hiddenMission=await bob.expectStatus("/api/content/missions",{method:"GET"},200);
      assert(!hiddenMission.missions.some(m=>m.id===missionData.id),"Private mission leaked to students.");
      const publishedMission=await alice.expectStatus("/api/admin/missions",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify({...missionData,expectedRevision:1,publish:true})},200);
      assert(publishedMission.result.publishedRevision===2,"Owner mission was not published.");
      const catalogMission=await bob.expectStatus("/api/content/missions",{method:"GET"},200);
      assert(catalogMission.missions.some(m=>m.id===missionData.id&&m.deliverables.length===3),
        "Published mission did not reach student catalog.");
      const learnerWork=await alice.expectStatus("/api/learning/missions",{method:"PUT",
        body:JSON.stringify({missionId:missionData.id,status:"in_progress",completedIndices:[0],
          repositoryUrl:"",demoUrl:"",notes:"Private task-board learning progress"})},200);
      assert(learnerWork.work.missionId===missionData.id,"Published mission could not save private learner work.");
      const otherLearner=await bob.expectStatus("/api/learning/missions",{method:"GET"},200);
      assert(!otherLearner.work.some(item=>item.missionId===missionData.id),
        "Other student could read a published mission's private progress.");
      const rejectedChecklist=await alice.request("/api/admin/missions",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify({...missionData,expectedRevision:2,
          draft:{...missionContent,deliverables:["Another task","Recorded keyboard audit"]}})});
      assert(rejectedChecklist.response.status===400,"Published mission checklist changed under saved learner progress.");
      const staleMission=await alice.request("/api/admin/missions",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify(missionData)});
      assert(staleMission.response.status===409,"Stale mission draft replaced publication.");
      const missionHistory=await alice.expectStatus("/api/admin/missions/history?id="+missionData.id,
        {method:"GET"},200);
      assert(missionHistory.history.length===2,"Published mission history is incomplete.");
    }


    if(process.env.SKILLMETRY_ADMIN_QUESTION_BANKS_ENABLED==="true"){
      const questions=Array.from({length:10},(_,i)=>({
        id:"aq-e2e-"+String(i+1).padStart(3,"0"),
        prompt:"Which option is correct for the original HTML question "+(i+1)+"?",
        choices:["Correct original answer","Other answer A","Other answer B","Other answer C"],
        correctIndex:0,
        explanation:"The original correct answer is option one for this testing scenario."
      }));
      const authored={assessmentId:"html-foundations",expectedRevision:0,
        draft:{questions},publish:false};
      const studentPrivate=await bob.request("/api/admin/assessments",{method:"GET"});
      assert(studentPrivate.response.status===403,
        "Student accessed private question authoring and answer keys.");
      const saved=await alice.expectStatus("/api/admin/assessments",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify(authored)},200);
      assert(saved.result.revision===1,"Owner cannot create private assessment draft.");
      const privateList=await alice.expectStatus("/api/admin/assessments",{method:"GET"},200);
      assert(privateList.banks.some(item=>item.assessment_id==="html-foundations"),
        "Owner could not access private saved draft.");
      const published=await alice.expectStatus("/api/admin/assessments",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify({...authored,expectedRevision:1,publish:true})},200);
      assert(published.result.publishedVersion==="cms.2","Owner could not publish immutable bank version.");
      const questionHistory=await alice.expectStatus(
        "/api/admin/assessments/history?assessmentId=html-foundations",{method:"GET"},200);
      assert(questionHistory.history.length===2,"Question bank publication audit is missing.");
      const started=await bob.expectStatus("/api/assessments/start",{method:"POST",
        body:JSON.stringify({assessmentId:"html-foundations"})},200);
      assert(started.session?.assessmentVersion==="cms.2",
        "Student did not receive published assessment version.");
      assert(started.session.questions.length===10,"Published quiz count changed.");
      assert(started.session.questions.every(q=>q.correctIndex===undefined&&q.explanation===undefined),
        "Correct answer or explanation leaked before grading.");
      const nextQuestions=questions.map((q,i)=>({...q,correctIndex:i===0?1:0}));
      const nextPublish=await alice.expectStatus("/api/admin/assessments",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify({
          assessmentId:"html-foundations",expectedRevision:2,publish:true,
          draft:{questions:nextQuestions}
        })},200);
      assert(nextPublish.result.publishedVersion==="cms.3","Second version was not immutable.");
      const answers=Object.fromEntries(started.session.questions.map(q=>[q.id,0]));
      const finished=await bob.expectStatus("/api/assessments/submit",{method:"POST",
        body:JSON.stringify({sessionId:started.session.sessionId,answers})},200);
      assert(finished.attempt?.assessmentVersion==="cms.2"&&finished.attempt.score===100,
        "Existing student session was regraded with a newer published answer key.");
      const snapshots=await admin.from("admin_assessment_versions")
        .select("version,snapshot").eq("assessment_id","html-foundations")
        .order("version",{ascending:true});
      assert(!snapshots.error&&snapshots.data.length===2,
        "Immutable assessment version history was not retained.");
      assert(snapshots.data[0].snapshot.questions[0].correctIndex===0 &&
             snapshots.data[1].snapshot.questions[0].correctIndex===1,
        "Earlier correct-answer snapshot was overwritten.");
      const stale=await alice.request("/api/admin/assessments",{method:"PUT",
        headers:{origin:appUrl},body:JSON.stringify({...authored,expectedRevision:1})});
      assert(stale.response.status===409,"Concurrent stale bank edit bypassed revision conflict.");
      const publicLeaks=await bob.request("/api/admin/assessments/history?assessmentId=html-foundations",
        {method:"GET"});
      assert(publicLeaks.response.status===403,"Student accessed private bank audit metadata.");
    }


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
