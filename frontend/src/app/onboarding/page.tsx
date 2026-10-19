"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ActivityIndicator, ActionSpinner } from "@/components/motion-ui";
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass, Info, SlidersHorizontal } from "lucide-react";
import { Brand } from "@/components/brand";
import { LearningGoalEditor } from "@/components/learning-goal-editor";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { useAuth } from "@/components/auth-provider";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { CareerId, LearningPreferences } from "@skillmetry/shared/types/domain";

type Intent = "career" | "explore" | "skill";
const intentions: { id: Intent; label: string; description: string; icon: typeof Compass }[] = [
  { id: "career", label: "I have a career in mind", description: "Explore the skills for a specific role.", icon: Compass },
  { id: "explore", label: "I'm still figuring it out", description: "Look around without committing to a career.", icon: BookOpen },
  { id: "skill", label: "I want to learn a skill", description: "Make a path around a topic that interests you.", icon: SlidersHorizontal }
];

export default function Onboarding() {
  const router = useRouter();
  const { user, syncStatus } = useAuth();
  const { name, preferences, completeOnboarding, careerId, onboardingCompleted } = useSkillmetry();
  const [step, setStep] = useState(1);
  const [navigating, startTransition] = useTransition();
  const [localName, setLocalName] = useState(name === "Demo Student" ? "" : name);
  const [intent, setIntent] = useState<Intent>("career");
  const [learning, setLearning] = useState<LearningPreferences>(
    () => onboardingCompleted ? preferences.learning :
      { primaryCareerId: null, selectedSkillIds: [], selectedToolIds: [] }
  );
  const [hours, setHours] = useState(preferences.hoursPerWeek);
  const [advanced, setAdvanced] = useState(false);
  const selectedCareer = careers.find(item => item.id === learning.primaryCareerId);

  useEffect(() => {
    const requestedCareer = new URLSearchParams(window.location.search).get("career");
    const matchingCareer = careers.find(item => item.id === requestedCareer);
    if (!matchingCareer) return;
    setIntent("career");
    setLearning(current => ({ ...current, primaryCareerId: matchingCareer.id }));
  }, []);

  const chooseCareer = (id: CareerId) => setLearning(current => ({
    ...current, primaryCareerId: id
  }));
  const canFinish = intent !== "career" || Boolean(learning.primaryCareerId);

  function finish() {
    if (!canFinish || !localName.trim()) return;
    // Anonymous browsing may be self-directed; backend careerId retains an
    // existing canonical fallback, but no target career is falsely selected.
    const finalLearning = intent === "explore"
      ? { ...learning, primaryCareerId: null }
      : learning;
    startTransition(()=>{
      completeOnboarding(localName.trim(), finalLearning.primaryCareerId ?? careerId, {
        ...preferences, hoursPerWeek: hours, learning: finalLearning
      });
      router.push("/dashboard");
    });
  }

  return <main className="onboarding-shell sx-onboarding">
    <nav className="onboarding-nav"><Brand/><Link className="btn btn-quiet" href="/"><ArrowLeft aria-hidden="true"/>Back home</Link></nav>
    <div className="onboarding-layout">
      <aside className="onboarding-aside">
        <div>
          <span className="eyebrow">YOUR FIRST STEP</span>
          <h1>Build a path that feels <em>like yours.</em></h1>
          <p>You do not need to know every skill or tool yet. Start simple; refine things whenever you are ready.</p>
        </div>
        <ol className="sx-onboarding-progress" aria-label="Setup steps">
          <li className={step === 1 ? "active" : "complete"}><span>1</span> About you</li>
          <li className={step === 2 ? "active" : ""}><span>2</span> Your direction</li>
        </ol>
        <div className="privacy-note"><Info aria-hidden="true"/><p>{user ? syncStatus === "offline"
          ? "You are offline. Your choices will try to sync after reconnecting."
          : "Your learning goals will sync to your private account."
          : "You can explore locally. Sign in later to take a secure assessment."}</p></div>
      </aside>
      <section className="onboarding-card sx-onboarding-card" aria-live="polite">
        {step === 1 ? <div className="motion-stage" key="step-one">
          <span className="step-kicker">STEP 1 OF 2</span>
          <h2>What brings you here?</h2>
          <p className="form-lead">There is no wrong starting point.</p>
          <div className="sx-intent-grid" role="group" aria-label="Your reason for exploring">
            {intentions.map(option => {
              const Icon = option.icon;
              return <button key={option.id} type="button"
                aria-pressed={intent === option.id}
                className={`sx-intent-option ${intent === option.id ? "selected" : ""}`}
                onClick={() => { setIntent(option.id); if (option.id === "explore") setLearning(current => ({...current, primaryCareerId:null})); }}>
                <Icon aria-hidden="true" size={24}/>
                <span><strong>{option.label}</strong><small>{option.description}</small></span>
                {intent === option.id ? <Check aria-hidden="true" size={18}/> : null}
              </button>;
            })}
          </div>
          <label className="field sx-name-input">What should we call you?
            <input autoComplete="given-name" className="input input-large" maxLength={64}
              placeholder="Your first name" value={localName} onChange={e => setLocalName(e.target.value)}/>
          </label>
          <div className="form-actions"><span/><button className="btn btn-primary"
            type="button" disabled={!localName.trim()} onClick={() => setStep(2)}>
            Continue <ArrowRight aria-hidden="true"/></button></div>
        </div> : null}
        {step === 2 ? <div className="motion-stage" key="step-two">
          <span className="step-kicker">STEP 2 OF 2</span>
          <h2>{intent === "career" ? "What would you like to become?" : intent === "skill" ?
            "What would you like to learn?" : "Explore at your own pace."}</h2>
          <p className="form-lead">{intent === "career" ? "Choose one direction. You can change it at any time." :
            "No career decision needed right now. Start with one interesting skill, or explore freely."}</p>
          {intent === "career" ? <div className="sx-career-picker">
            {careers.map(option => <button type="button" key={option.id}
              aria-pressed={learning.primaryCareerId === option.id}
              className={`sx-career-choice ${learning.primaryCareerId === option.id ? "selected" : ""}`}
              onClick={() => chooseCareer(option.id)}>
              <strong>{option.title}</strong><small>{option.subtitle}</small>
              {learning.primaryCareerId === option.id ? <Check aria-hidden="true" size={19}/> : <ArrowRight aria-hidden="true" size={19}/>}
            </button>)}
          </div> : null}
          {intent === "skill" ? <div className="sx-onboarding-topic">
            <LearningGoalEditor value={{...learning, primaryCareerId:null}}
              compact onChange={value => setLearning({...value, primaryCareerId:null})}/>
          </div> : null}
          {selectedCareer && intent === "career" ? <div className="sx-path-preview">
            <span className="eyebrow">YOUR STARTING PATH</span>
            <p>{selectedCareer.title} — explore skills such as {selectedCareer.skills.slice(0,3)
              .map(item=>skillById[item.skillId]?.label ?? item.skillId).join(", ")}.</p>
            <small>These are career prerequisites, not scores or an assessment of you.</small>
          </div> : null}
          <label className="field sx-hours-field">How many hours can you spend learning each week?
            <select className="input" value={hours} onChange={e => setHours(Number(e.target.value))}>
              {[2,4,6,8,10,12,15].map(value=><option value={value} key={value}>{value} hours / week</option>)}
            </select>
          </label>
          {intent === "career" ? <div className="sx-advanced">
            <button type="button" className="sx-advanced-toggle" aria-expanded={advanced} onClick={()=>setAdvanced(!advanced)}>
              <SlidersHorizontal aria-hidden="true" size={17}/> {advanced ? "Hide" : "Customize"} skills and tools (optional)
            </button>
            {advanced ? <LearningGoalEditor value={learning} compact onChange={setLearning}/> : null}
          </div> : null}
          <div className="form-actions">
            <button type="button" className="btn btn-quiet" onClick={()=>setStep(1)}>
              <ArrowLeft aria-hidden="true"/> Back</button>
            <button type="button" className="btn btn-primary" disabled={!canFinish || navigating} onClick={finish} aria-busy={navigating}>
              {navigating?<ActionSpinner label="Preparing your learning home…"/>:<>Take me to my learning home <ArrowRight aria-hidden="true"/></>}
            </button>
          </div>
        </div> : null}
        {navigating?<div className="motion-action-status"><ActivityIndicator compact label="Opening your personal learning journey…"/></div>:null}
      </section>
    </div>
  </main>;
}
