"use client";
import {useEffect,useState} from "react";
import {BookOpen,Plus,Save,Send,Trash2} from "lucide-react";
import {skills,skillById} from "@skillmetry/shared/data/catalog";
import {coursePayloadSchema,courseSlugSchema,startingCourse,type CoursePayload,type CourseRow} from "@skillmetry/shared/lib/admin-courses";
import {ActionSuccess,ActivityIndicator} from "@/components/motion-ui";
type Role="owner"|"editor"|"reviewer";
type Lesson=CoursePayload["modules"][number]["lessons"][number];
export function AdminCourseEditor({role,onDirtyChange}:{role:Role;onDirtyChange?:(dirty:boolean)=>void}){
 const [rows,setRows]=useState<CourseRow[]>([]);
 const [slug,setSlug]=useState("javascript-foundations");
 const [skillId,setSkillId]=useState("javascript");
 const [draft,setDraft]=useState<CoursePayload>(()=>startingCourse("JavaScript"));
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState<"draft"|"publish"|null>(null);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [history,setHistory]=useState<{revision:number;action:string;created_at:string}[]>([]);
 const original=rows.find(row=>row.slug===slug);
 const changed=JSON.stringify(draft)!==JSON.stringify(original?.draft??original?.published??startingCourse(skillById[skillId]?.label??skillId));
 const valid=coursePayloadSchema.safeParse(draft);
 useEffect(()=>{onDirtyChange?.(changed);},[changed,onDirtyChange]);
 const totalLessons=draft.modules.reduce((n,m)=>n+m.lessons.length,0);
 useEffect(()=>{
   const controller=new AbortController();
   void (async()=>{
     try{
       const response=await fetch("/api/admin/courses",{cache:"no-store",signal:controller.signal});
       if(!response.ok)throw new Error();
       const result=await response.json() as {courses:CourseRow[]};
       if(!controller.signal.aborted){
         setRows(result.courses);
         if(result.courses.length){
           const first=result.courses[0];setSlug(first.slug);setSkillId(first.skill_id);
           setDraft(first.draft??first.published??startingCourse(skillById[first.skill_id]?.label??first.skill_id));
         }
       }
     }catch{if(!controller.signal.aborted)setError("Course editor database is not ready yet.");}
     finally{if(!controller.signal.aborted)setLoading(false);}
   })();
   return()=>controller.abort();
 },[]);
 useEffect(()=>{
   const controller=new AbortController();
   setHistory([]);
   if(!original)return;
   void (async()=>{
     try{
       const r=await fetch("/api/admin/courses/history?slug="+encodeURIComponent(slug),{cache:"no-store",signal:controller.signal});
       if(r.ok){const data=await r.json() as {history:typeof history};
         if(!controller.signal.aborted)setHistory(data.history);}
     }catch{/* Histories are supplementary. */}
   })();
   return()=>controller.abort();
 },[slug,original?.revision]);
 function choose(row:CourseRow){
   if(changed&&!window.confirm("Discard unsaved edits?"))return;
   setSlug(row.slug);setSkillId(row.skill_id);
   setDraft(row.draft??row.published??startingCourse(skillById[row.skill_id]?.label??row.skill_id));
   setError("");setMessage("");
 }
 function createNew(){
   if(changed&&!window.confirm("Discard unsaved edits?"))return;
   let candidate="new-"+skillId+"-course";
   let number=2;
   while(rows.some(r=>r.slug===candidate)){candidate="new-"+skillId+"-course-"+number;number++;}
   setSlug(candidate);setDraft(startingCourse(skillById[skillId]?.label??skillId));setError("");setMessage("");
 }
 function modifyModule(index:number,changes:Partial<CoursePayload["modules"][number]>){
   setDraft(d=>({...d,modules:d.modules.map((m,i)=>i===index?{...m,...changes}:m)}));setMessage("");
 }
 function modifyLesson(mi:number,li:number,changes:Partial<Lesson>){
   setDraft(d=>({...d,modules:d.modules.map((m,i)=>i===mi?{...m,
     lessons:m.lessons.map((l,j)=>j===li?{...l,...changes}:l)}:m)}));setMessage("");
 }
 function addModule(){
   if(draft.modules.length>=12||totalLessons>=50)return;
   const id="module-"+(draft.modules.length+1);
   const unique=draft.modules.some(m=>m.id===id)?"module-"+Date.now().toString(36):id;
   setDraft(d=>({...d,modules:[...d.modules,{id:unique,title:"New module",lessons:[{
     id:"first-lesson",title:"New lesson",summary:"Describe what the learner will understand in this lesson.",
     kind:"reading",notes:["Read and work through the example carefully."],
     task:"Build a small practical demonstration and explain your approach.",estimatedMinutes:20}]}]}));
 }
 function addLesson(mi:number){
   if(totalLessons>=50||draft.modules[mi].lessons.length>=16)return;
   const lessons=draft.modules[mi].lessons;
   const id="lesson-"+(lessons.length+1);
   const unique=lessons.some(l=>l.id===id)?"lesson-"+Date.now().toString(36):id;
   modifyModule(mi,{lessons:[...lessons,{id:unique,title:"New lesson",
     summary:"Explain the concept in a beginner-friendly, practical way.",
     kind:"reading",notes:["Understand the concept and work through an example."],
     task:"Implement a small task and verify what you learned.",estimatedMinutes:20}]});
 }
 async function save(publish:boolean){
   if(saving||loading||role==="reviewer"||publish&&role!=="owner")return;
   if(!courseSlugSchema.safeParse(slug).success||!valid.success){
     setError("Complete the course structure and use a lowercase course slug.");
     return;
   }
   if(publish&&!window.confirm("Publish this course and its lessons to students?"))return;
   setSaving(publish?"publish":"draft");setMessage("");setError("");
   try{
     const response=await fetch("/api/admin/courses",{method:"PUT",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({slug,skillId,expectedRevision:original?.revision??0,draft,publish})});
     const body=await response.json() as {error?:string;result?:{revision:number;publishedRevision:number}};
     if(!response.ok||!body.result)throw new Error(body.error??"Unable to save course.");
     setRows(rows=>[...rows.filter(r=>r.slug!==slug),{
       slug,skill_id:skillId,draft,published:publish?draft:original?.published??null,
       revision:body.result!.revision,published_revision:body.result!.publishedRevision,
       updated_at:new Date().toISOString(),published_at:publish?new Date().toISOString():original?.published_at??null
     }]);
     setMessage(publish?"Course is published in the student library.":"Private course draft saved.");
   }catch(e){setError(e instanceof Error?e.message:"Course not saved.");}
   finally{setSaving(null);}
 }
 return <div className="admin-editor-grid">
   <aside className="admin-skill-panel">
     <label htmlFor="course-library-select">Saved courses</label>
     <select id="course-library-select" value={original?.slug??""} disabled={loading||!!saving}
       onChange={e=>{const found=rows.find(r=>r.slug===e.target.value);if(found)choose(found);}}>
       <option value="">New course</option>
       {rows.map(r=><option key={r.slug} value={r.slug}>{r.draft?.title??r.published?.title??r.slug}</option>)}
     </select>
     <button type="button" className="btn btn-outline" disabled={loading||!!saving||role==="reviewer"}
       onClick={createNew}><Plus size={16}/> New course</button>
     <div className="admin-guide-state"><strong>{original?.published?"Published course":"Private draft / new course"}</strong>
       <small>Revision {original?.revision??0} · Published {original?.published_revision??0}</small>
       <small>{draft.modules.length} modules · {totalLessons} lessons</small></div>
     <details className="admin-history" hidden={!history.length}><summary>Revision history · {history.length} entries</summary><h3>Changes</h3>
       {history.length?history.map(x=><p key={x.revision}>v{x.revision} · {x.action} · {new Date(x.created_at).toLocaleString()}</p>):
         <p>No version history yet.</p>}</details>
   </aside>
   <section className="admin-editor-main">
     <div className="admin-editor-heading"><span className="admin-eyebrow">COURSE / LESSON BUILDER</span>
       <h2>Build a learning course</h2>
       <p>Add modules and lessons with external videos, notes and practical assignments. Owner publishes after review.</p>
     </div>
     {loading?<ActivityIndicator label="Loading course drafts…"/>:null}
     <fieldset className="admin-editor-fields admin-course-fields" disabled={loading||!!saving||role==="reviewer"}>
       <div className="admin-form-stack">
         <label>Course URL slug<input value={slug} readOnly={Boolean(original)}
           onChange={e=>setSlug(e.target.value.toLowerCase())} maxLength={50}/></label>
         <label>Primary skill<select value={skillId} disabled={Boolean(original)}
           onChange={e=>{setSkillId(e.target.value);setDraft(startingCourse(skillById[e.target.value]?.label??e.target.value));}}>
           {skills.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
         </select></label>
         <label>Course title<input value={draft.title} maxLength={130}
           onChange={e=>setDraft(d=>({...d,title:e.target.value}))}/></label>
         <label>Course introduction<textarea rows={3} value={draft.summary} maxLength={800}
           onChange={e=>setDraft(d=>({...d,summary:e.target.value}))}/></label>
       </div>
       <div className="admin-course-modules">{draft.modules.map((module,mi)=><article className="admin-course-module" key={module.id}>
         <div className="admin-course-module-header"><strong>Module {mi+1}</strong>
           <button type="button" aria-label={"Remove module "+(mi+1)} disabled={draft.modules.length===1}
             onClick={()=>setDraft(d=>({...d,modules:d.modules.filter((_,i)=>i!==mi)}))}>
             <Trash2 size={16}/></button></div>
         <label>Module name<input value={module.title} maxLength={120}
           onChange={e=>modifyModule(mi,{title:e.target.value})}/></label>
         {module.lessons.map((lesson,li)=><div className="admin-course-lesson" key={lesson.id}>
           <header><strong>Lesson {li+1}</strong>
             <button type="button" disabled={module.lessons.length===1}
               aria-label={"Remove lesson "+(li+1)}
               onClick={()=>modifyModule(mi,{lessons:module.lessons.filter((_,i)=>i!==li)})}>
               <Trash2 size={15}/></button></header>
           <label>Title<input value={lesson.title} maxLength={125}
             onChange={e=>modifyLesson(mi,li,{title:e.target.value})}/></label>
           <label>Lesson type<select value={lesson.kind}
             onChange={e=>modifyLesson(mi,li,{kind:e.target.value as Lesson["kind"]})}>
             <option value="reading">Reading / notes</option><option value="video">Video lecture</option>
             <option value="practice">Practical exercise</option></select></label>
           <label>What students will learn<textarea rows={2} maxLength={450} value={lesson.summary}
             onChange={e=>modifyLesson(mi,li,{summary:e.target.value})}/></label>
           <label>External HTTPS link (required for video)<input type="url" maxLength={750}
             value={lesson.url??""} onChange={e=>modifyLesson(mi,li,{url:e.target.value||undefined})}/></label>
           <label>Key notes, one per line<textarea rows={4} value={lesson.notes.join("\n")}
             onChange={e=>modifyLesson(mi,li,{notes:e.target.value.split("\n").filter(Boolean)})}/></label>
           <label>Practical task<textarea rows={2} value={lesson.task} maxLength={550}
             onChange={e=>modifyLesson(mi,li,{task:e.target.value})}/></label>
           <label>Estimated time (minutes)<input type="number" min={5} max={180}
             value={lesson.estimatedMinutes}
             onChange={e=>modifyLesson(mi,li,{estimatedMinutes:Number(e.target.value)})}/></label>
         </div>)}
         <button className="btn btn-quiet" type="button" disabled={totalLessons>=50||module.lessons.length>=16}
           onClick={()=>addLesson(mi)}><Plus size={15}/> Add lesson</button>
       </article>)}
       </div>
       <button className="btn btn-outline" type="button" disabled={draft.modules.length>=12||totalLessons>=50}
         onClick={addModule}><Plus size={16}/> Add module</button>
     </fieldset>
     <div className="sx-admin-anchor"><a href="#admin-save-actions">Jump to save & publish ↓</a></div>
     <details className="sx-admin-preview"><summary><span>Preview current editor content</span><small>{Boolean(original?.published)?"Published version exists · preview shows edits":"Not yet published"}</small></summary><div className="admin-editor-preview"><span className="admin-eyebrow">CURRENT EDITOR CONTENT · {Boolean(original?.published)?"A published version also exists":"Not yet published"}</span>
       <h3><BookOpen size={18}/> {draft.title}</h3><p>{draft.summary}</p>
       <ol>{draft.modules.map(m=><li key={m.id}>{m.title}: {m.lessons.map(l=>l.title).join(", ")}</li>)}</ol></div></details>
     {!valid.success?<p role="alert" className="auth-error">{valid.error.issues[0]?.message??"Complete course details."}</p>:null}
     {error?<p role="alert" className="auth-error">{error}</p>:null}
     {message?<ActionSuccess>{message}</ActionSuccess>:null}
     <div id="admin-save-actions" className="admin-editor-actions"><span role="status" aria-live="polite">{changed?"Unsaved changes":"No unsaved edits"} · {valid.success?"Ready for review":"Correct course fields"}</span>
       <button className="btn btn-outline" type="button" disabled={loading||!!saving||role==="reviewer"||!valid.success}
         onClick={()=>void save(false)}><Save size={16}/>{saving==="draft"?"Saving…":"Save draft"}</button>
       <button className="btn btn-primary" type="button" disabled={loading||!!saving||role!=="owner"||!valid.success}
         onClick={()=>void save(true)}><Send size={16}/>{saving==="publish"?"Publishing…":"Publish course"}</button>
     </div>
   </section>
 </div>;
}
