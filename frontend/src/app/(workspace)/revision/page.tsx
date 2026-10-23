"use client";

import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {Suspense,useCallback,useEffect,useMemo,useState} from "react";
import {ArrowRight,CalendarClock,CheckCircle2,RefreshCcw} from "lucide-react";
import {SectionTitle} from "@/components/section-title";
import {ActionSpinner,ContentSkeleton} from "@/components/motion-ui";
import {learningResources} from "@skillmetry/shared/data/learning-resources";
import {buildSpacedRevisionDates,dateKeyInTimeZone,revisionTopicContext,type RevisionEvidence} from "@skillmetry/shared/lib/revision";

type SavedTask={taskKey:string;skillId:string;title:string;kind:string;status:string;estimatedMinutes:number;plannedDate:string;position:number};
type Recommendation={topicId:string;skillId:string;title:string;difficulty:string;lessonHref:string|null;practiceHref:string;
  assessmentId:string;diagnosticTopicId:string;evidence:RevisionEvidence;reason:string;
  prerequisites:{topicId:string;title:string;lessonHref:string|null}[];resources:{id:string;title:string;url:string;provider:string}[]};
type QueueResponse={diagnosticsActive:boolean;persistenceActive:boolean;recommendations:Recommendation[];saved:SavedTask[];reason:string|null;error?:string};

