"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, GitBranch, LockKeyhole, Target } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { RoadmapGraph } from "@/components/roadmap-graph";
import { StatusPill } from "@/components/workspace-ui";
import { missions, skillById } from "@/data/catalog";
import { clamp, getNextSkills, getSkillState, selectCareer, type SkillState } from "@/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

type RoadmapFilter = "all" | "next" | "gaps" | "strong";

const stateLabels:Record<SkillState,string> = {strong:"Strong estimate",available:"Ready to start","in-progress":"In progress",blocked:"Blocked"};

export default function Roadmap() {
  const {careerId,skills} = useSkillmetry();
  const career = selectCareer(careerId);
  const initialSkill = getNextSkills(career,skills,1)[0]?.skillId ?? career.skills[0].skillId;
  const [selectedId,setSelectedId] = useState(initialSkill);
  const [filter,setFilter] = useState<RoadmapFilter>("all");
  const allSkillIds = useMemo(() => { const result = new Set<string>(); const add = (id:string) => { if (result.has(id)) return; result.add(id); skillById[id].prerequisites.forEach(add); }; career.skills.forEach(item => add(item.skillId)); return [...result]; },[career]);
  const visibleIds = useMemo(() => new Set(allSkillIds.filter(id => { const state = getSkillState(id,skills); if (filter === "next") return state === "available" || state === "in-progress"; if (filter === "gaps") return state !== "strong"; if (filter === "strong") return state === "strong"; return true; })),[allSkillIds,filter,skills]);
  const selected = skillById[selectedId] ?? skillById[allSkillIds[0]];
  const selectedState = getSkillState(selected.id,skills);
  const relatedMissions = missions.filter(mission => mission.roleId === careerId && mission.skillId === selected.id);

  return <><SectionTitle eyebrow="Adaptive roadmap" title={`${career.title} pathway`} description="Explore the real prerequisite graph behind your current plan. Select any skill to inspect why it is available or blocked." action={<Link href="/careers" className="btn btn-quiet">Compare careers</Link>}/><div className="roadmap-toolbar"><div className="filter-tabs" role="group" aria-label="Filter roadmap skills">{([['all','All skills'],['next','Next actions'],['gaps','Skill gaps'],['strong','Strong']] as [RoadmapFilter,string][]).map(([value,label]) => <button type="button" key={value} className={filter === value ? "active" : ""} onClick={()=>setFilter(value)}>{label}<span>{allSkillIds.filter(id => value === "all" || value === "next" && ["available","in-progress"].includes(getSkillState(id,skills)) || value === "gaps" && getSkillState(id,skills) !== "strong" || value === "strong" && getSkillState(id,skills) === "strong").length}</span></button>)}</div><div className="roadmap-legend"><span><i className="legend-dot strong"/>Strong</span><span><i className="legend-dot next"/>Actionable</span><span><i className="legend-dot blocked"/>Blocked</span></div></div>
    <div className="roadmap-layout"><section className="roadmap-canvas" aria-label="Interactive skill dependency map"><RoadmapGraph career={career} proficiency={skills} selectedId={selected.id} onSelect={setSelectedId} visibleIds={visibleIds}/><div className="roadmap-list-fallback">{[...visibleIds].map(id => { const skill = skillById[id]; const state = getSkillState(id,skills); return <button type="button" key={id} className={selected.id === id ? "selected" : ""} onClick={()=>setSelectedId(id)}><span><strong>{skill.label}</strong><small>{skill.group}</small></span><StatusPill tone={state === "strong" ? "success" : state === "blocked" ? "warning" : "accent"}>{stateLabels[state]}</StatusPill></button>; })}</div></section><aside className="skill-detail-panel"><div className="skill-detail-top"><span className="skill-group">{selected.group}</span><StatusPill tone={selectedState === "strong" ? "success" : selectedState === "blocked" ? "warning" : "accent"}>{stateLabels[selectedState]}</StatusPill></div><h2>{selected.label}</h2><p>{selected.description}</p><div className="skill-score-line"><div><span>Current estimate</span><strong>{clamp(skills[selected.id] ?? 0)} / 100</strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${clamp(skills[selected.id] ?? 0)}%`}}/></div></div><div className="detail-section"><h3>Prerequisites</h3>{selected.prerequisites.length ? <ul className="prerequisite-list">{selected.prerequisites.map(id => { const met = clamp(skills[id] ?? 0) >= 50; return <li key={id}>{met ? <CheckCircle2 aria-hidden="true"/> : <LockKeyhole aria-hidden="true"/>}<span><strong>{skillById[id].label}</strong><small>{met ? "Threshold met" : `${clamp(skills[id] ?? 0)}/100 · reach 50 to unlock`}</small></span></li>; })}</ul> : <p className="note">No prerequisites. You can start here.</p>}</div><div className="detail-section"><h3>Relevant missions</h3>{relatedMissions.length ? relatedMissions.map(mission => <Link key={mission.id} href="/missions" className="related-mission"><Target aria-hidden="true"/><span><strong>{mission.title}</strong><small><Clock3 aria-hidden="true"/>{mission.estimatedHours} estimated hours</small></span><ArrowRight aria-hidden="true"/></Link>) : <p className="note">No curated mission currently targets this skill. Skillmetry will not invent one while AI generation is unavailable.</p>}</div><Link className="btn btn-primary detail-cta" href="/simulator">Explore possible impact <ArrowRight aria-hidden="true"/></Link></aside></div><p className="method-note"><GitBranch aria-hidden="true"/>A skill is actionable when its prerequisites are at least 50/100. A strong estimate begins at 70/100. These are transparent prototype thresholds, not credentials.</p>
  </>;
}
