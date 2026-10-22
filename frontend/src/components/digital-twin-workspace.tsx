"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  GitBranch,
  Info,
  LineChart,
  ListChecks,
  Target,
  TrendingDown,
  TrendingUp,
  Wrench
} from "lucide-react";
import { StatusPill } from "@/components/workspace-ui";
import {ActivityIndicator} from "@/components/motion-ui";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { toolById } from "@skillmetry/shared/data/learning-catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import {
  buildDigitalTwinSnapshot,
  type CareerAlignmentSnapshot,
  type DigitalTwinInsight,
  type SkillTwinSnapshot,
  type TwinEvidenceState
} from "@skillmetry/shared/lib/digital-twin-intelligence";
import { getResourceBrowseHref, getResourcesForSkill, getResourcesForTool } from "@skillmetry/shared/lib/resource-intelligence";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { CareerId, SkillId, ToolId } from "@skillmetry/shared/types/domain";

type SelectedTarget = { kind: "skill"; id: SkillId } | { kind: "tool"; id: ToolId };

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const stateLabels: Record<TwinEvidenceState, string> = {
  measured: "Measured",
  "assessment-available-not-taken": "Assessment available",
  "assessment-unavailable": "Assessment unavailable"
};
const insightLabels: Record<DigitalTwinInsight["type"], string> = {
  "strong-performance": "Strong quiz result",
  "improvement-opportunity": "Practice opportunity",
  "reassessment-opportunity": "Reassessment available",
  "assessment-recommended": "Baseline assessment",
  "prerequisite-priority": "Prerequisite focus",
  "resource-suggestion": "Learning resource",
  "insufficient-evidence": "More evidence needed"
};

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not available";
}

function stateTone(state: TwinEvidenceState): "neutral" | "accent" | "success" | "warning" {
  if (state === "measured") return "success";
  if (state === "assessment-available-not-taken") return "accent";
  return "neutral";
}

function scoreTone(score: number | null): "neutral" | "success" | "warning" {
  if (score === null) return "neutral";
  return score >= 75 ? "success" : "warning";
}

function actionLabel(insight: DigitalTwinInsight) {
  if (insight.action.kind === "assessment") return insight.type === "reassessment-opportunity" ? "Retake assessment" : "Take assessment";
  if (insight.action.kind === "resources") return "Learn resources";
  return null;
}

function EvidenceMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="twin-evidence-metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function CoverageSegments({ alignment }: { alignment: CareerAlignmentSnapshot }) {
  const segments = [
    { key: "measured", label: "Measured", value: alignment.measuredWeight },
    { key: "available", label: "Available, not taken", value: alignment.availableUnmeasuredWeight },
    { key: "unavailable", label: "Unavailable", value: alignment.unavailableWeight }
  ];

  return <div className="twin-coverage" aria-label={`${alignment.careerTitle} assessment coverage`}>
    <div className="twin-coverage-bar" aria-hidden="true">
      {segments.map(segment => segment.value ? <span className={`twin-coverage-segment ${segment.key}`} key={segment.key} style={{ flexGrow: segment.value }} /> : null)}
    </div>
    <div className="twin-coverage-legend">
      {segments.map(segment => <span key={segment.key}><i className={segment.key} />{segment.label}<strong>{segment.value}%</strong></span>)}
    </div>
  </div>;
}

