"use client";
import {AdminReviewRequest} from "@/components/admin-editorial-reviews";
import {useEffect,useState} from "react";
import {ClipboardList,Plus,Save,Send,Trash2,ArrowUp,ArrowDown} from "lucide-react";
import {careers,skillById} from "@skillmetry/shared/data/catalog";
import {
  saveAdminMissionSchema,startingAdminMission,
  type AdminMissionPayload,type AdminMissionRow
} from "@skillmetry/shared/lib/admin-missions";
import {ActivityIndicator,ActionSuccess} from "@/components/motion-ui";

type Role="owner"|"editor"|"reviewer";
const initialCareer=careers[0];
const initialSkill=initialCareer.skills[0].skillId;

export function AdminMissionEditor({role,onDirtyChange}:{role:Role;onDirtyChange?:(dirty:boolean)=>void}){
 const [rows,setRows]=useState<AdminMissionRow[]>([]);
 const [id,setId]=useState("cms-new-project");
 const [careerId,setCareerId]=useState(initialCareer.id as string);
 const [skillId,setSkillId]=useState(initialSkill);
 const [draft,setDraft]=useState<AdminMissionPayload>(()=>startingAdminMission(initialCareer.title));
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState<"draft"|"publish"|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [history,setHistory]=useState<{revision:number;action:string;created_at:string}[]>([]);
 const current=rows.find(row=>row.id===id);
 const career=careers.find(item=>item.id===careerId)??initialCareer;
 const originalDraft=current?.draft??current?.published??startingAdminMission(career.title);
 const changed=JSON.stringify(draft)!==JSON.stringify(originalDraft) ||
   Boolean(current&&(current.career_id!==careerId||current.skill_id!==skillId));
 const valid=saveAdminMissionSchema.safeParse({id,careerId,skillId,expectedRevision:current?.revision??0,publish:false,draft});
 const lockedChecklist=Boolean(current?.published);

 useEffect(()=>{
   onDirtyChange?.(changed);
 },[changed,onDirtyChange]);
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
       const response=await fetch("/api/admin/missions",{cache:"no-store",signal:controller.signal});
       if(!response.ok)throw new Error("Mission Builder is not activated.");
       const body=await response.json() as {missions:AdminMissionRow[]};
       if(!controller.signal.aborted){
         setRows(body.missions);
         if(body.missions.length){
           const first=body.missions[0];
           setId(first.id);setCareerId(first.career_id);setSkillId(first.skill_id);
           setDraft(first.draft??first.published??startingAdminMission(
             careers.find(c=>c.id===first.career_id)?.title??"Career"));
         }
       }
     }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Cannot load missions.");}
     finally{if(!controller.signal.aborted)setLoading(false);}
   })();
   return()=>controller.abort();
 },[]);
 useEffect(()=>{
   const controller=new AbortController();
   setHistory([]);
   if(!current)return;
   void (async()=>{
     try{
       const response=await fetch("/api/admin/missions/history?id="+encodeURIComponent(id),
         {cache:"no-store",signal:controller.signal});
       if(response.ok){
         const data=await response.json() as {history:typeof history};
         if(!controller.signal.aborted)setHistory(data.history);
       }
     }catch{/* Version history is supplementary. */}
   })();
   return()=>controller.abort();
 },[id,current?.revision]);
 function choose(row:AdminMissionRow){
   if(changed&&!window.confirm("Discard unsaved mission edits?"))return;
   setId(row.id);setCareerId(row.career_id);setSkillId(row.skill_id);
   setDraft(row.draft??row.published??startingAdminMission(
     careers.find(c=>c.id===row.career_id)?.title??"Career"));
   setError("");setNotice("");
 }
 function newMission(){
   if(changed&&!window.confirm("Discard unsaved mission edits?"))return;
   let next="cms-new-project",n=2;
   while(rows.some(row=>row.id===next)){next="cms-new-project-"+n;n++;}
   setId(next);setDraft(startingAdminMission(career.title));setError("");setNotice("");
 }
 function changeCareer(value:string){
   const next=careers.find(item=>item.id===value);if(!next||value===careerId)return;
   if(changed&&!window.confirm("Changing careers resets the current draft. Discard unsaved mission edits?"))return;
   setCareerId(next.id);setSkillId(next.skills[0].skillId);
   setDraft(startingAdminMission(next.title));setNotice("");
 }
 function editChecklist(index:number,text:string){
   setDraft(old=>({...old,deliverables:old.deliverables.map((item,i)=>i===index?text:item)}));
   setNotice("");
 }
 function moveChecklist(index:number,direction:-1|1){
   setDraft(old=>{
     const next=[...old.deliverables];
     const other=index+direction;
     if(other<0||other>=next.length)return old;
     [next[index],next[other]]=[next[other],next[index]];
     return {...old,deliverables:next};
   });
 }
 async function save(publish:boolean){
   if(loading||saving||role==="reviewer"||(publish&&role!=="owner"))return;
   if(!valid.success){setError(valid.error.issues[0]?.message??"Complete mission fields.");return;}
   if(publish&&!window.confirm("Publish this mission for students? Its checklist will then be locked."))return;
   setSaving(publish?"publish":"draft");setError("");setNotice("");
   try{
     const response=await fetch("/api/admin/missions",{
       method:"PUT",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({id,careerId,skillId,expectedRevision:current?.revision??0,draft,publish})
     });
     const result=await response.json() as {error?:string;result?:{revision:number;publishedRevision:number}};
     if(!response.ok||!result.result)throw new Error(result.error??"Mission not saved.");
     setRows(old=>[...old.filter(item=>item.id!==id),{
       id,career_id:careerId,skill_id:skillId,draft,
       published:publish?draft:current?.published??null,
       revision:result.result!.revision,published_revision:result.result!.publishedRevision,
       updated_at:new Date().toISOString(),
       published_at:publish?new Date().toISOString():current?.published_at??null
     }]);
     setNotice(publish?"Mission published to student projects.":"Private mission draft saved.");
   }catch(e){setError(e instanceof Error?e.message:"Unable to save mission.");}
   finally{setSaving(null);}
 }
 return <div className="admin-editor-grid">
   <aside className="admin-skill-panel">
     <label htmlFor="admin-mission-list">Saved missions</label>
     <select id="admin-mission-list" value={current?.id??""} disabled={loading||!!saving}
       onChange={e=>{const selected=rows.find(row=>row.id===e.target.value);if(selected)choose(selected);}}>
       <option value="">New mission</option>
       {rows.map(row=><option key={row.id} value={row.id}>
         {row.draft?.title??row.published?.title??row.id}</option>)}
     </select>
     <button type="button" className="btn btn-outline" disabled={loading||!!saving||role==="reviewer"} onClick={newMission}>
       <Plus size={16}/> New mission</button>
     <div className="admin-guide-state">
       <strong>{current?.published?"Published mission":"Draft / new mission"}</strong>
       <small>Revision {current?.revision??0} · Published {current?.published_revision??0}</small>
       {lockedChecklist?<small>Published checklist is locked to protect saved student progress.</small>:null}
     </div>
     <details className="admin-history" hidden={!history.length}><summary>Revision history · {history.length} entries</summary><h3>Revision history</h3>
       {history.length?history.map(item=><p key={item.revision}>v{item.revision} · {item.action} · {new Date(item.created_at).toLocaleString()}</p>):
         <p>No saved revisions yet.</p>}
     </details>
   </aside>
   <section className="admin-editor-main">
     <div className="admin-editor-heading">
       <span className="admin-eyebrow">MISSION / PROJECT BUILDER</span>
       <h2><ClipboardList size={21} aria-hidden="true"/> Create practical student projects</h2>
       <p>Set a clear project brief and deliverables. Owner publication makes a mission available to learners, never as a graded result.</p>
     </div>
     {loading?<ActivityIndicator label="Loading mission drafts…"/>:null}
     <fieldset className="admin-editor-fields admin-course-fields" disabled={loading||!!saving||role==="reviewer"}>
       <div className="admin-form-stack">
         <label>Mission ID (permanent after save)
           <input value={id} readOnly={Boolean(current)} maxLength={60}
             onChange={e=>setId(e.target.value.toLowerCase())}/></label>
         <small>Start with cms- and use lowercase letters, numbers or hyphens.</small>
         <label>Career
           <select value={careerId} disabled={Boolean(current)} onChange={e=>changeCareer(e.target.value)}>
             {careers.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
         <label>Primary skill
           <select value={skillId} disabled={Boolean(current)} onChange={e=>setSkillId(e.target.value)}>
             {career.skills.map(s=><option value={s.skillId} key={s.skillId}>
               {skillById[s.skillId]?.label??s.skillId}</option>)}</select></label>
         <label>Project title
           <input value={draft.title} maxLength={130}
             onChange={e=>setDraft(p=>({...p,title:e.target.value}))}/></label>
         <label>Project brief
           <textarea rows={4} maxLength={800} value={draft.description}
             onChange={e=>setDraft(p=>({...p,description:e.target.value}))}/></label>
         <label>Estimated hours
           <input type="number" min={1} max={80} value={draft.estimatedHours}
             onChange={e=>setDraft(p=>({...p,estimatedHours:Number(e.target.value)}))}/></label>
       </div>
       <div className="admin-course-modules">
         <article className="admin-course-module">
           <div className="admin-course-module-header"><h3>Project acceptance checklist</h3>
             <small>{draft.deliverables.length}/12</small></div>
           {lockedChecklist?<p className="note">This mission is already published. To modify its deliverables, create a new mission ID and publish a new version.</p>:null}
           {draft.deliverables.map((item,index)=><div className="admin-course-lesson" key={index}>
             <label>Deliverable {index+1}<input value={item} maxLength={180} readOnly={lockedChecklist}
               onChange={e=>editChecklist(index,e.target.value)}/></label>
             <div className="admin-step-order">
               <button type="button" aria-label={"Move deliverable "+(index+1)+" up"}
                 disabled={lockedChecklist||index===0} onClick={()=>moveChecklist(index,-1)}><ArrowUp size={16}/></button>
               <button type="button" aria-label={"Move deliverable "+(index+1)+" down"}
                 disabled={lockedChecklist||index===draft.deliverables.length-1}
                 onClick={()=>moveChecklist(index,1)}><ArrowDown size={16}/></button>
               <button type="button" aria-label={"Remove deliverable "+(index+1)}
                 disabled={lockedChecklist||draft.deliverables.length===1}
                 onClick={()=>setDraft(p=>({...p,deliverables:p.deliverables.filter((_,i)=>i!==index)}))}>
                 <Trash2 size={16}/></button>
             </div>
           </div>)}
           <button className="btn btn-outline" type="button"
             disabled={lockedChecklist||draft.deliverables.length>=12}
             onClick={()=>setDraft(p=>({...p,deliverables:[...p.deliverables,"Describe a verifiable project deliverable"]}))}>
             <Plus size={16}/> Add deliverable</button>
         </article>
       </div>
     </fieldset>
     <AdminReviewRequest module="missions" contentId={id} revision={current?.revision??0} changed={changed} role={role}/>
     <div className="sx-admin-anchor"><a href="#admin-save-actions">Jump to save & publish ↓</a></div>
     <details className="sx-admin-preview"><summary><span>Preview current editor content</span><small>{Boolean(current?.published)?"Published version exists · preview shows edits":"Not yet published"}</small></summary><div className="admin-editor-preview">
       <span className="admin-eyebrow">CURRENT EDITOR CONTENT · {Boolean(current?.published)?"A published version also exists":"Not yet published"}</span>
       <h3>{draft.title}</h3><p>{draft.description}</p>
       <p><strong>{career.title}</strong> · {skillById[skillId]?.label??skillId} · {draft.estimatedHours} hours</p>
       <ol>{draft.deliverables.map((item,i)=><li key={i}>{item}</li>)}</ol>
     </div></details>
     {!valid.success?<p className="auth-error" role="alert">{valid.error.issues[0]?.message??"Complete required details."}</p>:null}
     {error?<p className="auth-error" role="alert">{error}</p>:null}
     {notice?<ActionSuccess>{notice}</ActionSuccess>:null}
     <div id="admin-save-actions" className="admin-editor-actions">
       <span role="status" aria-live="polite">{changed?"Unsaved changes":"No unsaved edits"} · {valid.success?"Ready for review":"Validation needed"}</span>
       <button type="button" className="btn btn-outline" disabled={loading||!!saving||role==="reviewer"||!valid.success}
         onClick={()=>void save(false)}><Save size={16}/>{saving==="draft"?"Saving…":"Save draft"}</button>
       <button type="button" className="btn btn-primary" disabled={loading||!!saving||role!=="owner"||!valid.success}
         onClick={()=>void save(true)}><Send size={16}/>{saving==="publish"?"Publishing…":"Publish mission"}</button>
     </div>
   </section>
 </div>;
}
