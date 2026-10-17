"use client";
import {ActivityIndicator} from "@/components/motion-ui";

import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpenCheck, Compass, Fingerprint, GitBranch,
  LibraryBig, ShieldCheck, Sparkles, Target } from "lucide-react";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { buildDigitalTwinSnapshot } from "@skillmetry/shared/lib/digital-twin-intelligence";
import { getPersonalizedResources } from "@skillmetry/shared/lib/resource-intelligence";
import { useSkillmetry } from "@/store/use-skillmetry";
import { LearningStreakCard } from "@/components/learning-streak-card";
import {useAuth} from "@/components/auth-provider";

type TrustedNextAction={kind:"assessment"|"learning"|"choose-goals";title:string;label:string;href:string;explanation:string};
export default function Dashboard() {
  const { name, preferences, onboardingCompleted, profileSource, cloudOwnerId } = useSkillmetry();
  const {user}=useAuth();
  const [cloudNext,setCloudNext]=useState<TrustedNextAction|null>(null);
  const [cloudNextStatus,setCloudNextStatus]=useState<"idle"|"loading"|"ready"|"unavailable">("idle");
  useEffect(()=>{
    const controller=new AbortController();setCloudNext(null);
    if(!user){setCloudNextStatus("idle");return;}
    setCloudNextStatus("loading");
    void fetch("/api/learning/overview",{cache:"no-store",signal:controller.signal})
      .then(async response=>{
        const body=await response.json() as {nextAction?:TrustedNextAction;error?:string};
        if(!response.ok||!body.nextAction)throw new Error(body.error??"Learning overview unavailable");
        if(!controller.signal.aborted){setCloudNext(body.nextAction);setCloudNextStatus("ready");}
      }).catch(()=>{if(!controller.signal.aborted)setCloudNextStatus("unavailable");});
    return()=>controller.abort();
  },[user?.id]);
  const profileReady=onboardingCompleted && (!user || (profileSource==="student" && cloudOwnerId===user.id));
  const { attempts, scores, illustrative, status } = useAssessmentProfile();
  const learning = preferences.learning;
  const career = profileReady ? careers.find(item => item.id === learning.primaryCareerId) ?? null : null;
  const hasFocus = profileReady && Boolean(career || learning.selectedSkillIds.length || learning.selectedToolIds.length);
  const loading = !illustrative && status === "loading";
  const evidenceUnavailable = !illustrative && (status === "error" || status === "offline") && !attempts.length;
  const twin = useMemo(() => buildDigitalTwinSnapshot({
    attempts, learning, context: illustrative ? "demo" : "authenticated"
  }), [attempts, illustrative, learning]);
  const resource = useMemo(() => getPersonalizedResources({
    learning, trustedScores: scores, maxResults: 1
  })[0], [learning, scores]);
  const focus = hasFocus ? twin.insights.find(item=>item.priority==="now") ?? twin.insights[0] : null;
  const detail = focus?.skillId ? skillById[focus.skillId]?.label : null;
  const groundedCloudAction=profileReady&&hasFocus&&!loading&&cloudNextStatus==="ready"?cloudNext:null;
  const nextHref = groundedCloudAction?.href ?? (!profileReady || !hasFocus ? "/onboarding" :
    focus?.action.href ?? "/roadmap");
  const nextLabel = groundedCloudAction?.label ?? (!profileReady || !hasFocus ? "Find my starting point" :
    focus?.action.kind === "assessment" ? "Take a foundational quiz" :
    focus?.action.kind === "resources" ? "Explore a learning resource" : "Open my pathway");
  const nextTitle = groundedCloudAction?.title ?? (!profileReady || !hasFocus ? "Choose what you want to learn." :
    loading ? "Preparing your next step…" : focus?.type === "assessment-recommended" ?
    "Find out what you already know." : focus?.type === "reassessment-opportunity" ?
    "Check how far you've come." : detail ? "Let's work on " + detail + "." : "Make one useful move today.");
  const nextExplanation = groundedCloudAction?.explanation ?? (!profileReady || !hasFocus ?
    "Select a career or one skill you care about. We will show you an understandable place to begin." :
    loading ? "Your trusted quiz results are loading. We won't guess your next action." :
    focus?.explanation ?? "Explore your pathway and choose a practical next step.");
  const attemptCount = attempts.length;
  const careerSkills = career?.skills.slice(0,5) ?? [];
  const lastAttempt = [...attempts].sort((a,b)=>Date.parse(b.completedAt)-Date.parse(a.completedAt))[0];

  return <div className="sx-learning-home">
    <header className="sx-welcome">
      <div>
        <span className="sx-eyebrow"><Sparkles size={15} aria-hidden="true"/> YOUR LEARNING HOME</span>
        <h1>Welcome {name && name !== "Demo Student" ? "back, " + name.split(" ")[0] : "to your path"}<span className="sx-dot">.</span></h1>
        <p>{career ? "You're exploring " + career.title + ". Let's take the next step together." :
          "No pressure to know everything. Just start with a direction."}</p>
      </div>
      <Link href="/settings" className="sx-subtle-link"><Compass size={17} aria-hidden="true"/> Adjust goals</Link>
    </header>
    {illustrative ? <div className="sx-demo-notice" role="status">
      <ShieldCheck size={18} aria-hidden="true"/> This is a sample learning journey.
      <Link href="/auth/sign-in?next=/dashboard">Sign in for your own verified results <ArrowRight size={16}/></Link>
    </div> : null}

    {loading?<div className="motion-action-status"><ActivityIndicator compact label="Loading your trusted assessment history…" detail="Your next action will be based on verified evidence."/></div>:null}
    <section className="sx-next-step" aria-labelledby="sx-next-heading">
      <div className="sx-next-content">
        <span className="sx-eyebrow"><span className="sx-pulse-dot"/> YOUR NEXT USEFUL STEP</span>
        <h2 id="sx-next-heading">{nextTitle}</h2>
        <p>{nextExplanation}</p>
        <Link className="sx-main-action" href={nextHref} aria-disabled={loading}
          tabIndex={loading ? -1 : undefined} onClick={loading ? event => event.preventDefault() : undefined}>
          {loading ? "Loading your learning plan" : nextLabel}<ArrowUpRight size={20} aria-hidden="true"/>
        </Link>
        <small>{cloudNextStatus==="unavailable"&&user?"Live recommendation unavailable; showing the available local evidence. " : ""}{!hasFocus ? "Career selection is flexible. Change your mind anytime." :
          illustrative ? "Suggestions are based on illustrative demo data." :
          "Based on your stated goals and available trusted quiz evidence."}</small>
      </div>
      <aside className="sx-next-evidence" aria-label={illustrative ? "Illustrative assessment snapshot" : "Trusted assessment snapshot"}>
        <span className="sx-eyebrow">{illustrative ? "SAMPLE PROGRESS" : "YOUR EVIDENCE"}</span>
        <div className="sx-next-evidence-numbers">
          <div><strong>{loading || evidenceUnavailable ? "—" : twin.catalogCoverage.measuredSkillCount}</strong><span>Skills assessed</span></div>
          <div><strong>{loading || evidenceUnavailable ? "—" : attemptCount}</strong><span>Quiz attempts</span></div>
        </div>
        <p>{evidenceUnavailable ? "Assessment history is unavailable right now." :
          lastAttempt && !loading ? "Verified attempts help prioritize learning without guessing your readiness." :
          loading ? "Checking your trusted assessment history…" : "Your first quiz will create a measured baseline."}</p>
        <Link href="/twin" className="sx-next-evidence-link">View progress <ArrowRight size={16} aria-hidden="true"/></Link>
      </aside>
    </section>

    <div className="sx-home-grid">
      <section className="sx-home-panel" aria-labelledby="sx-path-heading">
        <div className="sx-panel-heading"><span className="sx-eyebrow">YOUR DIRECTION</span><GitBranch size={21} aria-hidden="true"/></div>
        <h2 id="sx-path-heading">{career ? career.title : "Build your path"}</h2>
        <p>{career ? "These are some skills on this pathway. A blank score means not yet assessed, not that you're unskilled." :
          "Start with any career or skill that interests you."}</p>
        {career ? <div className="sx-skill-stack">
          {careerSkills.map(item => <div key={item.skillId} className="sx-skill-row">
            <span>{skillById[item.skillId]?.label ?? item.skillId}</span>
            <strong>{Object.hasOwn(scores,item.skillId) ? scores[item.skillId] + "/100" : evidenceUnavailable ? "Evidence unavailable" : "Not assessed"}</strong>
          </div>)}
        </div> : null}
        <Link href={career ? "/roadmap" : "/onboarding"} className="sx-inline-link">
          {career ? "Explore my skill path" : "Choose my direction"} <ArrowRight size={17} aria-hidden="true"/>
        </Link>
      </section>
      <section className="sx-home-panel sx-latest-panel" aria-labelledby="sx-evidence-heading">
        <div className="sx-panel-heading"><span className="sx-eyebrow">WHAT YOU HAVE ACTUALLY MEASURED</span><Fingerprint size={21} aria-hidden="true"/></div>
        <h2 id="sx-evidence-heading">Latest quiz result</h2>
        <div className="sx-latest-score" role="status"><strong>{lastAttempt&&!loading&&!evidenceUnavailable?lastAttempt.score+"/100":"—"}</strong><span>{lastAttempt&&!loading&&!evidenceUnavailable?(skillById[lastAttempt.skillId]?.label??lastAttempt.skillId):"No trusted quiz loaded"}</span></div>
        <p>{lastAttempt && !loading && !evidenceUnavailable ?
          "Your latest server-graded result. Open progress to review your actual assessment history." :
          evidenceUnavailable ? "Trusted history could not be loaded. Please try again when online." : "Your first quiz will give you a real baseline. No scores are guessed."}</p>
        <Link href="/twin" className="sx-inline-link">See my progress <ArrowRight size={17} aria-hidden="true"/></Link>
      </section>
    </div>

    <section className="sx-continue" aria-labelledby="sx-continue-title">
      <div className="sx-section-heading"><div><span className="sx-eyebrow">KEEP MOVING</span>
        <h2 id="sx-continue-title">How would you like to learn?</h2></div>
        <p>Choose a small action. There is no need to use every tool at once.</p></div>
      <div className="sx-quick-grid">
        <Link className="sx-quick-card" href="/assessments">
          <BookOpenCheck size={26} aria-hidden="true"/><h3>Check my knowledge</h3>
          <p>Take a supported foundational quiz and get real feedback.</p><ArrowRight size={19} aria-hidden="true"/>
        </Link>
        <Link className="sx-quick-card" href="/lab">
          <Target size={26} aria-hidden="true"/><h3>Try short practice</h3>
          <p>Work through guided coding questions with explanations.</p><ArrowRight size={19} aria-hidden="true"/>
        </Link>
        <Link className="sx-quick-card" href="/planner">
          <LibraryBig size={26} aria-hidden="true"/><h3>Plan my week</h3>
          <p>See a study plan shaped by your available learning time.</p><ArrowRight size={19} aria-hidden="true"/>
        </Link>
      </div>
    </section>
    <aside className="sx-product-feedback-cta"><div><strong>Help make Skillmetry easier to use</strong><p>Try a few real tasks and optionally export anonymous usability notes. No feedback is sent automatically.</p></div><Link href="/feedback" className="btn btn-outline">Give product feedback <ArrowRight size={16} aria-hidden="true"/></Link></aside>
    <details className="sx-streak-disclosure"><summary>Learning consistency & streaks</summary><LearningStreakCard/></details>
    {resource ? <aside className="sx-resource-suggestion">
      <div><span className="sx-eyebrow">ONE RESOURCE FOR YOU</span><strong>{resource.resource.title}</strong>
        <p>{resource.reason}</p></div>
      <Link href={resource.resource.target.kind === "skill" ?
        "/resources?skill=" + encodeURIComponent(resource.resource.target.skillId) :
        "/resources?tool=" + encodeURIComponent(resource.resource.target.toolId)}
        className="sx-inline-link">View resource <ArrowRight size={17} aria-hidden="true"/></Link>
    </aside> : null}
  </div>;
}
