"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { useAuth } from "@/components/auth-provider";
import type { TopicDiagnosis } from "@skillmetry/shared/lib/diagnostic-intelligence";

type WeakTopic = TopicDiagnosis & {practiceHref:string;resources:{id:string;title:string;url:string}[]};
type Insight = {assessmentId:string;skillId:string;score:number;topics:TopicDiagnosis[];weakTopics:WeakTopic[]};
export function DiagnosticTwinInsights(){
  const {user}=useAuth();
  const [insights,setInsights]=useState<Insight[]>([]);
  const [error,setError]=useState(false);
  useEffect(()=>{
    if(!user||process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED!=="true")return;
    const controller=new AbortController();
    void fetch("/api/assessments/diagnostics",{cache:"no-store",signal:controller.signal})
      .then(async response=>{if(!response.ok)throw Error("Unavailable");return response.json() as Promise<{insights:Insight[]}>;})
      .then(data=>{setInsights(data.insights);setError(false);})
      .catch(()=>{if(!controller.signal.aborted)setError(true);});
    return ()=>controller.abort();
  },[user]);
  if(!user||process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED!=="true")return null;
  return <section className="diagnostic-twin-panel">
    <div className="resource-section-head"><div><span className="eyebrow">Diagnostic intelligence</span><h2>Learn from topic evidence</h2></div></div>
    {error?<p className="note">Topic evidence is temporarily unavailable; trusted overall scores remain unchanged.</p>:null}
    {!error&&!insights.length?<p className="note">Complete a 2026.3 assessment to unlock topic recommendations. Unassessed areas remain unknown.</p>:null}
    {insights.map(insight=><article key={insight.assessmentId} className="diagnostic-insight-card">
      <h3>{insight.skillId} · {insight.score}% trusted quiz score</h3>
      {insight.weakTopics.length?insight.weakTopics.map(topic=><div key={topic.id}>
        <strong>{topic.label}: {topic.correct}/{topic.questions} correct</strong>
        <p>Review this concept, practice, and reassess to create new measured evidence.</p>
        <Link className="btn btn-outline" href={topic.practiceHref}>Targeted practice</Link>
      </div>):<p className="note">No evidence-supported priority weak topic in the latest attempt.</p>}
      <Link className="text-link" href={`/assessments?assessment=${encodeURIComponent(insight.assessmentId)}`}>Review assessment history</Link>
    </article>)}
  </section>;
}
