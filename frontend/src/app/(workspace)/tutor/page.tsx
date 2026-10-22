"use client";
import {ActivityIndicator,ActionSpinner} from "@/components/motion-ui";
import {Suspense,useEffect,useState,type FormEvent} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import {SectionTitle} from "@/components/section-title";
import {skills} from "@skillmetry/shared/data/catalog";
type Answer={mode:"ai"|"curated";answer:string;resources:{id:string;title:string;provider:string;url:string}[];disclaimer:string};
function TutorContent(){
 const search=useSearchParams();
 const requested=search.get("skill");
 const validSkill=requested && skills.some(item=>item.id===requested) ? requested : "javascript";
 const [skill,setSkill]=useState(validSkill),[question,setQuestion]=useState("");
 useEffect(()=>{setSkill(validSkill);setQuestion("");},[validSkill]);
 const [consent,setConsent]=useState(false),[answer,setAnswer]=useState<Answer|null>(null);
 const [pending,setPending]=useState(false),[error,setError]=useState("");
 async function ask(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setPending(true);setError("");setAnswer(null);
  try{
   const res=await fetch("/api/ai/tutor",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({skillId:skill,question,useAI:consent})});
   const body=await res.json() as Answer&{error?:string};
   if(!res.ok)throw new Error(body.error??"Tutor is unavailable");
   setAnswer(body);
  }catch(e){setError(e instanceof Error?e.message:"Tutor is unavailable");}
  finally{setPending(false);}
 }
 return <>
  <SectionTitle eyebrow="Study Help" title="Ask for your next learning step"
   description="Explore curated explanations and references; choose explicitly whether to send your question to an external AI provider."/>
  <div className={"sx-tutor-layout"+(answer||pending?" has-answer":"")}>
   <form className="panel sx-tutor-form" onSubmit={ask}>
    <label className="workflow-field">Learning topic<select className="workflow-input" value={skill}
      onChange={e=>{setSkill(e.target.value);setAnswer(null);}}>
      {skills.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
    <label className="workflow-field">Your question<textarea className="workflow-input" rows={4}
      value={question} onChange={e=>setQuestion(e.target.value)} minLength={8} maxLength={1200}
      placeholder="Explain JavaScript async/await with a small example" required/></label>
    <label className="workflow-field"><span><input type="checkbox" checked={consent}
      onChange={e=>setConsent(e.target.checked)}/> Send this question and selected skill to the external AI provider</span></label>
    <p className="note">When unchecked, Skillmetry gives curated guidance only. No student profile, scores, email or full chat history is sent. Provider access may not be enabled.</p>
    <button type="submit" className="btn btn-primary" disabled={pending||question.trim().length<8}>
      {pending?<ActionSpinner label="Preparing guidance…"/>:consent?"Ask AI tutor":"Show curated guidance"}</button>
    {error?<p className="auth-error" role="alert">{error}</p>:null}
   </form>
   {answer||pending?<section className="panel sx-tutor-answer" aria-live="polite">
    <h2>Your study guidance</h2>
    {pending?<ActivityIndicator compact label={consent?"Preparing your consented tutor response…":"Finding curated learning guidance…"} detail="No study results are changed by tutor answers."/>:!answer?<p>Select a topic and ask a question. Start with curated guidance if AI is not configured.</p>:
     <><p><strong>{answer.mode==="ai"?"AI-generated explanation":"Curated learning pathway"}</strong></p>
      <p className="workflow-answer">{answer.answer}</p>
      <h3>Reviewed learning resources</h3>
      {answer.resources.length?answer.resources.map(r=><p key={r.id}><a href={r.url} target="_blank" rel="noopener noreferrer">
       {r.title} · {r.provider}</a></p>):<p>Visit Learning Resources for the current catalog.</p>}
      <p className="note">{answer.disclaimer}</p><Link href="/lab" className="btn btn-outline">Practice this skill</Link></>}
   </section>:null}
  </div>
 </>;
}

export default function Tutor(){return <Suspense fallback={<ActivityIndicator compact label="Loading learning guidance…"/>}><TutorContent/></Suspense>;}
