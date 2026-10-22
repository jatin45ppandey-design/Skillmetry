"use client";
import Link from "next/link";
import {useLearningActivity} from "@/hooks/use-learning-activity";
import {skillById} from "@skillmetry/shared/data/catalog";
export function LearningActivitySummary(){
  const activity=useLearningActivity();
  return <section className="panel workflow-panel" aria-label="Separate learning activity">
    <span className="eyebrow">Learning activity / not a quiz score</span>
    <h2>Your work beyond assessments</h2>
    <p className="note">Saved tasks, practice and learner-reported projects have their own history. They never update trusted assessment percentages.</p>
    {activity.status==="loading"?<p role="status">Loading private learning activity…</p>:null}
    {activity.status==="error"?<p role="alert">Learning activity could not be loaded. Quiz evidence is unchanged.</p>:null}
    {activity.status==="unavailable"?<p className="note">Private activity history is available after the approved workflow rollout.</p>:null}
    {Object.entries(activity.bySkill).map(([skillId,state])=><div className="studio-evidence-row" key={skillId}>
      <span>{skillById[skillId]?.label??skillId}</span><strong>{state.replaceAll("_"," ")}{state==="project_submitted"?" (self-reported)":""}</strong></div>)}
    {activity.status==="ready"&&!Object.keys(activity.bySkill).length?<p>No private learning activity recorded yet.</p>:null}
    <div className="workflow-inline-actions"><Link className="btn btn-outline" href="/planner">Study plan</Link>
      <Link className="btn btn-outline" href="/lab">Code practice</Link>
      <Link className="btn btn-outline" href="/missions">Projects</Link></div>
  </section>;
}