function ScoreHistoryChart({ skill }: { skill: SkillTwinSnapshot }) {
  const points = skill.history.attempts;
  if (!points.length) return <div className="twin-history-empty"><LineChart aria-hidden="true"/><p>No trusted assessment history is available for this skill.</p></div>;
  if (points.length === 1) return <div className="twin-history-empty"><LineChart aria-hidden="true"/><p>One trusted result is available. Complete another assessment to compare attempts without claiming a growth trend.</p></div>;

  const chartWidth = 420;
  const chartHeight = 172;
  const padding = 25;
  const plotWidth = chartWidth - padding * 2;
  const plotHeight = chartHeight - padding * 2;
  const coordinates = points.map((attempt, index) => ({
    ...attempt,
    x: padding + (index * plotWidth) / Math.max(1, points.length - 1),
    y: padding + ((100 - attempt.score) * plotHeight) / 100
  }));
  const path = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const description = points.map(point => `${formatDate(point.completedAt)}: ${point.score}% (${point.assessmentVersion})`).join("; ");

  return <div className="twin-history-chart" role="img" aria-label={`Trusted quiz score history for ${skill.label}. ${description}`}>
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" aria-hidden="true">
      <line x1={padding} x2={chartWidth - padding} y1={padding} y2={padding} />
      <line x1={padding} x2={chartWidth - padding} y1={chartHeight / 2} y2={chartHeight / 2} />
      <line x1={padding} x2={chartWidth - padding} y1={chartHeight - padding} y2={chartHeight - padding} />
      <path d={path} />
      {coordinates.map(point => <circle key={point.id} cx={point.x} cy={point.y} r="4.5" />)}
    </svg>
    <div className="twin-history-axis"><span>100</span><span>50</span><span>0</span></div>
    <div className="twin-history-points">
      {points.map((attempt, index) => <span key={attempt.id}><strong>{attempt.score}%</strong><small>{index + 1} · v{attempt.assessmentVersion}</small></span>)}
    </div>
  </div>;
}

function SkillDetail({ skill, onSelectSkill }: { skill: SkillTwinSnapshot; onSelectSkill: (skillId: SkillId) => void }) {
  const resources = getResourcesForSkill(skill.skillId).slice(0, 3);
  const relatedCareers = careers.filter(career => career.skills.some(item => item.skillId === skill.skillId));
  const history = skill.history;
  const assessmentHref = skill.assessment.available ? `/assessments?assessment=${encodeURIComponent(skill.assessment.assessmentId)}` : null;

  return <section className="twin-detail-panel" id="twin-history" aria-live="polite">
    <div className="twin-detail-top"><span className="eyebrow">Skill evidence</span><StatusPill tone={stateTone(skill.evidenceState)}>{stateLabels[skill.evidenceState]}</StatusPill></div>
    <h2>{skill.label}</h2>
    <p className="twin-detail-description">{skillById[skill.skillId]?.description}</p>
    <div className="twin-detail-score"><div><span>Latest trusted quiz</span><strong>{skill.score === null ? "Not Assessed" : `${skill.score}%`}</strong></div><StatusPill tone={scoreTone(skill.score)}>{skill.band}</StatusPill></div>
    {skill.score !== null ? <div className="twin-score-track" aria-label={`${skill.score}% latest trusted quiz score`}><span style={{ width: `${skill.score}%` }} /></div> : null}

    <dl className="twin-detail-facts">
      <div><dt>Latest activity</dt><dd>{formatDate(skill.latestCompletedAt)}</dd></div>
      <div><dt>Trusted attempts</dt><dd>{skill.attemptCount}</dd></div>
      <div><dt>Question bank</dt><dd>{skill.assessmentVersion ? `v${skill.assessmentVersion}` : "Not available"}</dd></div>
    </dl>

    <div className="twin-detail-section">
      <h3>Prerequisites</h3>
      {skill.prerequisites.length ? <div className="twin-prerequisite-list">{skill.prerequisites.map(prerequisite => <button type="button" key={prerequisite} onClick={() => onSelectSkill(prerequisite)}><GitBranch aria-hidden="true"/>{skillById[prerequisite]?.label ?? prerequisite}<ArrowRight aria-hidden="true"/></button>)}</div> : <p>No prerequisite skills are defined for this canonical skill.</p>}
    </div>

    <div className="twin-detail-section">
      <h3>Career context</h3>
      <p>{relatedCareers.length ? `${skill.label} is part of ${relatedCareers.map(career => career.title).join(", ")}. Career weights describe curriculum coverage, not employability.` : "This skill is not currently weighted in a career comparison."}</p>
    </div>

    {skill.evidenceState === "measured" ? <div className="twin-detail-section">
      <h3>Observed history</h3>
      <ScoreHistoryChart skill={skill}/>
      <div className="twin-history-summary">
        <span>First <strong>{history.first?.score}%</strong></span>
        <span>Latest <strong>{history.latest?.score}%</strong></span>
        <span>Best <strong>{history.best?.score}%</strong></span>
        {history.latestDelta !== null ? <span className={history.latestDelta > 0 ? "positive" : history.latestDelta < 0 ? "negative" : ""}>{history.latestDelta > 0 ? <TrendingUp aria-hidden="true"/> : history.latestDelta < 0 ? <TrendingDown aria-hidden="true"/> : null}Latest change <strong>{history.latestDelta > 0 ? "+" : ""}{history.latestDelta}</strong></span> : null}
      </div>
      {history.crossVersionComparison ? <p className="twin-caveat"><Info aria-hidden="true"/>The latest comparison spans question-bank versions. Treat the difference as context, not a precise measure of underlying competence.</p> : <p className="twin-caveat"><Info aria-hidden="true"/>Quiz changes show observed results only; they do not prove a change in professional capability.</p>}
    </div> : null}

    <div className="twin-detail-section">
      <h3>Learning resources</h3>
      {resources.length ? <ul className="twin-resource-list">{resources.map(resource => <li key={resource.id}><span><strong>{resource.title}</strong><small>{resource.provider} · {resource.difficulty}</small></span></li>)}</ul> : <p>Curated resources are not available for this skill yet.</p>}
      <Link className="text-link" href={getResourceBrowseHref({ kind: "skill", skillId: skill.skillId })}><Compass aria-hidden="true"/>Learn resources</Link>
    </div>

    <div className="twin-detail-actions">
      {assessmentHref ? <Link className="btn btn-primary" href={assessmentHref}><BookOpenCheck aria-hidden="true"/>{skill.score === null ? "Take assessment" : "Retake assessment"}</Link> : <p className="twin-unavailable"><Info aria-hidden="true"/>Assessment coverage is not currently offered for this skill. Skillmetry does not infer a score.</p>}
      <Link className="btn btn-outline" href="/roadmap"><Target aria-hidden="true"/>Open roadmap</Link>
    </div>
  </section>;
}

