"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Lightbulb, RotateCcw } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { ActivityIndicator, ActionSpinner, ContentSkeleton } from "@/components/motion-ui";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { curriculumCatalog, curriculumTopicById } from "@skillmetry/shared/data/curriculum";
import { diagnosticTopics, isDiagnosticAssessmentId } from "@skillmetry/shared/data/diagnostic-taxonomy";
import { skillById } from "@skillmetry/shared/data/catalog";
import type { AssessmentId } from "@skillmetry/shared/types/domain";

type PracticeQuestion = {id:string;prompt:string;choices:string[];difficulty?:string;hint?:string};
type PracticeResult = {correctCount:number;totalQuestions:number;review:{
  id:string;prompt:string;selectedIndex:number;correctIndex:number;choices:string[];explanation:string;difficulty?:string
}[];trust:string};
type PracticePayload = {mode?:"curriculum";topicId?:string;topicTitle?:string;skillId?:string;difficulty?:string;
  lessonHref?:string|null;nextTopicId?:string|null;questions?:PracticeQuestion[];error?:string};
type DiagnosticEntry=[assessmentId:keyof typeof diagnosticTopics,topics:(typeof diagnosticTopics)[keyof typeof diagnosticTopics]];

function PracticeContent() {
  const params=useSearchParams();
  const assessmentId=params.get("assessment") as AssessmentId|null;
  const requestedTopic=params.get("topic")??"";
  const assessment=assessmentCatalog.find(item=>item.id===assessmentId);
  const diagnosticTopic=useMemo(()=>assessmentId&&isDiagnosticAssessmentId(assessmentId)
    ?diagnosticTopics[assessmentId].find(item=>item.id===requestedTopic):null,[assessmentId,requestedTopic]);
  const curriculumTopic=curriculumTopicById[requestedTopic];
  const [questions,setQuestions]=useState<PracticeQuestion[]>([]);
  const [metadata,setMetadata]=useState<Omit<PracticePayload,"questions"|"error">>({});
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [result,setResult]=useState<PracticeResult|null>(null);
  const [activeIndex,setActiveIndex]=useState(0);
  const [hintVisible,setHintVisible]=useState(false);
  const [loading,setLoading]=useState(Boolean(diagnosticTopic||curriculumTopic));
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [query,setQuery]=useState("");
  const [difficulty,setDifficulty]=useState("all");
  const [skillFilter,setSkillFilter]=useState("all");

  const hasSelection=Boolean((assessment&&diagnosticTopic)||curriculumTopic);
  useEffect(()=>{
    if(!hasSelection){setLoading(false);setQuestions([]);return;}
    const controller=new AbortController();
    const queryString=assessment&&diagnosticTopic
      ?`assessment=${encodeURIComponent(assessment.id)}&diagnosticTopic=${encodeURIComponent(diagnosticTopic.id)}`
      :`topic=${encodeURIComponent(requestedTopic)}`;
    setLoading(true);setError(null);setQuestions([]);setAnswers({});setResult(null);setActiveIndex(0);setHintVisible(false);
    void fetch(`/api/assessments/practice?${queryString}`,{signal:controller.signal,cache:"no-store"})
      .then(async response=>{
        const body=await response.json() as PracticePayload;
        if(!response.ok||!body.questions)throw new Error(body.error??"Practice is unavailable");
        return body;
      }).then(body=>{
        if(controller.signal.aborted)return;
        const items=body.questions??[];
        const metadataPayload={...body};
        delete metadataPayload.questions;delete metadataPayload.error;
        setQuestions(items);setMetadata(metadataPayload);setLoading(false);
      }).catch(caught=>{
        if(controller.signal.aborted)return;
        setError(caught instanceof Error?caught.message:"Practice is unavailable");setLoading(false);
      });
    return ()=>controller.abort();
  },[assessment,diagnosticTopic,hasSelection,requestedTopic]);

  const filteredTopics=curriculumCatalog.topics.filter(topic=>{
    const needle=query.trim().toLowerCase();
    return (difficulty==="all"||topic.difficulty===difficulty)
      &&(skillFilter==="all"||topic.skillIds.includes(skillFilter))
      &&(!needle||`${topic.title} ${topic.description} ${topic.skillIds.join(" ")}`.toLowerCase().includes(needle));
  });
  const current=questions[activeIndex];
  const currentReview=current?result?.review.find(item=>item.id===current.id):undefined;
  const allAnswered=questions.length>0&&questions.every(question=>answers[question.id]!==undefined);

  async function checkAnswers(){
    if(!hasSelection||!allAnswered)return;
    setPending(true);setError(null);
    try{
      const payload=assessment&&diagnosticTopic
        ?{assessmentId:assessment.id,topicId:diagnosticTopic.id,answers}
        :{topicId:requestedTopic,answers};
      const response=await fetch("/api/assessments/practice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const body=await response.json() as PracticeResult&{error?:string};
      if(!response.ok)throw new Error(body.error??"Unable to check answers");
      setResult(body);setActiveIndex(0);setHintVisible(false);
    }catch(caught){setError(caught instanceof Error?caught.message:"Unable to check answers");}
    finally{setPending(false);}
  }

  const heading=diagnosticTopic?.label??metadata.topicTitle??curriculumTopic?.title??"Choose a topic";
  return <>
    <SectionTitle eyebrow="Topic practice" title={heading}
      description="Apply one lesson at a time with hints and reviewed explanations. Practice activity stays separate from trusted quiz scores."
      action={<Link className="btn btn-quiet" href={hasSelection?"/practice":"/assessments"}>{hasSelection?<><ArrowLeft aria-hidden="true"/>All topics</>:"Verified assessments"}</Link>}/>

    {!hasSelection?<section className="practice-topic-picker" aria-labelledby="practice-topic-heading">
      <header><span className="eyebrow">54 curriculum topics</span><h2 id="practice-topic-heading">Choose a skill topic to practice</h2>
        <p>Every Phase 2 lesson now has three guided concept checks. Coding and SQL exercises are also available in Coding Practice.</p></header>
      <div className="p3-practice-filters">
        <label>Search topics<input type="search" name="topic-query" autoComplete="off" value={query} onChange={event=>setQuery(event.target.value)} placeholder="e.g. joins or accessibility…"/></label>
        <label>Skill<select name="skill-filter" value={skillFilter} onChange={event=>setSkillFilter(event.target.value)}><option value="all">All 18 skills</option>
          {curriculumCatalog.skills.map(item=><option key={item.skillId} value={item.skillId}>{skillById[item.skillId]?.label??item.skillId}</option>)}</select></label>
        <label>Difficulty<select name="difficulty-filter" value={difficulty} onChange={event=>setDifficulty(event.target.value)}><option value="all">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      </div>
      <p className="note" role="status">{filteredTopics.length} matching topics</p>
      {filteredTopics.length?<div className="p3-topic-grid">{filteredTopics.map(topic=><article key={topic.id}>
        <div><span className="eyebrow">{skillById[topic.skillIds[0]]?.label??topic.skillIds[0]} · {topic.difficulty}</span><h3>{topic.title}</h3><p>{topic.description}</p></div>
        <Link className="text-link" href={`/practice?topic=${encodeURIComponent(topic.id)}`}>Start 3-question set<ArrowRight aria-hidden="true"/></Link>
      </article>)}</div>:<p className="workflow-notice">No topics match these filters. Clear the search or choose another level.</p>}
      <aside className="p3-diagnostic-practice"><h3>Practice from diagnostic evidence</h3><p>These sets stay available for the four staged 2026.3 diagnostic tracks.</p>
        <div>{(Object.entries(diagnosticTopics) as DiagnosticEntry[]).map(([id,topics])=>{const item=assessmentCatalog.find(candidate=>candidate.id===id);return item?<details key={id}><summary>{item.title}</summary><nav aria-label={`${item.title} diagnostic practice`}>{topics.map(topic=><Link key={topic.id} href={`/practice?assessment=${encodeURIComponent(id)}&topic=${encodeURIComponent(topic.id)}`}>{topic.label}<ArrowRight aria-hidden="true"/></Link>)}</nav></details>:null;})}</div>
      </aside>
    </section>:null}

    {loading?<ContentSkeleton kind="cards" label="Loading targeted practice questions…"/>:null}
    {error?<p className="auth-error" role="alert">{error}</p>:null}
    {pending?<ActivityIndicator compact label="Checking answers against the practice rubric…"/>:null}
    {hasSelection&&!loading&&questions.length&&current?<section className="diagnostic-practice p3-practice-session">
      <div className="assessment-paper-head"><div><BookOpenCheck aria-hidden="true"/><h2>{heading}</h2>
        <p>{questions.length} guided exercises · {metadata.difficulty??"focused"} · no code execution or proficiency score</p></div></div>
      <nav className="p3-question-nav" aria-label="Practice question navigation">{questions.map((question,index)=><button type="button" key={question.id}
        aria-current={index===activeIndex?"step":undefined} className={index===activeIndex?"active":""}
        onClick={()=>{setActiveIndex(index);setHintVisible(false);}}>{index+1}<span className="sr-only">{answers[question.id]===undefined?" unanswered":" answered"}</span></button>)}</nav>
      <fieldset disabled={Boolean(result)||pending}>
        <legend><span>{activeIndex+1}.</span> {current.prompt}</legend>
        {current.choices.map((choice,index)=><label key={index}><input type="radio" name={current.id} checked={answers[current.id]===index}
          onChange={()=>setAnswers(previous=>({...previous,[current.id]:index}))}/>{choice}</label>)}
      </fieldset>
      {!result&&current.hint?<div className="p3-hint"><button type="button" className="btn btn-quiet" aria-expanded={hintVisible} onClick={()=>setHintVisible(value=>!value)}><Lightbulb aria-hidden="true"/>{hintVisible?"Hide hint":"Show hint"}</button>{hintVisible?<p>{current.hint}</p>:null}</div>:null}
      {currentReview?<article className={answers[current.id]===currentReview.correctIndex?"p3-answer-correct":"p3-answer-review"} role="status">
        <strong>{answers[current.id]===currentReview.correctIndex?"Correct reasoning":"Review this choice"}</strong>
        <p>Your answer: {currentReview.choices[currentReview.selectedIndex]}</p><p>Reviewed answer: {currentReview.choices[currentReview.correctIndex]}</p><small>{currentReview.explanation}</small>
      </article>:null}
      <div className="p3-practice-actions">
        <button className="btn btn-outline" type="button" disabled={activeIndex===0} onClick={()=>{setActiveIndex(index=>index-1);setHintVisible(false);}}>Previous</button>
        {activeIndex<questions.length-1?<button className="btn btn-primary" type="button" onClick={()=>{setActiveIndex(index=>index+1);setHintVisible(false);}}>Next question<ArrowRight aria-hidden="true"/></button>:
          !result?<button className="btn btn-primary" type="button" disabled={pending||!allAnswered} onClick={()=>void checkAnswers()}>{pending?<ActionSpinner label="Checking answers…"/>:"Check answers"}</button>:null}
      </div>
      {result?<div className="diagnostic-practice-feedback">
        <CheckCircle2 aria-hidden="true"/><strong>{result.correctCount}/{result.totalQuestions} practice answers correct</strong><p>{result.trust}</p>
        <div className="p3-result-actions"><button type="button" className="btn btn-outline" onClick={()=>{setResult(null);setAnswers({});setActiveIndex(0);}}><RotateCcw aria-hidden="true"/>Try again</button>
          {metadata.lessonHref?<Link className="btn btn-quiet" href={metadata.lessonHref}>Review related lesson</Link>:null}
          <Link className="btn btn-primary" href={`/revision?topic=${encodeURIComponent(requestedTopic)}${assessment?`&assessment=${encodeURIComponent(assessment.id)}`:""}`}>Add to revision queue</Link>
          {metadata.nextTopicId?<Link className="btn btn-quiet" href={`/practice?topic=${encodeURIComponent(metadata.nextTopicId)}`}>Next topic<ArrowRight aria-hidden="true"/></Link>:null}
          {assessment?<Link className="btn btn-quiet" href={`/assessments?assessment=${assessment.id}`}>Reassess when ready</Link>:null}
        </div>
      </div>:null}
    </section>:null}
  </>;
}

export default function PracticePage(){
  return <Suspense fallback={<ContentSkeleton kind="cards" label="Preparing targeted practice"/>}><PracticeContent/></Suspense>;
}
