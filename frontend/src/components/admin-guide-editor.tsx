"use client";
import {AdminReviewRequest} from "@/components/admin-editorial-reviews";
import {useEffect,useMemo,useState} from "react";
import {BookOpen,FileText,History,PlayCircle,Save,Send,ShieldCheck} from "lucide-react";
import {skills} from "@skillmetry/shared/data/catalog";
import {skillLearningGuides} from "@skillmetry/shared/data/skill-learning-guides";
import {adminGuidePayloadSchema,type AdminGuidePayload,type AdminGuideRow} from "@skillmetry/shared/lib/admin-content";
import {ActivityIndicator,ActionSuccess} from "@/components/motion-ui";
type EditorialRow=AdminGuideRow;
type Role="owner"|"editor"|"reviewer";
function originalPayload(skillId:string,rows:EditorialRow[]):AdminGuidePayload{
 const row=rows.find(item=>item.skill_id===skillId);
 const original=skillLearningGuides[skillId];
 return row?.draft??row?.published??{
   documentation:{...original.documentation},lecture:{...original.lecture},
   notes:[...original.notes],challenge:original.challenge
 };
}
export function AdminGuideEditor({role,onDirtyChange}:{role:Role;onDirtyChange?:(dirty:boolean)=>void}){
 const [selected,setSelected]=useState("javascript");
 const [rows,setRows]=useState<EditorialRow[]>([]);
 const [draft,setDraft]=useState<AdminGuidePayload>(()=>originalPayload("javascript",[]));
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState<"draft"|"publish"|null>(null);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [history,setHistory]=useState<{revision:number;action:string;created_at:string}[]>([]);
 const [tab,setTab]=useState<"docs"|"video"|"notes">("docs");
 const current=rows.find(row=>row.skill_id===selected);
 const revision=current?.revision??0;
 const changed=JSON.stringify(draft)!==JSON.stringify(originalPayload(selected,rows));
 const valid=adminGuidePayloadSchema.safeParse(draft).success;
 useEffect(()=>{onDirtyChange?.(changed);},[changed,onDirtyChange]);
 const publishReady=role==="owner"&&valid&&!saving;
 const lastUpdated=useMemo(()=>current?.updated_at?new Date(current.updated_at).toLocaleString():null,[current?.updated_at]);

 useEffect(()=>{
   const abort=new AbortController();
   void (async()=>{
     setLoading(true);
     try{
       const response=await fetch("/api/admin/guides",{signal:abort.signal,cache:"no-store"});
       if(!response.ok)throw new Error("Unable to load your content.");
       const data=await response.json() as {guides:EditorialRow[]};
       if(!abort.signal.aborted){
         const clean=data.guides.filter(item=>skills.some(skill=>skill.id===item.skill_id));
         setRows(clean);
         setDraft(originalPayload("javascript",clean));
       }
     }catch{if(!abort.signal.aborted)setError("Guide library could not be loaded. Refresh when available.");}
     finally{if(!abort.signal.aborted)setLoading(false);}
   })();
   return()=>abort.abort();
 },[]);
 useEffect(()=>{
   if(!current)return;
   const abort=new AbortController();
   void (async()=>{
     try{
       const response=await fetch("/api/admin/guides/history?skill="+encodeURIComponent(selected),
         {cache:"no-store",signal:abort.signal});
       if(response.ok){const result=await response.json() as {history:typeof history};
         if(!abort.signal.aborted)setHistory(result.history);}
     }catch{/* History is supplementary; editing still works. */}
   })();
   return()=>abort.abort();
 },[selected,current?.revision]);
 function changeSkill(value:string){
   if(changed&&!window.confirm("Discard unsaved edits for this skill?"))return;
   setSelected(value);setDraft(originalPayload(value,rows));setMessage("");setError("");setHistory([]);setTab("docs");
 }
 function updateDoc(key:"title"|"url",value:string){
   setDraft(old=>({...old,documentation:{...old.documentation,[key]:value}}));setMessage("");
 }
 function updateLecture(key:"title"|"url"|"format",value:string){
   setDraft(old=>({...old,lecture:{...old.lecture,[key]:value}}));setMessage("");
 }
 async function save(publish:boolean){
   if(saving||loading||role==="reviewer")return;
   if(publish&&role!=="owner")return;
   if(!valid){setError("Complete the documentation URL, lecture, three notes and practice task.");return;}
   if(publish&&!window.confirm("Publish this guide to the student Resources page?"))return;
   setSaving(publish?"publish":"draft");setError("");setMessage("");
   try{
     const response=await fetch("/api/admin/guides",{
       method:"PUT",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({skillId:selected,draft,expectedRevision:revision,publish})
     });
     const result=await response.json();
     if(!response.ok)throw new Error(result.error??"Saving failed.");
     const updated:EditorialRow={
       skill_id:selected,draft,published:publish?draft:current?.published??null,
       revision:result.result.revision,published_revision:result.result.publishedRevision,
       updated_at:new Date().toISOString(),published_at:publish?new Date().toISOString():current?.published_at??null
     };
     setRows(old=>[...old.filter(row=>row.skill_id!==selected),updated]);
     setMessage(publish?"Published! Students can now see this guide.":"Draft saved privately.");
   }catch(e){setError(e instanceof Error?e.message:"Could not save. Try again.");}
   finally{setSaving(null);}
 }
 return <div className="admin-editor-grid">
   <aside className="admin-skill-panel">
     <label htmlFor="admin-skill-select">Select curriculum skill</label>
     <select id="admin-skill-select" value={selected} onChange={e=>changeSkill(e.target.value)}
       disabled={loading||Boolean(saving)}>
       {skills.map(skill=><option value={skill.id} key={skill.id}>{skill.label}</option>)}
     </select>
     <div className="admin-guide-state">
       <span><ShieldCheck size={15}/> {role.toUpperCase()} ACCESS</span>
       <strong>{current?.published?"Published guide":"Curated fallback active"}</strong>
       <small>Revision {revision} · Published revision {current?.published_revision??0}</small>
       {lastUpdated?<small>Updated {lastUpdated}</small>:null}
     </div>
     <details className="admin-history" hidden={!history.length}><summary>Revision history · {history.length} entries</summary><h3><History size={16}/> Recent changes</h3>
       {history.length?history.map(item=><p key={item.revision}>
         <strong>v{item.revision}</strong> {item.action} · {new Date(item.created_at).toLocaleString()}
       </p>):<p>No saved versions for this skill yet.</p>}
     </details>
   </aside>
   <section className="admin-editor-main" aria-labelledby="admin-edit-heading">
     <div className="admin-editor-heading">
       <div><span className="admin-eyebrow">ONE SKILL / THREE LEARNING FORMATS</span>
         <h2 id="admin-edit-heading">Edit {skills.find(s=>s.id===selected)?.label} content</h2>
         <p>Save a private draft for review, or publish a valid version directly as an owner.</p></div>
     </div>
     {loading?<ActivityIndicator label="Loading private admin content…"/>:null}
     <div className="admin-editor-tabs" role="group" aria-label="Content type">
       {([{id:"docs",icon:BookOpen,label:"Documentation"},{id:"video",icon:PlayCircle,label:"Video lectures"},
          {id:"notes",icon:FileText,label:"Notes & practice"}] as const).map(item=>{
         const Icon=item.icon;return <button type="button" aria-pressed={tab===item.id}
           className={tab===item.id?"is-active":""} key={item.id} onClick={()=>setTab(item.id)}>
           <Icon size={18}/>{item.label}</button>;
       })}
     </div>
     <fieldset disabled={loading||Boolean(saving)||role==="reviewer"} className="admin-editor-fields">
       {tab==="docs"?<div className="admin-form-stack">
         <label>Documentation title<input value={draft.documentation.title}
           onChange={e=>updateDoc("title",e.target.value)} maxLength={150}/></label>
         <label>Official documentation URL<input type="url" value={draft.documentation.url}
           onChange={e=>updateDoc("url",e.target.value)} maxLength={700}/></label>
         <small>Use a direct HTTPS link to reliable documentation. No embed code or HTML.</small>
       </div>:tab==="video"?<div className="admin-form-stack">
         <label>Video/course title<input value={draft.lecture.title}
           onChange={e=>updateLecture("title",e.target.value)} maxLength={150}/></label>
         <label>Video/course HTTPS URL<input type="url" value={draft.lecture.url}
           onChange={e=>updateLecture("url",e.target.value)} maxLength={700}/></label>
         <label>Format<select value={draft.lecture.format}
           onChange={e=>updateLecture("format",e.target.value)}>
           <option value="video">Video lecture</option><option value="course-with-video">Course with videos</option>
           <option value="interactive-course">Interactive course</option></select></label>
       </div>:<div className="admin-form-stack">
         <label>Revision notes (one point per line)<textarea rows={8}
           value={draft.notes.join("\n")} onChange={e=>setDraft(old=>({...old,notes:e.target.value.split("\n")}))}/></label>
         <small>3–12 notes. Concise Skillmetry-written explanations; do not paste copyrighted course text.</small>
         <label>Practical next challenge<textarea rows={3} value={draft.challenge} maxLength={700}
           onChange={e=>setDraft(old=>({...old,challenge:e.target.value}))}/></label>
       </div>}
     </fieldset>
     <AdminReviewRequest module="guides" contentId={selected} revision={revision} changed={changed} role={role}/>
     <div className="sx-admin-anchor"><a href="#admin-save-actions">Jump to save & publish ↓</a></div>
     <details className="sx-admin-preview"><summary><span>Preview current editor content</span><small>{Boolean(current?.published)?"Published version exists · preview shows edits":"Not yet published"}</small></summary><div className="admin-editor-preview">
       <span className="admin-eyebrow">CURRENT EDITOR CONTENT · {Boolean(current?.published)?"A published version also exists":"Not yet published"}</span>
       <h3>{skills.find(s=>s.id===selected)?.label}</h3>
       <p><strong>Docs:</strong> {draft.documentation.title}</p>
       <p><strong>Lecture:</strong> {draft.lecture.title}</p>
       <ul>{draft.notes.filter(Boolean).slice(0,4).map(note=><li key={note}>{note}</li>)}</ul>
       <p><strong>Try this:</strong> {draft.challenge}</p>
     </div></details>
     {error?<p role="alert" className="auth-error">{error}</p>:null}
     {message?<ActionSuccess>{message}</ActionSuccess>:null}
     <div id="admin-save-actions" className="admin-editor-actions">
       <span role="status" aria-live="polite">{changed?"Unsaved changes":"No unsaved edits"} · {valid?"Ready for review":"Complete required fields"}</span>
       <button className="btn btn-outline" type="button" disabled={loading||Boolean(saving)||role==="reviewer"||!valid}
         onClick={()=>void save(false)}><Save size={17}/>{saving==="draft"?"Saving…":"Save draft"}</button>
       <button className="btn btn-primary" type="button" disabled={!publishReady}
         onClick={()=>void save(true)}><Send size={17}/>{saving==="publish"?"Publishing…":"Publish guide"}</button>
     </div>
   </section>
 </div>;
}
