"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense,useEffect,useMemo,useState } from "react";
import { BookOpenCheck,CheckCircle2,RotateCcw } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";

type PracticeQuestion = {id:string;prompt:string;choices:string[]};
type PracticeResult = {correctCount:number;totalQuestions:number;review:{
  id:string;prompt:string;selectedIndex:number;correctIndex:number;choices:string[];explanation:string
}[];trust:string};

function PracticeContent() {
  const params=useSearchParams();
  const id=params.get("assessment") as AssessmentId|null;
  const topicId=params.get("topic")??"";
  const assessment=assessmentCatalog.find(a=>a.id===id);
  const topic=useMemo(()=>id?diagnosticTopics[id]?.find(t=>t.id===topicId):null,[id,topicId]);
  const [questions,setQuestions]=useState<PracticeQuestion[]>([]);
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [result,setResult]=useState<PracticeResult|null>(null);
  const [loading,setLoading]=useState(true);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    if(!assessment||!topic){setLoading(false);setQuestions([]);return;}
    const controller=new AbortController();
    setLoading(true);setError(null);setQuestions([]);setAnswers({});setResult(null);
    void fetch(`/api/assessments/practice?assessment=${encodeURIComponent(assessment.id)}&topic=${encodeURIComponent(topic.id)}`,
      {signal:controller.signal,cache:"no-store"}).then(async r=>{
      const body=await r.json() as {questions?:PracticeQuestion[];error?:string};
      if(!r.ok||!body.questions)throw new Error(body.error??"Practice is unavailable");
      return body.questions;
    }).then(items=>{setQuestions(items);setLoading(false);}).catch(e=>{
      if(controller.signal.aborted)return;
      setError(e instanceof Error?e.message:"Practice is unavailable");setLoading(false);
    });
    return ()=>controller.abort();
  },[assessment,topic]);

  async function checkAnswers(){
    if(!assessment||!topic||questions.some(q=>answers[q.id]===undefined))return;
    setPending(true);setError(null);
    try{
      const response=await fetch("/api/assessments/practice",{method:"POST",
        headers:{"Content-Type":"application/json"},body:JSON.stringify({assessmentId:assessment.id,topicId:topic.id,answers})});
      const body=await response.json() as PracticeResult&{error?:string};
      if(!response.ok)throw new Error(body.error??"Unable to check answers");
      setResult(body);
    }catch(e){setError(e instanceof Error?e.message:"Unable to check answers");}
    finally{setPending(false);}
  }

  return <><SectionTitle eyebrow="Focused practice" title={topic?topic.label:"Choose a diagnostic topic"}
      description="Exercises for learning, not certification. Practice never changes server-graded scores or your Digital Twin."
      action={<Link className="btn btn-quiet" href={assessment?`/assessments?assessment=${assessment.id}`:"/assessments"}>Back to assessments</Link>}/>
    {!assessment||!topic?<p className="auth-error">This practice topic does not exist. Return to assessments and choose a valid topic.</p>:null}
    {loading?<p role="status">Loading practice questions…</p>:null}
    {error?<p className="auth-error" role="alert">{error}</p>:null}
    {assessment&&topic&&!loading&&questions.length?<section className="diagnostic-practice">
      <div className="assessment-paper-head"><div><BookOpenCheck aria-hidden="true"/><h2>{assessment.title} · {topic.label}</h2><p>Answer five independently authored exercises, then review the explanations.</p></div></div>
      {questions.map((q,i)=><fieldset key={q.id} disabled={Boolean(result)||pending}>
        <legend><span>{i+1}.</span> {q.prompt}</legend>
        {q.choices.map((choice,index)=><label key={index}><input type="radio" name={q.id} checked={answers[q.id]===index}
          onChange={()=>setAnswers(prev=>({...prev,[q.id]:index}))}/> {choice}</label>)}
      </fieldset>)}
      {!result?<button className="btn btn-primary" type="button" disabled={pending||questions.some(q=>answers[q.id]===undefined)}
        onClick={checkAnswers}>{pending?"Checking…":"Check answers and explain"}</button>:<div className="diagnostic-practice-feedback" role="status">
        <CheckCircle2 aria-hidden="true"/><strong>{result.correctCount}/{result.totalQuestions} practice answers correct</strong>
        <p>{result.trust}</p>
        {result.review.map(q=><article key={q.id}><strong>{q.prompt}</strong><p>Your choice: {q.choices[q.selectedIndex]}</p>
        <p>Correct: {q.choices[q.correctIndex]}</p><small>{q.explanation}</small></article>)}
        <button type="button" className="btn btn-outline" onClick={()=>{setResult(null);setAnswers({});}}><RotateCcw aria-hidden="true"/>Try again</button>
        <Link className="btn btn-primary" href={`/assessments?assessment=${assessment.id}`}>Reassess when ready</Link>
      </div>}
    </section>:null}
  </>;
}
export default function PracticePage(){
  return <Suspense fallback={<p role="status">Preparing practice…</p>}><PracticeContent/></Suspense>;
}