function RevisionContent(){
  const params=useSearchParams();
  const requestedTopic=params.get("topic")??"";
  const requestedAssessment=params.get("assessment")??undefined;
  const selectedContext=useMemo(()=>revisionTopicContext(requestedTopic),[requestedTopic]);
  const selectedResources=selectedContext?.resourceIds.flatMap(id=>learningResources.find(resource=>resource.id===id)??[])??[];
  const [data,setData]=useState<QueueResponse|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [notice,setNotice]=useState<string|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const response=await fetch("/api/learning/revision",{cache:"no-store"});
      const body=await response.json() as QueueResponse;
      if(!response.ok)throw new Error(body.error??"Revision queue is unavailable.");
      setData(body);
    }catch(caught){setError(caught instanceof Error?caught.message:"Revision queue is unavailable.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);

  async function save(topicId:string,evidence:RevisionEvidence,assessmentId?:string){
    setSaving(topicId);setError(null);setNotice(null);
    try{
      const response=await fetch("/api/learning/revision",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({topicId,evidence,...(assessmentId?{assessmentId}:{})})});
      const body=await response.json() as {saved?:SavedTask[];error?:string};
      if(!response.ok||!body.saved)throw new Error(body.error??"Revision tasks could not be saved.");
      setNotice("Three private revision tasks were added to your queue. No proficiency score changed.");
      await load();
    }catch(caught){setError(caught instanceof Error?caught.message:"Revision tasks could not be saved.");}
    finally{setSaving(null);}
  }

  const today=dateKeyInTimeZone(new Date());
  const selectedDates=selectedContext?buildSpacedRevisionDates(today,"practice-selected"):[];
  return <>
    <SectionTitle eyebrow="Targeted revision" title="Return to the right concept at the right time"
      description="Use lesson context, practice feedback and—when enabled—private diagnostic evidence to plan recall, application and reassessment."
      action={<Link className="btn btn-quiet" href="/practice">Topic practice</Link>}/>
    {loading?<ContentSkeleton kind="cards" label="Preparing your revision queue…"/>:null}
    {error?<div className="auth-error" role="alert"><p>{error}</p><button type="button" className="btn btn-outline" onClick={()=>void load()}>Try again</button></div>:null}
    {notice?<p className="p2-save-success" role="status"><CheckCircle2 aria-hidden="true"/>{notice}</p>:null}
    {selectedContext?<section className="p3-revision-focus">
      <div><span className="eyebrow">From your practice session</span><h2>{selectedContext.title}</h2><p>This topic was selected for revision; that is not a claim that you have or have not mastered it.</p></div>
      <ol className="p3-revision-timeline">{selectedDates.map((date,index)=><li key={date}><CalendarClock aria-hidden="true"/><div><strong>{index===0?"Recall":index===1?"Apply again":"Check retention"}</strong><span>{new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${date}T00:00:00Z`))}</span></div></li>)}</ol>
      {selectedContext.prerequisites.length?<div className="p3-prerequisite-recovery"><h3>Prerequisite recovery</h3><p>If this topic feels blocked, revisit the nearest prerequisite first.</p>{selectedContext.prerequisites.map(item=>item.lessonHref?<Link key={item.topicId} className="text-link" href={item.lessonHref}>{item.title}<ArrowRight aria-hidden="true"/></Link>:null)}</div>:null}
      <div className="p3-result-actions"><Link className="btn btn-primary" href={selectedContext.practiceHref}>Practice again</Link>{selectedContext.lessonHref?<Link className="btn btn-outline" href={selectedContext.lessonHref}>Review lesson</Link>:null}
        {data?.persistenceActive?<button type="button" className="btn btn-outline" disabled={Boolean(saving)} onClick={()=>void save(selectedContext.topicId,"practice-selected",requestedAssessment)}>{saving===selectedContext.topicId?<ActionSpinner label="Saving revision plan…"/>:"Save 3-step revision plan"}</button>:null}</div>
      {selectedResources.length?<div className="p3-revision-resources"><h3>Related reviewed resources</h3>{selectedResources.map(resource=><a className="text-link" key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title} · {resource.provider} ↗</a>)}</div>:null}
    </section>:null}

    {!loading&&data?<>
      {!data.persistenceActive?<p className="workflow-notice" role="status">{data.reason??"Private revision saving remains staged until the approved learning-workflow rollout."} You can still use the lesson and practice links without saved progress.</p>:null}
      <section className="p3-revision-section"><div className="resource-section-head"><div><span className="eyebrow">DIAGNOSTIC FOLLOW-UP</span><h2>Evidence-based recommendations</h2></div></div>
        {!data.diagnosticsActive?<p className="workflow-notice">2026.3 topic diagnostics remain disabled on this deployment. Skillmetry will not invent weak topics from a total score.</p>:
          !data.recommendations.length?<p className="note">No current diagnostic topic needs a revision recommendation. Missing evidence remains unknown.</p>:
          <div className="p3-revision-grid">{data.recommendations.map(item=><article key={`${item.assessmentId}:${item.diagnosticTopicId}`}>
            <span className="eyebrow">{item.difficulty} · {item.evidence.replace("-"," ")}</span><h3>{item.title}</h3><p>{item.reason}</p>
            {item.prerequisites.length?<small>Recovery first: {item.prerequisites.map(entry=>entry.title).join(", ")}</small>:null}
            <div className="p3-result-actions"><Link className="btn btn-primary" href={item.practiceHref}>Practice topic</Link>{item.lessonHref?<Link className="btn btn-outline" href={item.lessonHref}>Review lesson</Link>:null}
              <Link className="btn btn-quiet" href={`/assessments?assessment=${encodeURIComponent(item.assessmentId)}`}>Reassess</Link>
              {data.persistenceActive?<button className="btn btn-quiet" type="button" disabled={Boolean(saving)} onClick={()=>void save(item.topicId,item.evidence,item.assessmentId)}>{saving===item.topicId?<ActionSpinner label="Saving…"/>:"Schedule 3 reviews"}</button>:null}</div>
          </article>)}</div>}
      </section>
      <section className="p3-revision-section"><div className="resource-section-head"><div><span className="eyebrow">PRIVATE QUEUE</span><h2>Upcoming saved revision</h2></div><RefreshCcw aria-hidden="true"/></div>
        {data.saved.length?<div className="p3-saved-revision">{data.saved.map(task=><article key={task.taskKey}><time dateTime={task.plannedDate}>{new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",timeZone:"UTC"}).format(new Date(`${task.plannedDate}T00:00:00Z`))}</time><div><strong>{task.title}</strong><small>{task.kind} · {task.estimatedMinutes} min · {task.status}</small></div></article>)}</div>:<p className="note">No upcoming revision tasks are saved. Scheduling is optional and never changes assessment evidence.</p>}
      </section>
    </>:null}
  </>;
}

export default function RevisionPage(){return <Suspense fallback={<ContentSkeleton kind="cards" label="Preparing targeted revision"/>}><RevisionContent/></Suspense>;}
