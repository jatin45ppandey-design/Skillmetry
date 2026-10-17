"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, GitBranch, LockKeyhole, Target, Wrench } from "lucide-react";
import { RecommendationPanel } from "@/components/recommendation-panel";
import { RoadmapGraph } from "@/components/roadmap-graph";
import { SectionTitle } from "@/components/section-title";
import { EmptyState, StatusPill } from "@/components/workspace-ui";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, missions, skillById } from "@skillmetry/shared/data/catalog";
import { toolById } from "@skillmetry/shared/data/learning-catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { useLearningActivity } from "@/hooks/use-learning-activity";
import { performanceLabel } from "@skillmetry/shared/lib/assessments/grading";
import { getCareerRoadmapBrowseHref, getResourceBrowseHref } from "@skillmetry/shared/lib/resource-intelligence";
import { buildRecommendations } from "@skillmetry/shared/lib/recommendations";
import { clamp, getSkillState, getPrerequisiteEvidence, type SkillState } from "@skillmetry/shared/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { LearningRecommendation, ToolId } from "@skillmetry/shared/types/domain";

type RoadmapFilter = "all" | "next" | "unassessed" | "strong";
type SelectedTarget = { kind: "skill"; id: string } | { kind: "tool"; id: ToolId };

const stateLabels: Record<SkillState, string> = { strong: "Strong Quiz Performance", developing: "Developing", unassessed: "Assessment Recommended", blocked: "Prerequisite needs practice" };

function collectSkillIds(seedIds: string[]) {
  const result = new Set<string>();
  const add = (id: string) => {
    if (result.has(id) || !skillById[id]) return;
    result.add(id);
    skillById[id].prerequisites.forEach(add);
  };
  seedIds.forEach(add);
  return [...result];
}

function assessmentHref(assessmentId: string) {
  return `/assessments?assessment=${encodeURIComponent(assessmentId)}`;
}

