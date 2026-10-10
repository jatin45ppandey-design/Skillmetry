"use client";

import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Clock3, FileCheck2, Sparkles, Target } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { StatusPill } from "@/components/workspace-ui";
import { missions, skillById } from "@/data/catalog";
import { getNextSkills, selectCareer } from "@/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Missions() {
  const {careerId,skills} = useSkillmetry();
  const career = selectCareer(careerId);
  const roleMissions = missions.filter(mission => mission.roleId === careerId);
  const prioritySkills = new Set(getNextSkills(career,skills,3).map(skill => skill.skillId));

  return <><SectionTitle eyebrow="Missions workspace" title="Turn skill gaps into concrete work" description={`Curated ${career.title} briefs with explicit deliverables. Completion and evidence review are not connected in this prototype.`} action={<Link href="/roadmap" className="btn btn-quiet">Review roadmap</Link>}/><section className="ai-availability"><div className="ai-availability-icon"><Bot aria-hidden="true"/></div><div><div><strong>AI mission generation</strong><StatusPill tone="neutral">Not connected</StatusPill></div><p>Skillmetry is using reviewed catalog missions only. It will not fabricate a personalized brief while the secure server integration is unavailable.</p></div><button className="btn btn-quiet" type="button" disabled><Sparkles aria-hidden="true"/>Generate with AI</button></section><div className="mission-grid">{roleMissions.map((mission,index) => { const priority = prioritySkills.has(mission.skillId); return <article key={mission.id} className={`mission-work-card ${priority ? "priority" : ""}`}><div className="mission-card-top"><span className="mission-index">M{String(index+1).padStart(2,"0")}</span><div>{priority ? <StatusPill tone="accent">Roadmap priority</StatusPill> : <StatusPill tone="neutral">Curated mission</StatusPill>}<StatusPill tone="neutral"><Clock3 aria-hidden="true"/>{mission.estimatedHours}h</StatusPill></div></div><div className="mission-title-row"><span><Target aria-hidden="true"/></span><div><h2>{mission.title}</h2><p>{mission.description}</p></div></div><div className="mission-focus"><span>Primary skill</span><strong>{skillById[mission.skillId].label}</strong></div><div className="mission-deliverables"><h3><FileCheck2 aria-hidden="true"/>Acceptance checklist</h3><ul>{mission.deliverables.map(item => <li key={item}><CheckCircle2 aria-hidden="true"/>{item}</li>)}</ul></div><div className="mission-card-footer"><p>Evidence workflow: <strong>not submitted</strong></p><Link className="text-link" href="/simulator">Simulate this mission <ArrowRight aria-hidden="true"/></Link></div></article>; })}</div></>;
}
