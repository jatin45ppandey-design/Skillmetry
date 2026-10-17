"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {ActivityIndicator} from "@/components/motion-ui";
import type { TopicDiagnosis } from "@skillmetry/shared/lib/diagnostic-intelligence";

type WeakTopic = TopicDiagnosis & {practiceHref:string;resources:{id:string;title:string;url:string}[]};
type Insight = {assessmentId:string;skillId:string;score:number;topics:TopicDiagnosis[];weakTopics:WeakTopic[];
  topicChanges:{id:string;label:string;previousPercent:number|null;currentPercent:number|null;delta:number|null}[]};
export function DiagnosticTwinInsights(){
  const {user}=useAuth();
  const [insights,setInsights]=useState<Insight[]>([]);
  const [insightOwner,setInsightOwner]=useState<string|null>(null);
  const [error,setError]=useState(false);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!user||process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED!=="true")return;
    const controller=new AbortController();
    setLoading(true);setError(false);
    void fetch("/api/assessments/diagnostics",{cache:"no-store",signal:controller.signal})
      .then(async response=>{if(!response.ok)throw Error("Unavailable");return response.json() as Promise<{insights:Insight[]}>;})
      .then(data=>{if(!controller.signal.aborted){setInsights(data.insights);setInsightOwner(user.id);setError(false);setLoading(false);}})
      .catch(()=>{if(!controller.signal.aborted){setError(true);setLoading(false);}});
    return ()=>controller.abort();
  },[user]);
  if(!user||process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED!=="true")return null;
  const visibleInsights=insightOwner===user.id?insights:[];
  return <section className="diagnostic-twin-panel">
    <div className="resource-section-head"><div><span className="eyebrow">Diagnostic intelligence</span><h2>Learn from topic evidence</h2></div></div>
    {loading && insightOwner!==user.id ? <ActivityIndicator compact label="Loading your private topic diagnosis…"/>:null}
    {error?<p className="note">Topic evidence is temporarily unavailable; trusted overall scores remain unchanged.</p>:null}
    {!loading&&!error&&!visibleInsights.length?<p className="note">Complete a 2026.3 assessment to unlock topic recommendations. Unassessed areas remain unknown.</p>:null}
    {visibleInsights.map(insight=><article key={insight.assessmentId} className="diagnostic-insight-card">
      <h3>{insight.skillId} · {insight.score}% trusted quiz score</h3>
      {insight.topicChanges.some(topic=>topic.delta!==null)?<div className="diagnostic-topic-changes">
        <strong>Change since previous 2026.3 assessment</strong>
        {insight.topicChanges.filter(topic=>topic.delta!==null).map(topic=><p key={topic.id}>
          {topic.label}: {topic.previousPercent}% → {topic.currentPercent}% ({topic.delta!>=0?"+":""}{topic.delta} points)
        </p>)}
        <small>Directional evidence from a small topic sample, not a certification or verified mastery change.</small>
      </div>:null}
      {insight.weakTopics.length?insight.weakTopics.map(topic=><div key={topic.id}>
        <strong>{topic.label}: {topic.correct}/{topic.questions} correct</strong>
        <p>Review this concept, practice, and reassess to create new measured evidence.</p>
        <Link className="btn btn-outline" href={topic.practiceHref}>Targeted practice</Link>
      </div>):<p className="note">No evidence-supported priority weak topic in the latest attempt.</p>}
      <Link className="text-link" href={`/assessments?assessment=${encodeURIComponent(insight.assessmentId)}`}>Review assessment history</Link>
    </article>)}
  </section>;
}