function ToolDetail({ toolId }: { toolId: ToolId }) {
  const tool = toolById[toolId];
  const resources = getResourcesForTool(toolId).slice(0, 3);
  return <section className="twin-detail-panel" aria-live="polite">
    <div className="twin-detail-top"><span className="eyebrow">Tool learning focus</span><StatusPill tone="neutral">No score</StatusPill></div>
    <h2>{tool.label}</h2>
    <p className="twin-detail-description">{tool.description}</p>
    <div className="twin-tool-evidence"><Wrench aria-hidden="true"/><div><strong>No canonical quiz score</strong><p>{tool.canonicalSkillId ? `${tool.label} maps to the canonical ${skillById[tool.canonicalSkillId]?.label ?? tool.canonicalSkillId} skill. It is not duplicated as a separate score.` : `${tool.label} is a learning-tool focus. Skillmetry does not invent a quiz score or evidence state for it.`}</p></div></div>
    <div className="twin-detail-section"><h3>Learning resources</h3>{resources.length ? <ul className="twin-resource-list">{resources.map(resource => <li key={resource.id}><span><strong>{resource.title}</strong><small>{resource.provider} · {resource.difficulty}</small></span></li>)}</ul> : <p>Curated resources are not available for this tool yet.</p>}<Link className="text-link" href={getResourceBrowseHref({ kind: "tool", toolId })}><Compass aria-hidden="true"/>Learn resources</Link></div>
  </section>;
}

