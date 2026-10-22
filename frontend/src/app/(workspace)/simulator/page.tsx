"use client";

import { useMemo, useState } from "react";
import { Check, Clock3, FlaskConical, Info, RotateCcw, TrendingUp } from "lucide-react";
import { CareerDirectionRequired } from "@/components/career-direction-required";
import { SectionTitle } from "@/components/section-title";
import { EmptyState, StatusPill } from "@/components/workspace-ui";
import { missions, skillById } from "@skillmetry/shared/data/catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { applyScenario, readiness, selectCareer } from "@skillmetry/shared/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Simulator() {
  const { careerId, preferences } = useSkillmetry();
  const { scores } = useAssessmentProfile();
  const career = selectCareer(careerId);
  const [checked, setChecked] = useState<string[]>([]);
  const roleMissions = useMemo(() => missions.filter(mission => mission.roleId === careerId), [careerId]);
  const active = useMemo(() => roleMissions.filter(mission => checked.includes(mission.id)), [checked, roleMissions]);
  const scenarioSkills = useMemo(() => applyScenario(scores, active), [active, scores]);
  const baseline = readiness(career, scores);
  const projected = readiness(career, scenarioSkills);
  const totalHours = active.reduce((sum, mission) => sum + mission.estimatedHours, 0);

  if (!preferences.learning.primaryCareerId) return <><SectionTitle eyebrow="Compare Study Plans" title="Test a learning plan before committing" description="This comparison uses role-specific project plans and does not infer a career from independent skill or tool goals."/><CareerDirectionRequired feature="Compare Study Plans"/></>;

  return <>
    <SectionTitle eyebrow="Compare Study Plans" title="Test a learning plan before committing" description="Compare illustrative project gains with measured quiz results. Scenario values stay temporary and never update My Skill Progress."/>
    <div className="simulator-disclaimer"><FlaskConical aria-hidden="true"/><div><strong>Simulation mode</strong><span>Planning assumptions only · no progress is saved</span></div><StatusPill tone="warning">Hypothetical</StatusPill></div>
    <div className="simulator-layout"><section className="panel"><div className="panel-header"><div><span className="eyebrow">Learning inputs</span><h2>Select projects to compare</h2></div><span className="selection-count">{checked.length} selected</span></div><div className="scenario-options">{roleMissions.map(mission => { const selected = checked.includes(mission.id); return <label key={mission.id} className={`scenario-option ${selected ? "selected" : ""}`}><input className="sr-only" type="checkbox" checked={selected} onChange={event => setChecked(current => event.target.checked ? [...current,mission.id] : current.filter(id => id !== mission.id))}/><span className="scenario-check">{selected ? <Check aria-hidden="true"/> : null}</span><span className="scenario-copy"><strong>{mission.title}</strong><small>{mission.description}</small><span><Clock3 aria-hidden="true"/>{mission.estimatedHours} hours <i/> {skillById[mission.skillId].label} +{mission.simulatedGain}</span></span></label>; })}</div></section>
      <aside className="scenario-result motion-stage" key={checked.slice().sort().join(",")}><div className="scenario-result-head"><div><span className="eyebrow">Scenario comparison</span><h2>{active.length ? `${active.length} project${active.length === 1 ? "" : "s"}` : "No plan selected"}</h2></div>{active.length ? <button className="btn btn-quiet" type="button" onClick={() => setChecked([])}><RotateCcw aria-hidden="true"/>Reset</button> : null}</div><div className="score-comparison"><div><span>Measured performance</span><strong>{baseline ?? "—"}{baseline !== null ? <small>/100</small> : null}</strong><StatusPill tone="accent">Quiz-derived</StatusPill></div><TrendingUp aria-hidden="true"/><div><span>Scenario performance</span><strong>{projected ?? "—"}{projected !== null ? <small>/100</small> : null}</strong><StatusPill tone="warning">Hypothetical</StatusPill></div></div>{active.length ? <><div className="scenario-delta"><strong>{baseline !== null && projected !== null ? `${projected - baseline >= 0 ? "+" : ""}${projected - baseline}` : "—"}</strong><span>hypothetical points (not a grade)</span><small>{totalHours} estimated learning hours</small></div><div className="scenario-skill-list"><h3>Illustrative skill changes</h3>{active.map(mission => <div key={mission.id}><span>{skillById[mission.skillId].label}</span><span>{Object.hasOwn(scores, mission.skillId) ? <><del>{scores[mission.skillId]}</del><strong>{scenarioSkills[mission.skillId]}</strong></> : <strong>Not assessed · no projection</strong>}</span></div>)}</div></> : <EmptyState title="Build a scenario" description="Choose one or more curated projects to compare hypothetical impact without altering trusted scores."/>}<div className="scenario-note"><Info aria-hidden="true"/><p>Projected gains apply only to assessed skills. An unknown skill is never assumed to start at 0%.</p></div></aside>
    </div>
  </>;
}
