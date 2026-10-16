"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {SectionTitle} from "@/components/section-title";
import {useAuth} from "@/components/auth-provider";
import type {JobAnalysis} from "@skillmetry/shared/lib/job-intelligence";
type Result=JobAnalysis&{mode:string;storage:string;notice:string};
type SavedRole={id:string;created_at:string;extracted_skills:{kind?:string;title?:string;skillId?:string;matchedTerm?:string}[]};
export default function Jobs(){
 const {user}=useAuth();
 const [roleTitle,setRoleTitle]=useState("");
 const [saved,setSaved]=useState<SavedRole[]>([]),[storageBusy,setStorageBusy]=useState(false);
 const [storageNote,setStorageNote]=useState("");
 useEffect(()=>{
  if(!user)return;
  let cancelled=false;
  void fetch("/api/jobs/saved",{cache:"no-store"}).then(r=>r.json()).then((body:{saved?:SavedRole[]})=>{
   if(!cancelled)setSaved(body.saved??[]);
  }).catch(()=>{if(!cancelled)setStorageNote("Saved analyses could not be loaded.");});
  return ()=>{cancelled=true;};
 },[user?.id]);
 async function updateSaved(method:"POST"|"DELETE",id?:string){
  setStorageBusy(true);setStorageNote("");
  try{
   const response=await fetch("/api/jobs/saved",{method,headers:{"Content-Type":"application/json"},
    body:JSON.stringify(method==="POST"?{title:roleTitle,description}:{id})});
   const body=await response.json() as {saved?:SavedRole;deleted?:boolean;error?:string};
   if(!response.ok)throw new Error(body.error??"Unable to update saved roles");
   if(body.saved)setSaved(current=>[body.saved!,...current]);
   if(body.deleted)setSaved(current=>current.filter(row=>row.id!==id));
   setStorageNote(method==="POST"?"Only the recognized requirements were saved, not the raw description.":"Saved comparison removed.");
  }catch(e){setStorageNote(e instanceof Error?e.message:"Saved role update failed");}
  finally{setStorageBusy(false);}
 }

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
      {user?<div className="workflow-field"><label>Save a private requirements summary (optional)
        <input className="workflow-input" maxLength={80} placeholder="Role title, e.g. Frontend Engineer" value={roleTitle}
         onChange={e=>setRoleTitle(e.target.value)}/></label>
        <button className="btn btn-outline" type="button" disabled={storageBusy||roleTitle.trim().length<3||!result.matches}
         onClick={()=>void updateSaved("POST")}>Save recognized skills only</button></div>:null}
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
  {user?<section className="panel workflow-panel">
    <h2>Saved job requirement summaries</h2>
    <p className="note">Only role labels and recognized catalog requirements are stored privately. Original descriptions and quiz scores are not saved here.</p>
    {saved.map(item=><div className="workflow-result" key={item.id}>
      <div><strong>{item.extracted_skills.find(x=>x.kind==="role")?.title??"Saved role"}</strong>
        <small>{item.extracted_skills.filter(x=>x.skillId).map(x=>x.skillId).join(", ")}</small>
        <small>Saved {new Date(item.created_at).toLocaleDateString("en-IN")}</small></div>
      <button className="btn btn-outline" type="button" disabled={storageBusy} onClick={()=>void updateSaved("DELETE",item.id)}>Delete summary</button>
    </div>)}
    {!saved.length?<p className="note">No saved role summaries yet.</p>:null}
    {storageNote?<p role="status" className="note">{storageNote}</p>:null}
  </section>:null}
 </>;
}