function InsightList({ insights, onSelect }: { insights: readonly DigitalTwinInsight[]; onSelect: (insight: DigitalTwinInsight) => void }) {
  return <section className="twin-insights panel" aria-labelledby="twin-insights-title">
    <div className="panel-header"><div><span className="eyebrow">Explainable guidance</span><h2 id="twin-insights-title">Evidence-based next moves</h2></div><ListChecks aria-hidden="true"/></div>
    {insights.length ? <div className="twin-insight-list">{insights.map(insight => <article key={insight.id} className="twin-insight"><div><span>{insight.priority.toUpperCase()}</span><h3>{insightLabels[insight.type]}</h3></div><p>{insight.explanation}</p>{insight.action.href ? <Link href={insight.action.href} className="text-link">{actionLabel(insight)} <ArrowRight aria-hidden="true"/></Link> : insight.skillId || insight.toolId ? <button type="button" className="text-link button-link" onClick={() => onSelect(insight)}>View evidence <ArrowRight aria-hidden="true"/></button> : null}</article>)}</div> : <div className="twin-insights-empty"><ListChecks aria-hidden="true"/><strong>No learning focus selected</strong><p>Choose a career, skills, or tools to receive grounded next steps. Existing quiz evidence remains available above.</p><Link className="text-link" href="/settings">Update learning goals <ArrowRight aria-hidden="true"/></Link></div>}
  </section>;
}

