"use client";

import {useState} from "react";
import Link from "next/link";
import {ArrowRight,BrainCircuit,Check,GitBranch,Layers3,LayoutPanelTop,ServerCog} from "lucide-react";
import {SectionTitle} from "@/components/section-title";
import {StatusPill} from "@/components/workspace-ui";
import {careers,skillById} from "@skillmetry/shared/data/catalog";
import {useAssessmentProfile} from "@/hooks/use-assessment-profile";
import {assessmentSnapshot} from "@skillmetry/shared/lib/assessments/grading";
import {compareCareerCurricula} from "@skillmetry/shared/lib/career-comparison";
import {useSkillmetry} from "@/store/use-skillmetry";

const careerIcons={"ml-engineer":BrainCircuit,"frontend-developer":LayoutPanelTop,
 "backend-developer":ServerCog,"full-stack-developer":Layers3};

export default function Careers(){
 const {preferences,setCareer,onboardingCompleted}=useSkillmetry();
 const {attempts,scores,illustrative,status}=useAssessmentProfile();
 const careerId=onboardingCompleted?preferences.learning.primaryCareerId:null;
 const [previewId,setPreviewId]=useState<string|null>(null);
 const [comparisonId,setComparisonId]=useState<string|null>(null);
 const preview=careers.find(c=>c.id===(previewId??careerId))??careers[0];
 const comparedId=comparisonId&&comparisonId!==preview.id?comparisonId:careers.find(c=>c.id!==preview.id)?.id??null;
 const comparison=comparedId?compareCareerCurricula(preview.id,comparedId):null;
 const compared=careers.find(c=>c.id===comparedId)??null;
 const previewSnapshot=assessmentSnapshot(preview,attempts);
 const highlights=preview.skills.filter(skill=>Object.hasOwn(scores,skill.skillId))
  .sort((a,b)=>scores[b.skillId]-scores[a.skillId]).slice(0,3);
 const isCurrent=preview.id===careerId;
 return <div className="sx-career-page">
  <SectionTitle eyebrow="Career explorer" title="Explore career paths" description="Compare what each role teaches and the quiz evidence you actually have. Coverage is not a hiring or suitability score."/>
  {illustrative?<p className="sx-career-demo">Example quiz evidence only. Sign in to start your own measured learning path.</p>:status==="error"||status==="offline"?<p className="sx-career-demo" role="status">Verified results are unavailable. Career information remains available without estimated scores.</p>:null}
  <div className="sx-career-workspace">
   <section className="sx-career-options" aria-label="Choose a career to preview">
    <div className="sx-career-options-header"><h2>Career directions</h2><span>{careers.length} pathways</span></div>
    {careers.map(career=>{
     const Icon=careerIcons[career.id];
     const current=career.id===careerId;
     const selected=career.id===preview.id;
     const snapshot=assessmentSnapshot(career,attempts);
     return <button key={career.id} className={"sx-career-option"+(selected?" selected":"")} type="button"
       aria-pressed={selected} onClick={()=>setPreviewId(career.id)}>
       <span className="sx-career-option-icon"><Icon size={20} aria-hidden="true"/></span>
       <span className="sx-career-option-copy"><strong>{career.title}</strong><small>{career.subtitle}</small></span>
       <span className="sx-career-option-status">{current?<Check size={16} aria-label="Current goal"/>:<span>{snapshot.coveragePercent}%<small> assessed</small></span>}</span>
     </button>;
    })}
   </section>
   <section className="sx-career-inspector" aria-live="polite" aria-label="Selected career details">
    <div className="sx-career-inspector-head">
     <div><span className="eyebrow">SELECTED PATHWAY</span><h2>{preview.title}</h2><p>{preview.subtitle}</p></div>
     <StatusPill tone={isCurrent?"success":"neutral"}>{isCurrent?"Current goal":"Preview"}</StatusPill>
    </div>
    <div className="sx-career-inspector-metrics">
      <div><strong>{preview.skills.length}</strong><small>Core pathway skills</small></div>
      <div><strong>{status==="loading"?"—":previewSnapshot.coveragePercent+"%"}</strong><small>Assessment coverage</small></div>
      <div><strong>{highlights.length}</strong><small>Skills measured here</small></div>
    </div>
    <h3>Skills in this pathway</h3>
    <div className="sx-career-skill-list">
      {preview.skills.slice(0,8).map(item=><div key={item.skillId}>
       <span>{skillById[item.skillId]?.label??item.skillId}</span>
       <small>{Object.hasOwn(scores,item.skillId)?scores[item.skillId]+"/100":"Not assessed"}</small>
      </div>)}
    </div>
    <p className="sx-career-evidence-note">{highlights.length?
      "Only completed quizzes contribute to the measured values above.":
      "No overlapping skill assessment results yet; this is not a negative career verdict."}</p>
    <div className="sx-career-inspector-actions">
      {isCurrent?<Link className="btn btn-primary" href="/roadmap">Open my roadmap <ArrowRight aria-hidden="true"/></Link>:
        <button className="btn btn-primary" type="button" onClick={()=>setCareer(preview.id)}>Set as my goal <Check size={17} aria-hidden="true"/></button>}
      <Link className="btn btn-outline" href="/resources">Explore learning resources <ArrowRight size={17} aria-hidden="true"/></Link>
    </div>
    {comparison&&compared?<section className="sx-career-comparison" aria-labelledby="sx-career-comparison-title">
      <div><span className="eyebrow">CURRICULUM COMPARISON</span><h3 id="sx-career-comparison-title">{preview.title} and {compared.title}</h3></div>
      <label>Compare with<select value={compared.id} onChange={event=>setComparisonId(event.target.value)}>
        {careers.filter(c=>c.id!==preview.id).map(c=><option value={c.id} key={c.id}>{c.title}</option>)}
      </select></label>
      <div className="sx-career-comparison-grid">
       <div><strong>Shared foundations</strong><p>{comparison.shared.length?comparison.shared.map(item=>item.label).join(", "):"No shared canonical skills."}</p></div>
       <div><strong>{preview.title} focus</strong><p>{comparison.primaryOnly.length?comparison.primaryOnly.map(item=>item.label).join(", "):"No pathway-specific skills."}</p></div>
       <div><strong>{compared.title} focus</strong><p>{comparison.comparedOnly.length?comparison.comparedOnly.map(item=>item.label).join(", "):"No pathway-specific skills."}</p></div>
      </div>
      <small>This compares published learning pathways, not job-market fit or your readiness.</small>
    </section>:null}
   </section>
  </div>
  <p className="sx-career-footer"><GitBranch size={16} aria-hidden="true"/>Switching careers changes your learning direction, never your existing quiz evidence. Save your full learning profile in <Link href="/onboarding">onboarding</Link>.</p>
 </div>;
}
