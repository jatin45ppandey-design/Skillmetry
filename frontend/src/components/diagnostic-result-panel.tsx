"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { TopicDiagnosis } from "@skillmetry/shared/lib/diagnostic-intelligence";

type ReviewItem = {
  questionId:string;topicId:string;ordinal:number;prompt:string;choices:readonly string[];
  selectedIndex:number;correctIndex:number;difficulty:string;explanation:string;
};
type ResourceItem = {id:string;title:string;provider:string;url:string;relevance:"topic-match"|"skill-fallback"};
type PriorityTopic = TopicDiagnosis & {practiceHref:string;resources:ResourceItem[]};
type ReviewData = {available:true;topics:TopicDiagnosis[];priorityTopics:PriorityTopic[];review:ReviewItem[]} |
  {available:false;reason:string};

export function DiagnosticResultPanel({attemptId}:{attemptId:string}){
  const [data,setData]=useState<ReviewData|null>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [showAnswers,setShowAnswers]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    setStatus("loading");setData(null);setShowAnswers(false);
    void fetch("/api/assessments/review?attemptId="+encodeURIComponent(attemptId),{
      signal:controller.signal,cache:"no-store"
    }).then(async response=>{
      if(!response.ok)throw new Error("Review is unavailable");
      return await response.json() as ReviewData;
    }).then(body=>{setData(body);setStatus("ready");})
      .catch(()=>{if(!controller.signal.aborted)setStatus("error");});
    return ()=>controller.abort();
  },[attemptId]);
  return <section className="diagnostic-result" aria-live="polite">
    <div className="resource-section-head"><div><span className="eyebrow">Your diagnostic evidence</span><h2>Topic-level breakdown</h2></div></div>
    {status==="loading"?<p className="note" role="status">Loading private topic results…</p>:null}
    {status==="error"?<p className="note" role="alert">Review could not be loaded. Your trusted score is saved. You can retry from assessment history.</p>:null}
    {data && !data.available?<p className="note">{data.reason}</p>:null}
    {data?.available?<><div className="diagnostic-topic-grid">
      {data.topics.map(topic=><article className="diagnostic-topic" key={topic.id}>
        <strong>{topic.label}</strong><span>{topic.correct}/{topic.questions} correct</span>
        <div className="progress-track"><div className="progress-fill" style={{width:`${topic.percent??0}%`}}/></div>
        <small>{topic.status==="insufficient-evidence"?"Insufficient evidence":topic.status==="needs-practice"?"Practice recommended":topic.status==="developing"?"Developing evidence":"Strong quiz evidence"}{topic.percent===null?"":` · ${topic.percent}%`}</small>
      </article>)}
    </div>
    {data.priorityTopics.length?<section className="diagnostic-next">
      <h3>Focus next</h3>
      {data.priorityTopics.map(topic=><article key={topic.id}>
        <div><strong>{topic.label}</strong><p>Only {topic.correct} of {topic.questions} diagnostic questions were correct. Practice this concept, then reassess.</p></div>
        <div className="diagnostic-links"><Link className="btn btn-primary" href={topic.practiceHref}>Practice this topic</Link>
          {topic.resources.slice(0,2).map(resource=><a key={resource.id} className="text-link" href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title} ↗</a>)}
        </div>
      </article>)}
    </section>:<p className="note">No priority weak topic has sufficient evidence. Continue learning or reassess later.</p>}
    <button type="button" className="btn btn-outline" onClick={()=>setShowAnswers(current=>!current)} aria-expanded={showAnswers}>
      {showAnswers?"Hide answer review":"Review submitted answers and explanations"}
    </button>
    {showAnswers?<div className="diagnostic-answer-review">{data.review.map((item,index)=><article key={item.questionId}>
      <span className="eyebrow">Question {index+1} · {item.difficulty}</span>
      <strong>{item.prompt}</strong>
      <p>Your answer: {item.choices[item.selectedIndex]??"Unavailable"}</p>
      <p>Correct answer: {item.choices[item.correctIndex]??"Unavailable"}</p>
      <small>{item.explanation}</small>
    </article>)}</div>:null}
    </>:null}
  </section>;
}
