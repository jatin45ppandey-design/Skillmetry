"use client";
import {AdminReviewRequest} from "@/components/admin-editorial-reviews";
import {useEffect,useState} from "react";
import {ArrowDown,ArrowUp,History,Save,Send,ShieldCheck} from "lucide-react";
import {careers,skillById} from "@skillmetry/shared/data/catalog";
import {defaultEditorialRoadmap,saveEditorialRoadmapSchema,
 type EditorialRoadmapPayload,type EditorialRoadmapRow} from "@skillmetry/shared/lib/admin-roadmaps";
import {ActivityIndicator,ActionSuccess} from "@/components/motion-ui";
type Role="owner"|"editor"|"reviewer";
function currentPayload(id:string,rows:EditorialRoadmapRow[]){
 const row=rows.find(r=>r.career_id===id);
 return row?.draft??row?.published??defaultEditorialRoadmap(id);
}
export function AdminRoadmapEditor({role,onDirtyChange}:{role:Role;onDirtyChange?:(dirty:boolean)=>void}){
 const [careerId,setCareerId]=useState<string>(careers[0].id);
 const [rows,setRows]=useState<EditorialRoadmapRow[]>([]);
 const [draft,setDraft]=useState<EditorialRoadmapPayload>(()=>defaultEditorialRoadmap(careers[0].id));
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState<"save"|"publish"|null>(null);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [history,setHistory]=useState<{revision:number;action:string;created_at:string}[]>([]);
 const selected=careers.find(c=>c.id===careerId)!;
 const stored=rows.find(r=>r.career_id===careerId);
 const revision=stored?.revision??0;
 const changed=JSON.stringify(draft)!==JSON.stringify(currentPayload(careerId,rows));
 const valid=saveEditorialRoadmapSchema.safeParse({careerId,draft,expectedRevision:revision,publish:false});
 useEffect(()=>{onDirtyChange?.(changed);},[changed,onDirtyChange]);
 useEffect(()=>{
   const controller=new AbortController();
   void (async()=>{
    try{
      const res=await fetch("/api/admin/roadmaps",{cache:"no-store",signal:controller.signal});
      if(!res.ok)throw new Error("Could not load roadmap content.");
      const data=await res.json() as {roadmaps:EditorialRoadmapRow[]};
      if(!controller.signal.aborted){setRows(data.roadmaps);setDraft(currentPayload(careers[0].id,data.roadmaps));}
    }catch{if(!controller.signal.aborted)setError("Roadmaps are not yet available. Check the staged database migration.");}
    finally{if(!controller.signal.aborted)setLoading(false);}
   })();
   return()=>controller.abort();
 },[]);
 useEffect(()=>{
   const controller=new AbortController();
   void (async()=>{
    try{
      const res=await fetch("/api/admin/roadmaps/history?career="+encodeURIComponent(careerId),
        {cache:"no-store",signal:controller.signal});
      if(res.ok){const data=await res.json() as {history:typeof history};
       if(!controller.signal.aborted)setHistory(data.history);}
    }catch{/* History is supplementary. */}
   })();
   return()=>controller.abort();
 },[careerId,stored?.revision]);
 function changeCareer(id:string){
   if(changed&&!window.confirm("Discard unsaved roadmap edits?"))return;
   setCareerId(id);setDraft(currentPayload(id,rows));setMessage("");setError("");setHistory([]);
 }
 function changeStep(skillId:string,field:"explanation"|"task",value:string){
   setDraft(d=>({...d,steps:d.steps.map(s=>s.skillId===skillId?{...s,[field]:value}:s)}));
   setMessage("");
 }
 function move(index:number,direction:-1|1){
   const next=index+direction;
   if(next<0||next>=draft.steps.length)return;
   const steps=[...draft.steps];
   [steps[index],steps[next]]=[steps[next],steps[index]];
   setDraft(d=>({...d,steps}));setMessage("");
 }
 async function save(publish:boolean){
   if(saving||loading||role==="reviewer"||(publish&&role!=="owner"))return;
   if(!valid.success){setError(valid.error.issues[0]?.message??"Check skill ordering.");return;}
   if(publish&&!window.confirm("Publish this career study sequence to students?"))return;
   setSaving(publish?"publish":"save");setError("");setMessage("");
   try{
     const res=await fetch("/api/admin/roadmaps",{method:"PUT",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({careerId,draft,expectedRevision:revision,publish})});
     const body=await res.json() as {result?:{revision:number;publishedRevision:number};error?:string};
     if(!res.ok||!body.result)throw new Error(body.error??"Roadmap could not be saved.");
     setRows(prev=>[...prev.filter(r=>r.career_id!==careerId),{
       career_id:careerId,draft,published:publish?draft:stored?.published??null,
       revision:body.result!.revision,published_revision:body.result!.publishedRevision,
       updated_at:new Date().toISOString(),
       published_at:publish?new Date().toISOString():stored?.published_at??null
     }]);
     setMessage(publish?"Published roadmap now appears on students' career pathway.":"Roadmap draft saved privately.");
   }catch(e){setError(e instanceof Error?e.message:"Save failed.");}
   finally{setSaving(null);}
 }
 return <div className="admin-editor-grid">
   <aside className="admin-skill-panel">
     <label htmlFor="admin-roadmap-career">Career path</label>
     <select id="admin-roadmap-career" value={careerId} disabled={loading||!!saving}
       onChange={e=>changeCareer(e.target.value)}>
       {careers.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
     </select>
     <div className="admin-guide-state"><span><ShieldCheck size={15}/> {role.toUpperCase()} ACCESS</span>
       <strong>{stored?.published?"Published study sequence":"Canonical pathway active"}</strong>
       <small>Revision {revision} · Published {stored?.published_revision??0}</small>
       <small>Skill weights, quiz scores and prerequisite graph stay unchanged.</small>
     </div>
     <details className="admin-history" hidden={!history.length}><summary>Revision history · {history.length} entries</summary><h3><History size={16}/> Roadmap history</h3>
       {history.map(x=><p key={x.revision}>v{x.revision} · {x.action} · {new Date(x.created_at).toLocaleString()}</p>)}
       {!history.length?<p>No published or saved roadmap versions yet.</p>:null}
     </details>
   </aside>
   <section className="admin-editor-main">
     <div className="admin-editor-heading"><span className="admin-eyebrow">CAREER / STUDY SEQUENCE</span>
       <h2>Edit {selected.title} pathway</h2>
       <p>Write a helpful summary, reorder steps and give each step a practical action. All career skills must remain included.</p>
     </div>
     {loading?<ActivityIndicator label="Loading roadmap drafts…"/>:null}
     <fieldset className="admin-editor-fields admin-roadmap-fields" disabled={loading||!!saving||role==="reviewer"}>
       <div className="admin-form-stack">
         <label>Pathway headline<input value={draft.headline} maxLength={120}
           onChange={e=>setDraft(d=>({...d,headline:e.target.value}))}/></label>
         <label>Introduction<textarea rows={3} value={draft.introduction} maxLength={700}
           onChange={e=>setDraft(d=>({...d,introduction:e.target.value}))}/></label>
       </div>
       <div className="admin-roadmap-steps">
         {draft.steps.map((step,index)=><article key={step.skillId} className="admin-roadmap-step">
           <header><strong>{index+1}. {skillById[step.skillId]?.label??step.skillId}</strong>
             <div className="admin-step-order">
               <button type="button" title="Move up" aria-label={"Move "+step.skillId+" up"} disabled={index===0}
                 onClick={()=>move(index,-1)}><ArrowUp size={17}/></button>
               <button type="button" title="Move down" aria-label={"Move "+step.skillId+" down"}
                 disabled={index===draft.steps.length-1} onClick={()=>move(index,1)}><ArrowDown size={17}/></button>
             </div>
           </header>
           <label>Why this step matters<textarea rows={2} value={step.explanation} maxLength={400}
             onChange={e=>changeStep(step.skillId,"explanation",e.target.value)}/></label>
           <label>What to build or practise<textarea rows={2} value={step.task} maxLength={450}
             onChange={e=>changeStep(step.skillId,"task",e.target.value)}/></label>
         </article>)}
       </div>
     </fieldset>
     <AdminReviewRequest module="roadmaps" contentId={careerId} revision={revision} changed={changed} role={role}/>
     <div className="sx-admin-anchor"><a href="#admin-save-actions">Jump to save & publish ↓</a></div>
     <details className="sx-admin-preview"><summary><span>Preview current editor content</span><small>{Boolean(stored?.published)?"Published version exists · preview shows edits":"Not yet published"}</small></summary><div className="admin-editor-preview">
       <span className="admin-eyebrow">CURRENT EDITOR CONTENT · {Boolean(stored?.published)?"A published version also exists":"Not yet published"}</span>
       <h3>{draft.headline}</h3><p>{draft.introduction}</p>
       <ol>{draft.steps.slice(0,4).map(s=><li key={s.skillId}><strong>{skillById[s.skillId].label}:</strong> {s.task}</li>)}</ol>
     </div></details>
     {!valid.success?<p role="alert" className="auth-error">
       {valid.error.issues[0]?.message??"Please check the roadmap structure."}</p>:null}
     {error?<p role="alert" className="auth-error">{error}</p>:null}
     {message?<ActionSuccess>{message}</ActionSuccess>:null}
     <div id="admin-save-actions" className="admin-editor-actions"><span role="status" aria-live="polite">{changed?"Unsaved changes":"No unsaved edits"} · {valid.success?"Sequence valid":"Fix prerequisite order"}</span>
       <button type="button" className="btn btn-outline" disabled={loading||!!saving||role==="reviewer"||!valid.success}
         onClick={()=>void save(false)}><Save size={16}/>{saving==="save"?"Saving…":"Save draft"}</button>
       <button type="button" className="btn btn-primary" disabled={loading||!!saving||role!=="owner"||!valid.success}
         onClick={()=>void save(true)}><Send size={16}/>{saving==="publish"?"Publishing…":"Publish roadmap"}</button>
     </div>
   </section>
 </div>;
}