export function DigitalTwinWorkspace() {
  const { preferences } = useSkillmetry();
  const { attempts, illustrative, status, message } = useAssessmentProfile();
  const learning = preferences.learning;
  const context = illustrative ? "demo" : "authenticated";
  const twin = useMemo(() => buildDigitalTwinSnapshot({ attempts, learning, context }), [attempts, context, learning]);
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null);
  const [skillQuery, setSkillQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState<"all"|"measured"|"available"|"unavailable">("all");
  const [selectedCareerId, setSelectedCareerId] = useState<CareerId>(learning.primaryCareerId ?? careers[0].id);
  const defaultSkill = twin.skills.find(skill => skill.evidenceState === "measured") ?? twin.skills[0];
  const selectedSkill = selectedTarget?.kind === "skill" ? twin.skills.find(skill => skill.skillId === selectedTarget.id) ?? defaultSkill : selectedTarget ? null : defaultSkill;
  const selectedCareer = twin.careers.find(career => career.careerId === selectedCareerId) ?? twin.careers[0];
  const latestActivity = twin.skills.filter(skill => skill.latestCompletedAt).toSorted((a, b) => (b.latestCompletedAt ?? "").localeCompare(a.latestCompletedAt ?? ""))[0] ?? null;
  const hasGoals = Boolean(learning.primaryCareerId || learning.selectedSkillIds.length || learning.selectedToolIds.length);
  const visibleSkills=twin.skills.filter(skill=>{
    if(!skill.label.toLocaleLowerCase().includes(skillQuery.trim().toLocaleLowerCase()))return false;
    if(skillFilter==="measured")return skill.evidenceState==="measured";
    if(skillFilter==="available")return skill.evidenceState==="assessment-available-not-taken";
    if(skillFilter==="unavailable")return skill.evidenceState==="assessment-unavailable";
    return true;
  });

  function selectSkill(skillId: SkillId) {
    setSelectedTarget({ kind: "skill", id: skillId });
  }

  function selectInsight(insight: DigitalTwinInsight) {
    if (insight.toolId && insight.toolId in toolById) setSelectedTarget({ kind: "tool", id: insight.toolId as ToolId });
    else if (insight.skillId) selectSkill(insight.skillId);
  }

  return <>
    {status==="loading" && !illustrative ? <ActivityIndicator compact label="Loading trustworthy quiz history…" detail="Missing data is not treated as a zero score."/> : null}
    <section className="twin-context-strip" role={status === "error" || status === "offline" ? "alert" : "status"}>
      <Info aria-hidden="true"/>
      <p>{illustrative ? "Illustrative demo results are kept separate from signed-in student records." : status === "loading" ? "Loading server-graded assessment history. Unknown skills are not estimated while it loads." : status === "error" || status === "offline" ? message ?? "Assessment history is currently unavailable. No score is estimated." : "Scores reflect the latest completed server-graded quiz. They are not professional readiness or mastery claims."}</p>
    </section>

    <nav className="twin-view-nav" aria-label="Digital Twin sections">
      <a href="#twin-overview">Overview</a>
      <a href="#twin-skills-title">Skills</a>
      <a href="#twin-history">History</a>
    </nav>

    <section className="twin-overview" id="twin-overview" aria-label="Digital Twin overview">
      <div className="twin-overview-copy"><span className="eyebrow">Evidence-based Digital Twin</span><h2>See what your quizzes actually measure.</h2><p>Coverage, scores, and next actions are kept separate so missing evidence never becomes a false weakness.</p></div>
      <div className="twin-evidence-metrics">
        <EvidenceMetric label="Trusted skill evidence" value={`${twin.catalogCoverage.measuredSkillCount} / ${twin.catalogCoverage.catalogSkillCount}`} detail="canonical skills measured" />
        <EvidenceMetric label="Catalog coverage" value={`${twin.catalogCoverage.catalogCoveragePercent}%`} detail="skills with quiz evidence" />
        <EvidenceMetric label="Latest activity" value={latestActivity ? `${latestActivity.score}%` : "None yet"} detail={latestActivity ? `${latestActivity.label} · ${formatDate(latestActivity.latestCompletedAt)}` : "complete a secure assessment"} />
        <EvidenceMetric label={`${selectedCareer.careerTitle} coverage`} value={`${selectedCareer.weightedEvidenceCoveragePercent}%`} detail={`up to ${selectedCareer.assessmentAvailabilityCeilingPercent}% can be measured today`} />
      </div>
    </section>

    <section className="twin-main-grid">
      <div className="twin-content-stack">
        <section className="panel twin-skill-matrix" aria-labelledby="twin-skills-title">
          <div className="panel-header"><div><span className="eyebrow">All canonical skills</span><h2 id="twin-skills-title">Skill evidence matrix</h2></div><StatusPill tone="accent">{twin.catalogCoverage.measuredSkillCount} measured</StatusPill></div>
          <div className="sx-twin-controls"><label htmlFor="sx-skill-search">Find a skill<input id="sx-skill-search" type="search" value={skillQuery} placeholder="Search skills…" onChange={event=>setSkillQuery(event.target.value)}/></label><div className="sx-twin-filters" role="group" aria-label="Filter by skill evidence">{([["all","All"],["measured","Measured"],["available","Quiz available"],["unavailable","Not yet available"]] as const).map(([value,label])=><button type="button" key={value} aria-pressed={skillFilter===value} onClick={()=>setSkillFilter(value)}>{label}</button>)}</div></div>
          <p className="twin-panel-intro">{visibleSkills.length} of {twin.skills.length} skills · Not assessed means no numerical score has been claimed.</p>
          <div className="twin-skill-groups">{visibleSkills.length===0?<div className="sx-twin-empty">No skills match these filters. <button type="button" onClick={()=>{setSkillQuery("");setSkillFilter("all");}}>Show all skills</button></div>:null}{(["Foundation", "Core", "Applied"] as const).map(group => visibleSkills.some(skill=>skillById[skill.skillId]?.group===group)?<section key={group}><h3>{group}</h3><div className="twin-skill-grid">{visibleSkills.filter(skill => skillById[skill.skillId]?.group === group).map(skill => <button type="button" className={`twin-skill-card ${selectedSkill?.skillId === skill.skillId && selectedTarget?.kind !== "tool" ? "selected" : ""}`} key={skill.skillId} onClick={() => selectSkill(skill.skillId)} aria-pressed={selectedSkill?.skillId === skill.skillId && selectedTarget?.kind !== "tool"}><span className="twin-skill-card-top"><strong>{skill.label}</strong><i className={skill.evidenceState} /></span><span className="twin-skill-score">{skill.score === null ? "Not Assessed" : `${skill.score}%`}</span><span className="twin-skill-card-bottom"><small>{skill.score === null ? stateLabels[skill.evidenceState] : skill.band}</small><ArrowRight aria-hidden="true"/></span></button>)}</div></section>:null)}</div>
        </section>

        {learning.selectedToolIds.length ? <section className="panel twin-tool-focus" aria-labelledby="twin-tool-focus-title"><div className="panel-header"><div><span className="eyebrow">Learning goals</span><h2 id="twin-tool-focus-title">Tool focus</h2></div><Wrench aria-hidden="true"/></div><p>Tools can guide resources but never create a standalone quiz score.</p><div>{learning.selectedToolIds.map(toolId => <button type="button" className={selectedTarget?.kind === "tool" && selectedTarget.id === toolId ? "selected" : ""} onClick={() => setSelectedTarget({ kind: "tool", id: toolId })} key={toolId}><Wrench aria-hidden="true"/><span><strong>{toolById[toolId].label}</strong><small>{toolById[toolId].canonicalSkillId ? "Maps to a canonical skill" : "Resource-only tool focus"}</small></span><ArrowRight aria-hidden="true"/></button>)}</div></section> : null}

        <section className="panel twin-career-panel" aria-labelledby="twin-career-title">
          <div className="panel-header"><div><span className="eyebrow">Career comparison</span><h2 id="twin-career-title">Assessment coverage by career</h2></div><StatusPill tone="neutral">Explore only</StatusPill></div>
          <p className="twin-panel-intro">Explore any canonical career without changing your saved learning direction. Coverage is not career readiness.</p>
          <div className="twin-career-tabs" role="tablist" aria-label="Explore career evidence">{twin.careers.map(career => <button type="button" role="tab" key={career.careerId} aria-selected={career.careerId === selectedCareer.careerId} className={career.careerId === selectedCareer.careerId ? "selected" : ""} onClick={() => setSelectedCareerId(career.careerId)}>{career.careerTitle}</button>)}</div>
          <div className="twin-career-evidence" role="tabpanel"><div className="twin-career-evidence-head"><div><h3>{selectedCareer.careerTitle}</h3><p>{selectedCareer.limitation}</p></div><div><span>Observed quiz performance</span><strong>{selectedCareer.observedWeightedPerformance === null ? "Not available" : `${selectedCareer.observedWeightedPerformance}%`}</strong><small>measured skills only</small></div></div><CoverageSegments alignment={selectedCareer}/><div className="twin-career-stat-grid"><div><span>Current evidence coverage</span><strong>{selectedCareer.weightedEvidenceCoveragePercent}%</strong></div><div><span>Maximum available coverage</span><strong>{selectedCareer.assessmentAvailabilityCeilingPercent}%</strong></div><div><span>Measured requirements</span><strong>{selectedCareer.measuredSkillIds.length}</strong></div></div><div className="twin-required-skills"><span>Required skill distribution</span>{careers.find(career => career.id === selectedCareer.careerId)?.skills.map(item => <button type="button" key={item.skillId} onClick={() => selectSkill(item.skillId)}>{skillById[item.skillId]?.label}<small>{item.weight}%</small></button>)}</div></div>
        </section>

        <InsightList insights={twin.insights} onSelect={selectInsight}/>
      </div>

      <aside className="twin-detail-column">{selectedTarget?.kind === "tool" ? <ToolDetail toolId={selectedTarget.id}/> : selectedSkill ? <SkillDetail skill={selectedSkill} onSelectSkill={selectSkill}/> : null}{!hasGoals ? <section className="twin-goals-prompt"><Info aria-hidden="true"/><div><strong>Add a learning focus when you are ready</strong><p>Your existing evidence remains visible. Goals only shape the grounded recommendations below.</p><Link className="text-link" href="/settings">Update learning goals <ArrowRight aria-hidden="true"/></Link></div></section> : null}</aside>
    </section>
  </>;
}
