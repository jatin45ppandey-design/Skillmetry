"use client";

import { useState } from "react";
import { CareerDirectionRequired } from "@/components/career-direction-required";
import { SectionTitle } from "@/components/section-title";
import { skillById } from "@skillmetry/shared/data/catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { getSkillGaps, selectCareer } from "@skillmetry/shared/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Jobs() {
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState(false);
  const { careerId, preferences } = useSkillmetry();
  const { scores } = useAssessmentProfile();
  const role = selectCareer(careerId);
  if (!preferences.learning.primaryCareerId) return <><SectionTitle eyebrow="Planned AI feature" title="Job description roadmap" description="AI-powered extraction is intentionally not enabled until a secure server-side API is connected."/><CareerDirectionRequired feature="role-specific job comparison"/></>;
  return <><SectionTitle eyebrow="Planned AI feature" title="Job description → roadmap" description="AI-powered extraction is intentionally not enabled until a secure server-side API is connected."/><div className="grid-2"><div className="panel"><label className="field">Job description<textarea className="input" rows={11} placeholder="Paste a job description. Processing is not yet connected." value={description} onChange={event => { setDescription(event.target.value); setFeedback(false); }}/></label><button type="button" className="btn btn-primary" style={{marginTop:18}} disabled={!description.trim()} onClick={() => setFeedback(true)}>View implementation status</button>{feedback && <p className="note" role="status">AI extraction is outside this milestone. Do not paste sensitive information.</p>}</div><div className="panel"><h2 style={{fontSize:"1.1rem"}}>Current role skills</h2><p className="note">These use your selected role and trusted quiz results, not the pasted description.</p>{getSkillGaps(role,scores).slice(0,5).map(gap => <div className="row between" style={{padding:"13px 0",borderBottom:"1px solid #25344B"}} key={gap.skillId}><span className="small">{skillById[gap.skillId].label}</span><span className="tag">{gap.proficiency === null ? "Not assessed" : `${gap.proficiency}/100`}</span></div>)}</div></div></>;
}
