"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Brand } from "@/components/brand";
import { LearningGoalEditor } from "@/components/learning-goal-editor";
import { StepMarker } from "@/components/workspace-ui";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { useAuth } from "@/components/auth-provider";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { CareerId } from "@skillmetry/shared/types/domain";

export default function Onboarding() {
  const router = useRouter();
  const { user, syncStatus } = useAuth();
  const { name, careerId, preferences, completeOnboarding } = useSkillmetry();
  const [step, setStep] = useState(1);
  const [localName, setLocalName] = useState(name === "Demo Student" ? "" : name);
  const [selected, setSelected] = useState<CareerId>(careerId);
  const [learningGoals, setLearningGoals] = useState(preferences.learning);
  // A public explorer selection is only a suggested goal. Validate against the
  // canonical catalog; do not import scores or bypass onboarding confirmation.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("career");
    const matching = careers.find(career => career.id === requested);
    if (!matching) return;
    setSelected(matching.id);
    setLearningGoals(current => ({ ...current, primaryCareerId: matching.id }));
  }, []);
  const previewCareer = careers.find(career => career.id === learningGoals.primaryCareerId) ?? null;
  const previewSkills = learningGoals.selectedSkillIds.map(id => skillById[id]?.label ?? id);

  function submit() {
    completeOnboarding(localName.trim() || "Student", selected, { ...preferences, learning: learningGoals });
    router.push("/dashboard");
  }

  return <main className="onboarding-shell">
    <nav className="onboarding-nav"><Brand/><Link className="btn btn-quiet" href="/"><ArrowLeft aria-hidden="true"/>Back to home</Link></nav>
    <div className="onboarding-layout">
      <aside className="onboarding-aside">
        <div><span className="eyebrow">Learning setup</span><h1>Choose a direction. Or build your own.</h1><p>Your Digital Twin begins unassessed. Numerical skill scores appear only after a secure, server-graded quiz.</p></div>
        <div className="onboarding-steps"><StepMarker step={1} label="About you" active={step === 1} complete={step > 1}/><StepMarker step={2} label="Learning goals" active={step === 2} complete={false}/></div>
        <div className="privacy-note"><Info aria-hidden="true"/><p>{user ? syncStatus === "offline" ? "You are offline. Your selection stays local and will sync after reconnecting." : "Your learning goals will sync to your private account." : "This profile stays in this browser. Sign in when you want to take secure assessments."}</p></div>
      </aside>
      <section className="onboarding-card" aria-live="polite">
        {step === 1 ? <div><span className="step-kicker">Step 1 of 2</span><h2>What should we call you?</h2><p className="form-lead">We use your first name to personalize your workspace.</p><label className="field">First name<input autoFocus className="input input-large" value={localName} onChange={event => setLocalName(event.target.value)} maxLength={64} placeholder="e.g. Jatin" autoComplete="given-name"/></label><div className="form-actions"><span/><button className="btn btn-primary" type="button" disabled={!localName.trim()} onClick={() => setStep(2)}>Choose a career <ArrowRight aria-hidden="true"/></button></div></div> : null}
        {step === 2 ? <div><span className="step-kicker">Step 2 of 2</span><h2>Build your own study kit</h2><p className="form-lead">A career is optional. Add one or more skills and tools instead, or combine all three. Unassessed skills remain explicitly unknown.</p><aside className="onboarding-preview" aria-live="polite" aria-label="Live learning direction preview">
          <div className="onboarding-preview-head"><Info size={16} aria-hidden="true"/> YOUR LEARNING KIT / LIVE PREVIEW</div>
          <h3>{previewCareer?.title ?? "A self-directed learning path"}</h3>
          <p>{previewCareer?.subtitle ?? "Your selected skills and tools shape your personal direction. Choosing a career is optional."}</p>
          <div className="onboarding-preview-chips">
            {previewSkills.slice(0, 4).map(label => <span key={label}>{label}</span>)}
            {previewSkills.length > 4 ? <span>+{previewSkills.length - 4} skills</span> : null}
            <span>{learningGoals.selectedToolIds.length} tools selected</span>
          </div>
          <small className="onboarding-preview-note">This previews your chosen goals, not assessment scores. Your skill record starts unassessed until you complete a supported secure quiz.</small>
        </aside>
        <LearningGoalEditor value={learningGoals} onChange={value => { setLearningGoals(value); if (value.primaryCareerId) setSelected(value.primaryCareerId); }}/><div className="form-actions"><button className="btn btn-quiet" type="button" onClick={() => setStep(1)}><ArrowLeft aria-hidden="true"/>Back</button><button className="btn btn-primary" type="button" onClick={submit}>Open my workspace <ArrowRight aria-hidden="true"/></button></div></div> : null}
      </section>
    </div>
  </main>;
}
