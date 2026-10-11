"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BrainCircuit, Check, Info, LayoutPanelTop, ServerCog } from "lucide-react";
import { Brand } from "@/components/brand";
import { StepMarker } from "@/components/workspace-ui";
import { careers, skillById } from "@/data/catalog";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { CareerId, SkillMap } from "@/types/domain";

const careerIcons = {"ml-engineer":BrainCircuit,"frontend-developer":LayoutPanelTop,"backend-developer":ServerCog};

export default function Onboarding() {
  const router = useRouter();
  const {name,careerId,skills,completeOnboarding} = useSkillmetry();
  const [step,setStep] = useState(1);
  const [localName,setLocalName] = useState(name === "Demo Student" ? "" : name);
  const [selected,setSelected] = useState<CareerId>(careerId);
  const [ratings,setRatings] = useState<SkillMap>(() => careerId === "ml-engineer" && name === "Demo Student" ? {} : {...skills});
  const career = careers.find(item => item.id === selected)!;

  function submit() {
    const roleSkills = Object.fromEntries(career.skills.map(skill => [skill.skillId,ratings[skill.skillId] ?? 0]));
    completeOnboarding(localName.trim() || "Student",selected,roleSkills);
    router.push("/dashboard");
  }

  return <main className="onboarding-shell"><nav className="onboarding-nav"><Brand/><Link className="btn btn-quiet" href="/"><ArrowLeft aria-hidden="true"/>Back to home</Link></nav><div className="onboarding-layout"><aside className="onboarding-aside"><div><span className="eyebrow">Career setup</span><h1>Build a baseline you can improve.</h1><p>Start with your own estimate. Skillmetry keeps claims, assessments, simulations, and verified evidence distinct.</p></div><div className="onboarding-steps"><StepMarker step={1} label="About you" active={step===1} complete={step>1}/><StepMarker step={2} label="Career goal" active={step===2} complete={step>2}/><StepMarker step={3} label="Skill baseline" active={step===3} complete={false}/></div><div className="privacy-note"><Info aria-hidden="true"/><p>This prototype stores your profile locally in this browser. No resume or account is required.</p></div></aside><section className="onboarding-card" aria-live="polite">
    {step === 1 ? <div><span className="step-kicker">Step 1 of 3</span><h2>What should we call you?</h2><p className="form-lead">We use your first name to personalize your workspace.</p><label className="field">First name<input autoFocus className="input input-large" value={localName} onChange={event=>setLocalName(event.target.value)} maxLength={64} placeholder="e.g. Jatin" autoComplete="given-name"/></label><div className="form-actions"><span/><button className="btn btn-primary" type="button" disabled={!localName.trim()} onClick={()=>setStep(2)}>Choose a career <ArrowRight aria-hidden="true"/></button></div></div> : null}
    {step === 2 ? <div><span className="step-kicker">Step 2 of 3</span><h2>Choose a direction</h2><p className="form-lead">This changes role weights, roadmap dependencies, and the missions you see. You can switch later.</p><div className="career-choice-grid">{careers.map(item => { const Icon = careerIcons[item.id]; const active = selected === item.id; return <button type="button" key={item.id} onClick={()=>setSelected(item.id)} className={`career-choice ${active ? "selected" : ""}`} aria-pressed={active}><span className="career-choice-icon"><Icon aria-hidden="true"/></span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span>{active ? <Check className="career-check" aria-hidden="true"/> : null}</button>; })}</div><div className="form-actions"><button className="btn btn-quiet" type="button" onClick={()=>setStep(1)}><ArrowLeft aria-hidden="true"/>Back</button><button className="btn btn-primary" type="button" onClick={()=>setStep(3)}>Set my baseline <ArrowRight aria-hidden="true"/></button></div></div> : null}
    {step === 3 ? <div><span className="step-kicker">Step 3 of 3</span><h2>Estimate your current familiarity</h2><p className="form-lead">Use the guide, not aspiration: 0 is not started, 50 is guided work, and 100 is independent confidence.</p><div className="rating-list">{career.skills.map(({skillId}) => <label key={skillId} className="rating-row"><span><strong>{skillById[skillId].label}</strong><small>{skillById[skillId].group} · self-reported</small></span><input className="range" type="range" min="0" max="100" step="10" value={ratings[skillId] ?? 0} onChange={event=>setRatings(current=>({...current,[skillId]:Number(event.target.value)}))}/><output>{ratings[skillId] ?? 0}</output></label>)}</div><div className="form-actions"><button className="btn btn-quiet" type="button" onClick={()=>setStep(2)}><ArrowLeft aria-hidden="true"/>Back</button><button className="btn btn-primary" type="button" onClick={submit}>Open my workspace <ArrowRight aria-hidden="true"/></button></div></div> : null}
  </section></div></main>;
}
