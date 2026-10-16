"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {SectionTitle} from "@/components/section-title";
import type {JobAnalysis} from "@skillmetry/shared/lib/job-intelligence";
type Result=JobAnalysis&{mode:string;storage:string;notice:string};
export default function Jobs(){
 const [description,setDescription]=useState("");
 const [result,setResult]=useState<Result|null>(null);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 async function analyze(event:FormEvent<HTMLFormElement>){
   event.preventDefault();setPending(true);setError("");setResult(null);
   try{
     const response=await fetch("/api/jobs/analyze",{method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({description})});
     const body=await response.json() as Result&{error?:string};
     if(!response.ok)throw new Error(body.error??"Analysis unavailable");
     setResult(body);
   }catch(e){setError(e instanceof Error?e.message:"Could not analyze this job.");}
   finally{setPending(false);}
 }
 return <>
  <SectionTitle eyebrow="Chapter 08 / Career intelligence" title="Turn a job description into a learning map"
    description="Match stated requirements against Skillmetry's canonical skills and your server-graded quiz evidence. No imagined employability percentages."/>
  <div className="grid-2">
   <form className="panel" onSubmit={analyze}>
    <label className="workflow-field">Job description
      <textarea className="workflow-input" rows={12} required minLength={50} maxLength={12000}
        placeholder="Paste a public job description. Remove names, personal details and other sensitive data."
        value={description} onChange={event=>setDescription(event.target.value)}/>
    </label>
    <p className="note">This text is processed for this request only and is not stored. Skill recognition uses curated phrases, not generative AI.</p>
    <button className="btn btn-primary" disabled={pending||description.trim().length<50} type="submit">
      {pending?"Analyzing…":"Analyze requirements"}
    </button>
    {error?<p className="auth-error" role="alert">{error}</p>:null}
   </form>
   <section className="panel" aria-live="polite">
    <h2>Requirements and your next steps</h2>
    {!result?<p>Paste a role description to map known technologies into assessments and learning resources.</p>:
     <>
      <p className="note">{result.summary}</p>
      <p><strong>{result.matches}</strong> recognized skills · <strong>{result.unassessed}</strong> without a trusted quiz result</p>
      {result.mode==="unassessed-reference-only"?<p className="workflow-notice">Sign in to compare against your own assessment history. Demo results were not used.</p>:null}
      {result.requirements.map(req=><article className="workflow-result" key={req.skillId}>
        <div><strong>{req.label}</strong><small>Matched: {req.matchedTerm}</small></div>
        <span>{req.score===null?"Not assessed":`${req.score}/100 (quiz)`}</span>
        <Link href={req.nextStep==="assessment"?"/assessments":
          req.nextStep==="practice"?"/lab":`/resources?skill=${encodeURIComponent(req.skillId)}`}>
          {req.nextStep==="assessment"?"Check assessment availability":req.nextStep==="practice"?"Practice":"Find learning resources"}
        </Link>
      </article>)}
      <h3>Related career pathways</h3>
      {result.matchingCareers.filter(x=>x.matchedSkillCount>0).map(c=><p key={c.id}>{c.title}: {c.matchedSkillCount} matching requirements</p>)}
      <p className="note">{result.notice}</p>
     </>}
   </section>
  </div>
 </>;
}
