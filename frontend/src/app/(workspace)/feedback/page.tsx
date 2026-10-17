"use client";
import Link from "next/link";
import {useState} from "react";
import {Download,ShieldCheck} from "lucide-react";

const tasks=[
 {id:"onboarding",label:"Understand and choose a learning direction",href:"/onboarding"},
 {id:"dashboard",label:"Find the next useful step on the dashboard",href:"/dashboard"},
 {id:"course",label:"Find a course and open a lesson",href:"/courses"},
 {id:"practice",label:"Find an exercise and review the feedback",href:"/lab"},
 {id:"reassess",label:"Locate an assessment for the skill",href:"/assessments"},
 {id:"account",label:"Understand saved versus sample learning data",href:"/account"},
 {id:"admin",label:"Find a content editor (admins only)",href:"/admin"}
] as const;
type TaskId=typeof tasks[number]["id"];
type Answer={complete:"not-tested"|"yes"|"partly"|"no";difficulty:0|1|2|3|4|5;note:string};
const initial:Answer={complete:"not-tested",difficulty:0,note:""};
export default function ProductFeedback(){
 const [consent,setConsent]=useState(false);
 const [answers,setAnswers]=useState<Partial<Record<TaskId,Answer>>>({});
 const [general,setGeneral]=useState("");
 const [notice,setNotice]=useState("");
 const update=(id:TaskId,change:Partial<Answer>)=>
   setAnswers(old=>({...old,[id]:{...(old[id]??initial),...change}}));
 const ready=tasks.some(task=>answers[task.id]?.complete!=="not-tested"&&Boolean(answers[task.id]?.complete));
 function exportLocally(){
   if(!consent||!ready)return;
   const payload={study:"skillmetry-usability-v1",createdAt:new Date().toISOString(),
     privacy:"Anonymous, participant-controlled export; never uploaded by this page.",
     answers:tasks.flatMap(task=>answers[task.id]&&answers[task.id]?.complete!=="not-tested"?
       [{taskId:task.id,...answers[task.id]}]:[]),general:general.trim()};
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
   const url=URL.createObjectURL(blob);
   const link=document.createElement("a");
   link.href=url;link.download="skillmetry-usability-feedback.json";link.click();
   URL.revokeObjectURL(url);
   setNotice("Feedback downloaded locally. Share it only if you choose.");
 }
 return <main className="sx-feedback-page">
   <header className="sx-feedback-head">
     <span className="sx-eyebrow">OPT-IN PRODUCT STUDY / NO BACKGROUND COLLECTION</span>
     <h1>Help improve Skillmetry</h1>
     <p>Try any of the real learning tasks, then record what worked and what was confusing. Do not enter your name, email, passwords or private student records.</p>
   </header>
   <section className="sx-feedback-trust" aria-label="Privacy notice">
     <ShieldCheck size={21} aria-hidden="true"/>
     <p>Your answers stay on this page until you download them. This form sends no analytics or responses to Skillmetry servers. Leaving the page may discard them.</p>
   </section>
   <div className="sx-feedback-tasks">
     {tasks.map((task,i)=>{
       const value=answers[task.id]??initial;
       return <section className="sx-feedback-task" key={task.id} aria-labelledby={"feedback-"+task.id}>
         <div className="sx-feedback-task-head">
           <div><span className="sx-eyebrow">TASK {String(i+1).padStart(2,"0")}</span>
             <h2 id={"feedback-"+task.id}>{task.label}</h2></div>
           <Link href={task.href} target="_blank" rel="noopener noreferrer">Open task ↗</Link>
         </div>
         <label>Could you complete this task?
           <select value={value.complete} onChange={e=>update(task.id,{complete:e.target.value as Answer["complete"]})}>
             <option value="not-tested">Not tested</option><option value="yes">Yes</option>
             <option value="partly">Partly</option><option value="no">No</option>
           </select>
         </label>
         <label>Difficulty (1 easy – 5 difficult)
           <select value={value.difficulty} onChange={e=>update(task.id,{difficulty:Number(e.target.value) as Answer["difficulty"]})}>
             <option value={0}>Not rated</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
           </select>
         </label>
         <label>What happened? (optional; no personal details)
           <textarea rows={2} maxLength={600} placeholder="What was unclear or slowed you down?"
             value={value.note} onChange={e=>update(task.id,{note:e.target.value})}/>
         </label>
       </section>;
     })}
   </div>
   <section className="sx-feedback-finish">
     <h2>Anything else?</h2>
     <label>Suggestions or accessibility problems<textarea rows={3} maxLength={1600}
       value={general} onChange={e=>setGeneral(e.target.value)}
       placeholder="Describe what you expected and what happened."/></label>
     <label className="sx-feedback-consent"><input type="checkbox" checked={consent}
       onChange={e=>setConsent(e.target.checked)}/>
       I understand this is a local export. I will review the file before choosing to share it with the project owner.
     </label>
     <button type="button" className="btn btn-primary" disabled={!consent||!ready} onClick={exportLocally}>
       <Download size={17} aria-hidden="true"/> Download my feedback</button>
     {notice?<p role="status">{notice}</p>:null}
   </section>
 </main>;
}
