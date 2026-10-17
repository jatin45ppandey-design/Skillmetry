"use client";
import {ActivityIndicator, ActionSpinner} from "@/components/motion-ui";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {SectionTitle} from "@/components/section-title";

type Exercise={id:string;skillId:string;title:string;kind:"choice"|"fill";prompt:string;snippet:string;
 difficulty:string;choices?:readonly string[]};
type History={exercise_id:string;is_correct:boolean;completed_at:string};
type Feedback={exerciseId:string;correct:boolean;answer:string;explanation:string;trust:string;persisted:boolean};

export default function Lab(){
  const [exercises,setExercises]=useState<Exercise[]>([]);
  const [history,setHistory]=useState<History[]>([]);
  const [active,setActive]=useState<string|null>(null);
  const [choice,setChoice]=useState<number|null>(null);
  const [text,setText]=useState("");
  const [feedback,setFeedback]=useState<Feedback|null>(null);
  const [loading,setLoading]=useState(true);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [saved,setSaved]=useState(false);
  const [filter,setFilter]=useState("all");
  const [query,setQuery]=useState("");
  const load=useCallback(async()=>{
    try{
      const response=await fetch("/api/learning/lab",{cache:"no-store"});
      const body=await response.json() as {exercises?:Exercise[];history?:History[];persistenceActive?:boolean;error?:string};
      if(!response.ok)throw new Error(body.error??"Unable to load the practice lab.");
      setExercises(body.exercises??[]);setHistory(body.history??[]);setSaved(Boolean(body.persistenceActive));
      setActive(previous=>previous??body.exercises?.[0]?.id??null);
    }catch(e){setError(e instanceof Error?e.message:"Practice lab unavailable");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  const visible=exercises.filter(x=>(filter==="all"||x.skillId===filter)&&
    (x.title+" "+x.skillId+" "+x.difficulty).toLowerCase().includes(query.trim().toLowerCase()));
  const current=visible.find(x=>x.id===active)??visible[0];
  function choose(id:string){setActive(id);setFeedback(null);setText("");setChoice(null);setError(null);}
  async function submit(){
    if(!current)return;
    setPending(true);setError(null);
    try{
      const response=await fetch("/api/learning/lab",{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({exerciseId:current.id,...(current.kind==="choice"?{selectedIndex:choice}:{textAnswer:text})})});
      const body=await response.json() as Feedback&{error?:string};
      if(!response.ok)throw new Error(body.error??"Unable to check response.");
      setFeedback(body);
      if(body.persisted)void load();
    }catch(e){setError(e instanceof Error?e.message:"Unable to check answer.");}
    finally{setPending(false);}
  }
  return <>
    <SectionTitle eyebrow="Chapter 06 / Coding lab" title="Practice with small, safe challenges"
      description="Predict outputs, debug concepts and fill missing syntax. No arbitrary code is executed, and practice never changes trusted quiz results."
      action={<Link href="/planner" className="btn btn-quiet">Study planner</Link>}/>
    {!saved?<p className="workflow-notice">Practice is available without cloud storage. Sign in after the approved workflow rollout to save your private practice history.</p>:null}
    {error?<div className="auth-error" role="alert"><p>{error}</p>
      <button type="button" className="btn btn-outline" onClick={()=>void load()}>Try loading again</button></div>:null}
    {loading?<div className="motion-action-status"><ActivityIndicator label="Getting guided exercises ready…" compact/></div>:null}
    <div className="workflow-inline-actions"><label className="workflow-task-status">Filter exercises
      <select className="workflow-input" value={filter} onChange={event=>{const value=event.target.value;setFilter(value);
        setActive(exercises.find(x=>value==="all"||x.skillId===value)?.id??null);
        setFeedback(null);setChoice(null);setText("");}}>
        <option value="all">All skills</option>{[...new Set(exercises.map(x=>x.skillId))].map(id=><option key={id} value={id}>{id}</option>)}
      </select></label><span className="note">{history.length} recent saved attempts (unscored)</span></div>
    {pending?<div className="motion-action-status"><ActivityIndicator label="Checking your answer against the guided rubric…" compact/></div>:null}
    <div className="workflow-lab-grid sx-lab-workspace">
      <section className="panel sx-lab-library" aria-label="Challenge library"><h2>Challenge library <small>{visible.length} available</small></h2>
        <label className="sx-lab-search">Find an exercise<input type="search" value={query} placeholder="Search skill or challenge" onChange={e=>setQuery(e.target.value)}/></label>
        {visible.length===0?<p role="status">No matching exercises. <button type="button" className="text-button" onClick={()=>{setQuery("");setFilter("all");}}>Reset filters</button></p>:null}
        {visible.map(exercise=><button aria-pressed={active===exercise.id} className={"btn "+(active===exercise.id?"btn-primary":"btn-outline")}
          type="button" key={exercise.id} style={{display:"block",width:"100%",textAlign:"left",margin:"9px 0"}}
          onClick={()=>choose(exercise.id)}>{exercise.title} · {exercise.skillId}</button>)}
      </section>
      <section className="panel sx-lab-stage" aria-label="Guided code exercise">
        {current?<><span className="eyebrow">{current.skillId} / {current.difficulty}</span>
          <h2>{current.title}</h2><p>{current.prompt}</p>
          <pre className="workflow-code"><code>{current.snippet}</code></pre>
          {current.kind==="choice"?<fieldset disabled={Boolean(feedback)||pending}>
            <legend>Choose the correct response</legend>
            {current.choices?.map((label,index)=><label key={index} className="workflow-field"><span>
              <input type="radio" name="solution" checked={choice===index} onChange={()=>setChoice(index)}/> {label}
            </span></label>)}</fieldset>:
            <label className="workflow-field">Missing keyword or operator
              <input className="workflow-input" autoComplete="off" maxLength={80} value={text}
                disabled={Boolean(feedback)||pending} onChange={event=>setText(event.target.value)}
                placeholder="Type the missing syntax"/>
            </label>}
          {!feedback?<button type="button" className="btn btn-primary"
            disabled={pending||(current.kind==="choice"?choice===null:!text.trim())}
            onClick={()=>void submit()}>{pending?<ActionSpinner label="Checking answer…"/>:"Check answer"}</button>:
            <div className="workflow-field" role="status"><strong>{feedback.correct?"Correct!":"Review this concept"}</strong>
              <p>Expected answer: <code>{feedback.answer}</code></p><p>{feedback.explanation}</p>
              <p className="note">{feedback.trust}{feedback.persisted?" Your attempt was saved.":""}</p>
              <div className="sx-lab-next">
                <button className="btn btn-outline" type="button" onClick={()=>choose(current.id)}>Try again</button>
                <button className="btn btn-primary" type="button" onClick={()=>{
                  const index=visible.findIndex(x=>x.id===current.id);
                  choose(visible[(index+1)%visible.length]?.id??current.id);
                }}>Try next challenge →</button>
                <Link href={"/resources?skill="+encodeURIComponent(current.skillId)} className="btn btn-quiet">Study this topic</Link>
              </div>
            </div>}
        </>:<p>Select a challenge to get started.</p>}
      </section>
    </div>
  </>;
}
