"use client";

import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Clock3, FileCheck2, Sparkles, Target } from "lucide-react";
import { CareerDirectionRequired } from "@/components/career-direction-required";
import { MissionEvidencePanel } from "@/components/mission-evidence-panel";
import { AIMissionPanel } from "@/components/ai-mission-panel";
import { useMissionSubmissions } from "@/hooks/use-mission-submissions";
import { SectionTitle } from "@/components/section-title";
import { StatusPill } from "@/components/workspace-ui";
import { missions, skillById } from "@skillmetry/shared/data/catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { getNextSkills, selectCareer } from "@skillmetry/shared/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Missions() {
  const {careerId, preferences} = useSkillmetry();
  const {scores} = useAssessmentProfile();
  const evidence = useMissionSubmissions();
  const career = selectCareer(careerId);
  const roleMissions = missions.filter(mission => mission.roleId === careerId);
  const prioritySkills = new Set(getNextSkills(career,scores,3).map(skill => skill.skillId));

  if (!preferences.learning.primaryCareerId) return <><SectionTitle eyebrow="Missions workspace" title="Turn skill gaps into concrete work" description="Reviewed missions are organized by career track. Independent skill and tool goals continue to work in the adaptive roadmap." action={<Link href="/roadmap" className="btn btn-quiet">Review roadmap</Link>}/><CareerDirectionRequired feature="AI Missions Workspace"/></>;

  return <><SectionTitle eyebrow="Missions workspace" title="Turn skill gaps into concrete work" description={`Curated ${career.title} briefs with explicit deliverables. Save a private project draft or submit self-reported evidence. No skill scores or verification status are created.`} action={<Link href="/roadmap" className="btn btn-quiet">Review roadmap</Link>}/><section className="ai-availability"><div className="ai-availability-icon"><Bot aria-hidden="true"/></div><div><div><strong>AI mission generation</strong><StatusPill tone="neutral">Not connected</StatusPill></div><p>Optional AI guidance is available only when the owner enables a server-side Gemini provider and verified database quota. Existing curated missions remain the default.</p></div><span className="btn btn-quiet"><Sparkles aria-hidden="true"/> Opt-in only</span></section><div className="mission-grid">{roleMissions.map((mission,index) => { const priority = prioritySkills.has(mission.skillId); return <article key={mission.id} className={`mission-work-card ${priority ? "priority" : ""}`}><div className="mission-card-top"><span className="mission-index">M{String(index+1).padStart(2,"0")}</span><div>{priority ? <StatusPill tone="accent">Roadmap priority</StatusPill> : <StatusPill tone="neutral">Curated mission</StatusPill>}<StatusPill tone="neutral"><Clock3 aria-hidden="true"/>{mission.estimatedHours}h</StatusPill></div></div><div className="mission-title-row"><span><Target aria-hidden="true"/></span><div><h2>{mission.title}</h2><p>{mission.description}</p></div></div><div className="mission-focus"><span>Primary skill</span><strong>{skillById[mission.skillId].label}</strong></div><div className="mission-deliverables"><h3><FileCheck2 aria-hidden="true"/>Acceptance checklist</h3><ul>{mission.deliverables.map(item => <li key={item}><CheckCircle2 aria-hidden="true"/>{item}</li>)}</ul></div><div className="mission-card-footer"><p>Evidence is <strong>self-reported, not verified</strong></p><Link className="text-link" href="/simulator">Simulate this mission <ArrowRight aria-hidden="true"/></Link></div>
    <AIMissionPanel mission={mission} authenticated={Boolean(evidence.user)} />
    <MissionEvidencePanel mission={mission} record={evidence.records.find(item => item.missionId === mission.id) ?? null}
      status={evidence.status} onSaved={evidence.onSaved}/>
  </article>; })}</div></>;
}