export default function Roadmap() {
  const { preferences } = useSkillmetry();
  const { attempts, scores, illustrative, status, message } = useAssessmentProfile();
  const activity = useLearningActivity();
  const [selected, setSelected] = useState<SelectedTarget | null>(null);
  const [filter, setFilter] = useState<RoadmapFilter>("all");
  const learning = preferences.learning;
  const selectedCareer = learning.primaryCareerId ? careers.find(career => career.id === learning.primaryCareerId) ?? null : null;
  const focusSkillIds = useMemo(() => {
    const ids = new Set<string>();
    selectedCareer?.skills.forEach(item => ids.add(item.skillId));
    learning.selectedSkillIds.forEach(id => ids.add(id));
    learning.selectedToolIds.forEach(toolId => {
      const canonicalSkillId = toolById[toolId].canonicalSkillId;
      if (canonicalSkillId) ids.add(canonicalSkillId);
    });
    return [...ids];
  }, [learning.selectedSkillIds, learning.selectedToolIds, selectedCareer]);
  const allSkillIds = useMemo(() => collectSkillIds(focusSkillIds), [focusSkillIds]);
  const plan = useMemo(() => buildRecommendations({ learning, trustedScores: scores, trustedAttempts: attempts }), [attempts, learning, scores]);
  const recommendedIds = useMemo(() => new Set(plan.recommendations.flatMap(item => item.skillId ? [item.skillId] : [])), [plan.recommendations]);
  const visibleIds = useMemo(() => new Set(allSkillIds.filter(id => {
    const state = getSkillState(id, scores);
    if (filter === "next") return state === "unassessed" || state === "developing";
    if (filter === "unassessed") return !Object.hasOwn(scores, id);
    if (filter === "strong") return state === "strong";
    return true;
  })), [allSkillIds, filter, scores]);

  useEffect(() => {
    const validSkill = selected?.kind === "skill" && allSkillIds.includes(selected.id);
    const validTool = selected?.kind === "tool" && learning.selectedToolIds.includes(selected.id);
    if (validSkill || validTool) return;
    if (allSkillIds[0]) setSelected({ kind: "skill", id: allSkillIds[0] });
    else if (learning.selectedToolIds[0]) setSelected({ kind: "tool", id: learning.selectedToolIds[0] });
    else setSelected(null);
  }, [allSkillIds, learning.selectedToolIds, selected]);

  const selectedSkill = selected?.kind === "skill" ? skillById[selected.id] : null;
  const selectedTool = selected?.kind === "tool" ? toolById[selected.id] : null;
  const selectedScore = selectedSkill && Object.hasOwn(scores, selectedSkill.id) ? clamp(scores[selectedSkill.id]) : null;
  const selectedState = selectedSkill ? getSkillState(selectedSkill.id, scores) : null;
  const selectedAssessment = selectedSkill ? assessmentCatalog.find(item => item.skillId === selectedSkill.id) : null;
  const selectedActivity = selectedSkill && activity.status === "ready" ? activity.bySkill[selectedSkill.id] ?? "not_started" : null;
  const selectedRecommendation = selected ? plan.recommendations.find(item => selected.kind === "skill" ? item.skillId === selected.id : item.toolId === selected.id) : null;
  const relatedMissions = selectedSkill && selectedCareer ? missions.filter(mission => mission.roleId === selectedCareer.id && mission.skillId === selectedSkill.id) : [];
  const selectedWeight = selectedSkill ? selectedCareer?.skills.find(item => item.skillId === selectedSkill.id)?.weight : undefined;
  const hasLearningGoals = Boolean(learning.primaryCareerId || learning.selectedSkillIds.length || learning.selectedToolIds.length);

  function selectRecommendation(recommendation: LearningRecommendation) {
    if (recommendation.kind === "tool" && recommendation.toolId) setSelected({ kind: "tool", id: recommendation.toolId });
    else if (recommendation.skillId) setSelected({ kind: "skill", id: recommendation.skillId });
  }

  const title = selectedCareer ? `${selectedCareer.title} pathway` : hasLearningGoals ? "Focused learning roadmap" : "Build your learning roadmap";
  const description = selectedCareer
    ? `The prerequisite graph responds to ${illustrative ? "illustrative sample" : "server-graded"} assessment results and your selected learning goals.`
    : "Choose skills and tools independently, then follow a prerequisite map built from canonical relationships only.";

  return <>
    <SectionTitle eyebrow="Adaptive roadmap" title={title} description={description} action={<div className="resource-overview-actions">{selectedCareer ? <Link href={getCareerRoadmapBrowseHref(selectedCareer.id)} className="btn btn-outline">Explore career roadmaps <ArrowRight aria-hidden="true"/></Link> : null}<Link href="/settings" className="btn btn-quiet">Edit learning goals</Link></div>}/>
    <details className="v3-context-details">
      <summary>About your skill pathway · {allSkillIds.length} related skills · {focusSkillIds.length} selected</summary>
      <p>Skills are connected by prerequisites. Select a node to inspect the skill, relevant resources and quiz availability. These counts are not mastered skill scores.</p>
    </details>
    {status === "loading" ? <p className="roadmap-notice" role="status">Loading trusted assessment history. Existing selections remain available.</p> : null}
    {status === "error" || status === "offline" ? <p className="roadmap-notice warning" role="alert">{message ?? "Trusted assessment history is unavailable. Scores are not estimated."}</p> : null}
    <div className="roadmap-layout">
      <section className="roadmap-canvas" aria-label="Interactive skill dependency map">
        {hasLearningGoals ? <>
          <div className="roadmap-toolbar"><div className="filter-tabs" role="group" aria-label="Filter roadmap skills">{([['all','All skills'],['next','Next actions'],['unassessed','Not assessed'],['strong','Strong']] as [RoadmapFilter,string][]).map(([value,label]) => <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}<span>{allSkillIds.filter(id => value === "all" || value === "next" && ["unassessed","developing"].includes(getSkillState(id, scores)) || value === "unassessed" && !Object.hasOwn(scores, id) || value === "strong" && getSkillState(id, scores) === "strong").length}</span></button>)}</div><div className="roadmap-legend"><span><i className="legend-dot strong"/>Strong</span><span><i className="legend-dot next"/>Measured/actionable</span><span><i className="legend-dot blocked"/>Needs prerequisite</span></div></div>
          {learning.selectedToolIds.length ? <div className="roadmap-tool-strip" aria-label="Selected tools">{learning.selectedToolIds.map(toolId => <button type="button" key={toolId} className={selected?.kind === "tool" && selected.id === toolId ? "selected" : ""} onClick={() => setSelected({ kind: "tool", id: toolId })}><Wrench aria-hidden="true"/>{toolById[toolId].label}{toolById[toolId].canonicalSkillId ? <small>canonical skill</small> : <small>tool focus</small>}</button>)}</div> : null}
          {allSkillIds.length ? <><RoadmapGraph skillIds={focusSkillIds} proficiency={scores} selectedId={selected?.kind === "skill" ? selected.id : undefined} onSelect={id => setSelected({ kind: "skill", id })} visibleIds={visibleIds} recommendedIds={recommendedIds} learningActivity={activity.status==="ready"?activity.bySkill:undefined}/><div className="roadmap-list-fallback">{[...visibleIds].map(id => { const skill = skillById[id]; const state = getSkillState(id, scores); return <button type="button" key={id} className={selected?.kind === "skill" && selected.id === id ? "selected" : ""} onClick={() => setSelected({ kind: "skill", id })}><span><strong>{skill.label}</strong><small>{skill.group} · {activity.status==="ready"?(activity.bySkill[id]??"not_started").replaceAll("_"," "):"Learning activity not loaded"}</small></span><StatusPill tone={state === "strong" ? "success" : state === "blocked" ? "warning" : "accent"}>{stateLabels[state]}</StatusPill></button>; })}</div></> : <div className="tool-only-roadmap"><Wrench aria-hidden="true"/><strong>Tools selected, no prerequisite graph</strong><p>Git, GitHub, and Postman are useful workflow focuses, but Skillmetry does not invent skill nodes or prerequisite edges for them.</p></div>}</> : <EmptyState title="Choose a learning focus" description="Start with an optional career direction, one or more canonical skills, or tools. Your roadmap will remain honest about what has not been assessed." actionHref="/settings" actionLabel="Choose learning goals"/>}
      </section>
      <aside className="roadmap-aside">
        <RecommendationPanel plan={plan} onSelect={selectRecommendation}/>
        {selectedSkill && selectedState ? <section className="skill-detail-panel" aria-live="polite"><div className="skill-detail-top"><span className="skill-group">{selectedSkill.group}</span><StatusPill tone={selectedState === "strong" ? "success" : selectedState === "blocked" ? "warning" : "accent"}>{stateLabels[selectedState]}</StatusPill></div><h2>{selectedSkill.label}</h2><p>{selectedSkill.description}</p><p className="note">Learning activity: <strong>{selectedActivity?selectedActivity.replaceAll("_"," "):"Not available"}</strong>{selectedActivity==="project_submitted"?" (learner-reported project, not verified)":""}. This does not change the trusted quiz score.</p><div className="skill-score-line"><div><span>Latest trusted score</span><strong>{selectedScore === null ? "Not Assessed" : `${selectedScore} / 100`}</strong></div><small className="score-performance">{selectedScore === null ? "Not Assessed" : performanceLabel(selectedScore)}</small><div className="progress-track"><div className="progress-fill" style={{ width: `${selectedScore ?? 0}%` }}/></div></div><div className="detail-section"><h3>Why this matters</h3><p className="note">{selectedRecommendation?.explanation ?? (selectedWeight !== undefined && selectedCareer ? `${selectedSkill.label} contributes ${selectedWeight}% of your selected ${selectedCareer.title} pathway.` : "This skill is part of your selected learning focus.")}</p></div><div className="detail-section"><h3>Prerequisites</h3>{selectedSkill.prerequisites.length ? <ul className="prerequisite-list">{selectedSkill.prerequisites.map(id => { const score = Object.hasOwn(scores, id) ? clamp(scores[id]) : null; const state = getPrerequisiteEvidence(selectedSkill.id, scores).find(item => item.skillId === id)?.state; const met = state === "met"; return <li key={id}>{met ? <CheckCircle2 aria-hidden="true"/> : <LockKeyhole aria-hidden="true"/>}<span><strong>{skillById[id].label}</strong><small>{met ? `${score}/100 · prerequisite evidence met` : state === "not-assessed" ? "Assessment unavailable or not taken · learning remains open" : `${score}/100 · strengthen this prerequisite`}</small></span></li>; })}</ul> : <p className="note">No prerequisites. You can start here.</p>}</div>{relatedMissions.length ? <div className="detail-section"><h3>Relevant missions</h3>{relatedMissions.map(mission => <Link key={mission.id} href="/missions" className="related-mission"><Target aria-hidden="true"/><span><strong>{mission.title}</strong><small><Clock3 aria-hidden="true"/>{mission.estimatedHours} estimated hours</small></span><ArrowRight aria-hidden="true"/></Link>)}</div> : null}<div className="sx-roadmap-actions" aria-label="Learn this skill">
          <Link href={"/resources?skill=" + encodeURIComponent(selectedSkill.id)} className="btn btn-outline">Find learning resources <ArrowRight size={16} aria-hidden="true"/></Link>
          <Link href="/lab" className="btn btn-quiet">Explore guided practice <ArrowRight size={16} aria-hidden="true"/></Link><Link href={"/tutor?skill="+encodeURIComponent(selectedSkill.id)} className="btn btn-quiet">Explain this skill <ArrowRight size={16} aria-hidden="true"/></Link>
        </div>{selectedAssessment ? <Link className="btn btn-primary detail-cta" href={assessmentHref(selectedAssessment.id)}>{selectedScore === null ? "Take assessment" : "Retake assessment"}<ArrowRight aria-hidden="true"/></Link> : <p className="detail-unavailable">Assessment coming soon. Skillmetry will not manufacture a score.</p>}</section> : selectedTool ? <section className="skill-detail-panel tool-detail-panel" aria-live="polite"><div className="skill-detail-top"><span className="skill-group">Tool focus</span><StatusPill tone="neutral">No score</StatusPill></div><h2>{selectedTool.label}</h2><p>{selectedTool.description}</p><div className="detail-section"><h3>Assessment status</h3><p className="note">Tools do not produce a standalone Skillmetry score.</p></div>{selectedTool.canonicalSkillId ? <div className="detail-section"><h3>Canonical mapping</h3><p className="note">Docker is represented by the canonical Docker skill in the graph. It is not duplicated as a separate record.</p><button type="button" className="btn btn-outline" onClick={() => setSelected({ kind: "skill", id: selectedTool.canonicalSkillId! })}>View Docker skill <ArrowRight aria-hidden="true"/></button></div> : <div className="detail-section"><h3>Roadmap relationship</h3><p className="note">No prerequisite edges are shown because this tool has no canonical skill mapping.</p></div>}<p className="detail-unavailable">Assessment coming soon. There is no assessment action for this tool.</p></section> : <section className="skill-detail-panel empty-detail"><p>Select a roadmap node or a recommendation to view its context.</p></section>}
        {selected ? <Link className="btn btn-outline roadmap-resource-link" href={selected.kind === "skill" ? getResourceBrowseHref({ kind: "skill", skillId: selected.id }) : getResourceBrowseHref({ kind: "tool", toolId: selected.id })}>Learn resources <ArrowRight aria-hidden="true"/></Link> : null}
      </aside>
    </div>
    {hasLearningGoals ? <p className="note">Learning activity and checklist completion appear separately from assessed results. <Link href="/planner">Open weekly plan</Link> · <Link href="/lab">Practice lab</Link> · <Link href="/missions">Mission evidence</Link>.</p>:null}
    {hasLearningGoals ? <p className="method-note"><GitBranch aria-hidden="true"/>Roadmap states use the latest completed server-graded quiz for each skill. Strong Quiz Performance begins at 75%. Unassessed skills remain unknown, not 0%.</p> : null}
  </>;
}
