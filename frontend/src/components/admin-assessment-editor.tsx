import {AdminReviewRequest} from "@/components/admin-editorial-reviews";
"use client";
import {useEffect,useState} from "react";
import {ArrowDown,ArrowUp,BookOpenCheck,Plus,Save,Send,Trash2} from "lucide-react";
import {
 editableAssessments,initialAuthoredBank,nextAuthoredQuestion,
 saveAuthoredBankSchema,type AdminBankRow,type AuthoredBank,type AuthoredQuestion
} from "@skillmetry/shared/lib/admin-assessments";
import {ActivityIndicator,ActionSuccess} from "@/components/motion-ui";

type Role="owner"|"editor"|"reviewer";
type History={revision:number;action:string;created_at:string};
const first=editableAssessments[0];

export function AdminAssessmentEditor({role,onDirtyChange}:{role:Role;onDirtyChange?:(dirty:boolean)=>void}){
 const [rows,setRows]=useState<AdminBankRow[]>([]);
 const [assessmentId,setAssessmentId]=useState<string>(first.id);
 const [draft,setDraft]=useState<AuthoredBank>(initialAuthoredBank);
 const [history,setHistory]=useState<History[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState<"draft"|"publish"|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const current=rows.find(row=>row.assessment_id===assessmentId);
 const original=current?.draft??initialAuthoredBank();
 const changed=JSON.stringify(draft)!==JSON.stringify(original);
 const validation=saveAuthoredBankSchema.safeParse({
   assessmentId,expectedRevision:current?.revision??0,publish:false,draft
 });
 const publishValidation=saveAuthoredBankSchema.safeParse({
   assessmentId,expectedRevision:current?.revision??0,publish:true,draft
 });
 useEffect(()=>{onDirtyChange?.(changed);},[changed,onDirtyChange]);
 useEffect(()=>{
   if(!changed)return;
   const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue="";};
   window.addEventListener("beforeunload",warn);
   return()=>window.removeEventListener("beforeunload",warn);
 },[changed]);
 useEffect(()=>{
   const controller=new AbortController();
   void (async()=>{
     try{
       const r=await fetch("/api/admin/assessments",{cache:"no-store",signal:controller.signal});
       if(!r.ok)throw new Error("Question Bank Builder needs its approved database migration.");
       const body=await r.json() as {banks:AdminBankRow[]};
       if(!controller.signal.aborted){
         setRows(body.banks);
         const stored=body.banks.find(b=>b.assessment_id===assessmentId);
         if(stored?.draft)setDraft(stored.draft);
       }
     }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Cannot load question banks.");}
     finally{if(!controller.signal.aborted)setLoading(false);}
   })();
   return()=>controller.abort();
 // Initial library load only; switching banks uses local snapshot rows.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{
   const controller=new AbortController();
   setHistory([]);
   if(!current)return;
   void (async()=>{
     try{
       const response=await fetch("/api/admin/assessments/history?assessmentId="+encodeURIComponent(assessmentId),
         {cache:"no-store",signal:controller.signal});
       if(response.ok){
         const data=await response.json() as {history:History[]};
         if(!controller.signal.aborted)setHistory(data.history);
       }
     }catch{/* Optional history metadata only. */}
   })();
   return()=>controller.abort();
 },[assessmentId,current?.revision]);

 function choose(id:string){
   if(id===assessmentId)return;
   if(changed&&!window.confirm("Discard unsaved question bank changes?"))return;
   const next=rows.find(b=>b.assessment_id===id);
   setAssessmentId(id);setDraft(next?.draft??initialAuthoredBank());
   setError("");setNotice("");
 }
 function edit(index:number,change:Partial<AuthoredQuestion>){
   setDraft(old=>({...old,questions:old.questions.map((q,i)=>i===index?{...q,...change}:q)}));
   setNotice("");
 }
 function changeOption(index:number,optionIndex:number,value:string){
   const choices=[...draft.questions[index].choices];
   choices[optionIndex]=value;
   edit(index,{choices:choices as AuthoredQuestion["choices"]});
 }
 function move(index:number,direction:-1|1){
   setDraft(old=>{
     const other=index+direction;
     if(other<0||other>=old.questions.length)return old;
     const questions=[...old.questions];
     [questions[index],questions[other]]=[questions[other],questions[index]];
     return {...old,questions};
   });
   setNotice("");
 }
 async function save(publish:boolean){
   if(loading||saving||role==="reviewer"||(publish&&role!=="owner"))return;
   const valid=publish?publishValidation:validation;
   if(!valid.success){setError(valid.error.issues[0]?.message??"Complete required fields.");return;}
   if(publish&&!window.confirm("Publish this version of the question bank? Students may be assessed with these questions and existing published versions will be kept unchanged."))return;
   setSaving(publish?"publish":"draft");setError("");setNotice("");
   try{
     const response=await fetch("/api/admin/assessments",{
       method:"PUT",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({assessmentId,expectedRevision:current?.revision??0,draft,publish})
     });
     const result=await response.json() as {error?:string;result?:{revision:number;publishedVersion:string|null}};
     if(!response.ok||!result.result)throw new Error(result.error??"Question bank could not be saved.");
     const now=new Date().toISOString();
     setRows(items=>[...items.filter(row=>row.assessment_id!==assessmentId),{
       assessment_id:assessmentId,draft,revision:result.result!.revision,
       published_version:result.result!.publishedVersion,
       updated_at:now,published_at:publish?now:current?.published_at??null
     }]);
     setNotice(publish?"New immutable question bank version published.":"Private question bank draft saved.");
   }catch(e){setError(e instanceof Error?e.message:"Could not save question bank.");}
   finally{setSaving(null);}
 }
 const target=editableAssessments.find(item=>item.id===assessmentId)??first;
 const disabled=loading||!!saving||role==="reviewer";
 const full=draft.questions.length===10;
 return <div className="admin-editor-grid">
   <aside className="admin-skill-panel">
     <label htmlFor="admin-assessment-select">Assessment to author</label>
     <select id="admin-assessment-select" value={assessmentId} disabled={loading||!!saving}
       onChange={e=>choose(e.target.value)}>
       {editableAssessments.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}
     </select>
     <div className="admin-guide-state">
       <strong>{current?.published_version?"Published version available":"Draft / not published"}</strong>
       <small>Draft revision {current?.revision??0} · Published {current?.published_version??"none"}</small>
       <small>{draft.questions.length}/10 questions · {target.skillId}</small>
     </div>
     <details className="admin-history" hidden={!history.length}><summary>Revision history · {history.length} entries</summary><h3>Version history</h3>
       {history.length?history.map(item=><p key={item.revision}>v{item.revision} · {item.action} · {new Date(item.created_at).toLocaleString()}</p>):
         <p>No saved revisions yet.</p>}
     </details>
     <p className="note">Each publication creates a new immutable answer-key snapshot. Old student submissions keep their original version.</p>
   </aside>
   <section className="admin-editor-main">
     <div className="admin-editor-heading">
       <span className="admin-eyebrow">ASSESSMENT / QUESTION BANK</span>
       <h2><BookOpenCheck size={21} aria-hidden="true"/> Author secure quiz questions</h2>
       <p>Prepare exactly ten four-choice questions for {target.title}. The correct answers and explanations remain private to authorized editors and the trusted grading server.</p>
     </div>
     {loading?<ActivityIndicator label="Loading secure question drafts…"/>:null}
     <fieldset disabled={disabled} className="admin-editor-fields admin-course-fields">
       <div className="admin-course-modules">
         {draft.questions.map((q,index)=><article key={index} className="admin-course-module">
           <div className="admin-course-module-header">
             <strong>Question {index+1}</strong>
             <div className="admin-step-order">
               <button type="button" aria-label={"Move question "+(index+1)+" up"} disabled={index===0}
                 onClick={()=>move(index,-1)}><ArrowUp size={16}/></button>
               <button type="button" aria-label={"Move question "+(index+1)+" down"}
                 disabled={index===draft.questions.length-1} onClick={()=>move(index,1)}><ArrowDown size={16}/></button>
               <button type="button" aria-label={"Remove question "+(index+1)}
                 disabled={draft.questions.length===1}
                 onClick={()=>setDraft(old=>({...old,questions:old.questions.filter((_,i)=>i!==index)}))}>
                 <Trash2 size={16}/>
               </button>
             </div>
           </div>
           <div className="admin-form-stack">
             <label>Stable question ID
               <input value={q.id} maxLength={41}
                 onChange={e=>edit(index,{id:e.target.value.toLowerCase()})}/></label>
             <label>Question text
               <textarea rows={3} value={q.prompt} maxLength={500}
                 onChange={e=>edit(index,{prompt:e.target.value})}/></label>
             {q.choices.map((option,oi)=><label key={oi}>Answer option {oi+1}
               <input value={option} maxLength={180}
                 onChange={e=>changeOption(index,oi,e.target.value)}/></label>)}
             <label>Correct answer (private)
               <select value={q.correctIndex}
                 onChange={e=>edit(index,{correctIndex:Number(e.target.value)})}>
                 {q.choices.map((opt,oi)=><option key={oi} value={oi}>Option {oi+1}: {opt.slice(0,65)}</option>)}
               </select></label>
             <label>Explanation (shown only after grading, if enabled)
               <textarea rows={3} value={q.explanation} maxLength={750}
                 onChange={e=>edit(index,{explanation:e.target.value})}/></label>
           </div>
         </article>)}
       </div>
       <button type="button" className="btn btn-outline" disabled={full}
         onClick={()=>setDraft(old=>({...old,questions:[...old.questions,nextAuthoredQuestion(old)]}))}>
         <Plus size={16}/> Add question ({draft.questions.length}/10)
       </button>
     </fieldset>
     <AdminReviewRequest module="assessments" contentId={assessmentId} revision={current?.revision??0} changed={changed} role={role}/>
     <div className="sx-admin-anchor"><a href="#admin-save-actions">Jump to save & publish ↓</a></div>
     <details className="sx-admin-preview"><summary><span>Preview current editor content</span><small>{Boolean(current?.published_version)?"Published version exists · preview shows edits":"Not yet published"}</small></summary><div className="admin-editor-preview">
       <span className="admin-eyebrow">CURRENT EDITOR CONTENT · {Boolean(current?.published_version)?"A published version also exists":"Not yet published"}</span>
       <h3>{target.title}</h3>
       <ol>{draft.questions.map((q,i)=><li key={q.id+"-"+i}>
         <strong>{q.prompt}</strong>
         <span> · {q.choices.join(" / ")}</span>
       </li>)}</ol>
     </div></details>
     {!validation.success?<p className="auth-error" role="alert">
       {validation.error.issues[0]?.message??"Bank draft is invalid."}</p>:null}
     {error?<p className="auth-error" role="alert">{error}</p>:null}
     {notice?<ActionSuccess>{notice}</ActionSuccess>:null}
     <div id="admin-save-actions" className="admin-editor-actions">
       <span role="status" aria-live="polite">{changed?"Unsaved changes":"No unsaved edits"} · {full?"10 questions ready":"Complete ten questions to publish"}</span>
       <button type="button" className="btn btn-outline" disabled={disabled||!validation.success}
         onClick={()=>void save(false)}><Save size={16}/>{saving==="draft"?"Saving…":"Save draft"}</button>
       <button type="button" className="btn btn-primary"
         disabled={disabled||role!=="owner"||!publishValidation.success}
         onClick={()=>void save(true)}><Send size={16}/>{saving==="publish"?"Publishing…":"Publish new version"}</button>
     </div>
   </section>
 </div>;
}
