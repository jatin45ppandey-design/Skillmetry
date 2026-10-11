"use client";

import { useMemo, useState } from "react";
import { Check, Clock3, FlaskConical, Info, RotateCcw, TrendingUp } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { EmptyState, StatusPill } from "@/components/workspace-ui";
import { missions, skillById } from "@/data/catalog";
import { applyScenario, readiness, selectCareer } from "@/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Simulator() {
  const {careerId,skills} = useSkillmetry();
  const career = selectCareer(careerId);
  const [checked,setChecked] = useState<string[]>([]);
  const roleMissions = useMemo(() => missions.filter(mission => mission.roleId === careerId),[careerId]);
  const active = useMemo(() => roleMissions.filter(mission => checked.includes(mission.id)),[checked,roleMissions]);
  const scenarioSkills = useMemo(() => applyScenario(skills,active),[active,skills]);
  const baseline = readiness(career,skills);
  const projected = readiness(career,scenarioSkills);
  const totalHours = active.reduce((sum,mission) => sum + mission.estimatedHours,0);

  return <><SectionTitle eyebrow="What-if career simulator" title="Test a learning plan before committing" description="Compare illustrative mission gains with your current baseline. Scenario values stay temporary and never update your skill twin."/><div className="simulator-disclaimer"><FlaskConical aria-hidden="true"/><div><strong>Simulation mode</strong><span>Planning assumptions only · no progress is saved</span></div><StatusPill tone="warning">Hypothetical</StatusPill></div><div className="simulator-layout"><section className="panel"><div className="panel-header"><div><span className="eyebrow">Learning inputs</span><h2>Select missions to compare</h2></div><span className="selection-count">{checked.length} selected</span></div><div className="scenario-options">{roleMissions.map(mission => { const selected = checked.includes(mission.id); return <label key={mission.id} className={`scenario-option ${selected ? "selected" : ""}`}><input className="sr-only" type="checkbox" checked={selected} onChange={event=>setChecked(current=>event.target.checked ? [...current,mission.id] : current.filter(id=>id!==mission.id))}/><span className="scenario-check">{selected ? <Check aria-hidden="true"/> : null}</span><span className="scenario-copy"><strong>{mission.title}</strong><small>{mission.description}</small><span><Clock3 aria-hidden="true"/>{mission.estimatedHours} hours <i/> {skillById[mission.skillId].label} +{mission.simulatedGain}</span></span></label>; })}</div></section><aside className="scenario-result"><div className="scenario-result-head"><div><span className="eyebrow">Scenario comparison</span><h2>{active.length ? `${active.length} mission${active.length === 1 ? "" : "s"}` : "No plan selected"}</h2></div>{active.length ? <button className="btn btn-quiet" type="button" onClick={()=>setChecked([])}><RotateCcw aria-hidden="true"/>Reset</button> : null}</div><div className="score-comparison"><div><span>Current coverage</span><strong>{baseline}<small>/100</small></strong><StatusPill tone="accent">Actual baseline</StatusPill></div><TrendingUp aria-hidden="true"/><div><span>Scenario coverage</span><strong>{projected}<small>/100</small></strong><StatusPill tone="warning">Hypothetical</StatusPill></div></div>{active.length ? <><div className="scenario-delta"><strong>+{projected-baseline}</strong><span>projected coverage points</span><small>{totalHours} estimated learning hours</small></div><div className="scenario-skill-list"><h3>Illustrative skill changes</h3>{active.map(mission => <div key={mission.id}><span>{skillById[mission.skillId].label}</span><span><del>{skills[mission.skillId] ?? 0}</del><strong>{scenarioSkills[mission.skillId]}</strong></span></div>)}</div></> : <EmptyState title="Build a scenario" description="Choose one or more curated missions to compare their illustrative impact with your current profile."/>}<div className="scenario-note"><Info aria-hidden="true"/><p>Projected gains are fixed prototype assumptions. Real progress requires new evidence or assessment and may differ.</p></div></aside></div></>;
}
