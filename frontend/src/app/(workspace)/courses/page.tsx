"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,BookOpen,Clock,ExternalLink,PlayCircle} from "lucide-react";
import {skills,skillById} from "@skillmetry/shared/data/catalog";
import {coursePayloadSchema,type CoursePayload} from "@skillmetry/shared/lib/admin-courses";
import {ActivityIndicator} from "@/components/motion-ui";
import {useAuth} from "@/components/auth-provider";
import {assessmentCatalog} from "@skillmetry/shared/data/assessment-catalog";
type Published=CoursePayload&{slug:string;skillId:string;version:number};
type CourseCompletion={courseSlug:string;lessonId:string;publishedRevision:number;completed:boolean};
export default function CoursesPage(){
 const {user}=useAuth();
 const [items,setItems]=useState<Published[]>([]);
 const [progress,setProgress]=useState<CourseCompletion[]>([]);
 const [progressEnabled,setProgressEnabled]=useState(false);
 const [progressPending,setProgressPending]=useState<string|null>(null);
 const [progressError,setProgressError]=useState("");
 const [selected,setSelected]=useState<string>("all");
 const [query,setQuery]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [openCourse,setOpenCourse]=useState<string|null>(null);
 useEffect(()=>{
   // Only a matching published course is opened; an arbitrary query parameter never creates content.
   const wanted=new URLSearchParams(window.location.search).get("course");
   if(!wanted||!items.some(item=>item.slug===wanted))return;
   setSelected("all");setQuery("");setOpenCourse(wanted);
 },[items]);
 useEffect(()=>{
   const controller=new AbortController();
   void (async()=>{
     try{
       const response=await fetch("/api/content/courses",{cache:"no-store",signal:controller.signal});
       if(!response.ok)throw new Error();
       const body=await response.json() as {courses:unknown[]};
       const parsed=(body.courses??[]).flatMap(item=>{
         if(typeof item!=="object"||!item)return [];
         const raw=item as Record<string,unknown>;
         const check=coursePayloadSchema.safeParse(raw);
         if(!check.success||typeof raw.slug!=="string"||typeof raw.skillId!=="string")return [];
         return [{...check.data,slug:raw.slug,skillId:raw.skillId,
           version:typeof raw.version==="number"?raw.version:0}];
       });
       if(!controller.signal.aborted)setItems(parsed);
     }catch{if(!controller.signal.aborted)setError("Published courses are temporarily unavailable. Learning resources still work.");}
     finally{if(!controller.signal.aborted)setLoading(false);}
   })();
   return()=>controller.abort();
 },[]);
 useEffect(()=>{
   const controller=new AbortController();
   setProgress([]);setProgressEnabled(false);setProgressError("");
   if(!user)return;
   void fetch("/api/learning/course-progress",{cache:"no-store",signal:controller.signal})
     .then(async response=>{
       const body=await response.json() as {enabled?:boolean;progress?:CourseCompletion[];error?:string};
       if(!response.ok)throw new Error(body.error??"Course activity unavailable.");
       if(!controller.signal.aborted){setProgressEnabled(Boolean(body.enabled));setProgress(body.progress??[]);}
     }).catch(()=>{if(!controller.signal.aborted)setProgressError("Saved lesson activity could not be loaded. Try refreshing.");});
   return()=>controller.abort();
 },[user?.id]);
 async function markLesson(course:Published,lessonId:string,completed:boolean){
   if(!progressEnabled||!user||progressPending)return;
   const key=course.slug+":"+lessonId;setProgressPending(key);setProgressError("");
   try{
     const response=await fetch("/api/learning/course-progress",{method:"PUT",
       headers:{"Content-Type":"application/json"},body:JSON.stringify({
         courseSlug:course.slug,lessonId,publishedRevision:course.version,completed
       })});
     const body=await response.json() as {saved?:boolean;error?:string};
     if(!response.ok||!body.saved)throw new Error(body.error??"Lesson progress not saved.");
     setProgress(previous=>[...previous.filter(row=>row.courseSlug!==course.slug||row.lessonId!==lessonId),{
       courseSlug:course.slug,lessonId,publishedRevision:course.version,completed
     }]);
   }catch(e){setProgressError(e instanceof Error?e.message:"Lesson progress could not be saved.");}
   finally{setProgressPending(null);}
 }
 const filtered=useMemo(()=>items.filter(item=>(selected==="all"||item.skillId===selected)&&
   (item.title+" "+item.summary+" "+(skillById[item.skillId]?.label??"")).toLowerCase().includes(query.trim().toLowerCase())),[items,selected,query]);
 return <div className="course-student-page">
   <header className="course-student-head"><div><span className="v3-kicker">STRUCTURED LEARNING</span>
     <h1>Learn through small, practical lessons.</h1>
     <p>Follow a course, watch hosted video lessons or read concise notes, then try each exercise at your own pace.</p></div>
     <Link href="/resources" className="btn btn-outline">Open the learning desk <ArrowRight size={16}/></Link>
   </header>
   <div className="course-student-filter"><label htmlFor="course-skill">Filter by skill</label>
     <select id="course-skill" value={selected} onChange={e=>{setSelected(e.target.value);setOpenCourse(null);}}>
       <option value="all">All skills</option>{skills.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
     </select>
     <label className="sx-course-search" htmlFor="course-search">Search courses
       <input id="course-search" type="search" placeholder="Search title, skill…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
     <span>{filtered.length} published {filtered.length===1?"course":"courses"}</span>
   </div>
   {loading?<ActivityIndicator compact label="Loading published lessons…"/>:null}
   {error?<p role="alert" className="course-note">{error}</p>:null}
   {progressError?<p role="alert" className="course-note">{progressError}</p>:null}
   {user&&!progressEnabled?<p className="course-note" role="status">Lesson completion tracking is staged on this deployment. You can still study lessons; no saved progress is claimed.</p>:null}
   {!loading&&!filtered.length?<section className="course-empty" role="status">
     <BookOpen size={27} aria-hidden="true"/>
     <h2>No published course for this filter yet.</h2>
     <p>Explore our existing documentation, video lectures and short notes while the course library grows.</p>
     <Link href={selected==="all"?"/resources":"/resources?skill="+encodeURIComponent(selected)}
       className="btn btn-primary">Study this skill <ArrowRight size={16}/></Link>
   </section>:null}
   <div className="course-card-grid">
     {filtered.map(course=>{
       const totalLessons=course.modules.reduce((n,m)=>n+m.lessons.length,0);
       const finished=new Set(progress.filter(row=>row.courseSlug===course.slug&&row.publishedRevision===course.version&&row.completed).map(row=>row.lessonId));
       const assessment=assessmentCatalog.find(a=>a.skillId===course.skillId);
       return <article className="course-card" id={"course-"+course.slug} key={course.slug}>
       <header><span className="v3-kicker">{skillById[course.skillId]?.label??course.skillId} · VERSION {course.version}</span>
         <h2>{course.title}</h2><p>{course.summary}</p></header>
       <div className="course-card-count"><BookOpen size={17}/> {course.modules.length} modules · {totalLessons} lessons
         {progressEnabled?<span aria-label={`${finished.size} of ${totalLessons} lessons self-reported complete`}>
           · {finished.size}/{totalLessons} saved activity</span>:null}</div>
       <button type="button" className="course-toggle" aria-expanded={openCourse===course.slug}
         onClick={()=>setOpenCourse(openCourse===course.slug?null:course.slug)}>
         {openCourse===course.slug?"Hide lessons":"Explore course lessons"} <ArrowRight size={16}/>
       </button>
       {openCourse===course.slug?<div className="course-module-list">
         {course.modules.map((module,mi)=><details className="sx-course-module" key={module.id}>
           <summary><strong>Module {mi+1} · {module.title}</strong><span>{module.lessons.length} lessons</span></summary>
           <ol>{module.lessons.map((lesson,li)=><li key={lesson.id}>
             <div><strong>{li+1}. {lesson.title}</strong>
               <span><Clock size={13}/> {lesson.estimatedMinutes} min · {lesson.kind}</span>
               <p>{lesson.summary}</p>
               {lesson.notes.length?<ul>{lesson.notes.map(note=><li key={note}>{note}</li>)}</ul>:null}
               <p><strong>Try:</strong> {lesson.task}</p>
               {progressEnabled?<button type="button" className="sx-lesson-completion"
                 disabled={Boolean(progressPending)} aria-pressed={finished.has(lesson.id)}
                 onClick={()=>void markLesson(course,lesson.id,!finished.has(lesson.id))}>
                 {progressPending===course.slug+":"+lesson.id?"Saving activity…":
                   finished.has(lesson.id)?"✓ Studied · Undo":"Mark lesson studied"}</button>:null}
               {lesson.url?<a href={lesson.url} target="_blank" rel="noopener noreferrer"
                 className="course-lesson-link">{lesson.kind==="video"?<PlayCircle size={16}/>:<ExternalLink size={16}/>}
                 Open published {lesson.kind==="video"?"video":"resource"} <ExternalLink size={13}/></a>:null}
             </div>
           </li>)}</ol>
         </details>)}
       </div>:null}
       <div className="sx-course-next-actions">
         <Link href={"/lab?skill="+encodeURIComponent(course.skillId)} className="btn btn-outline">Practice this skill</Link>
         {assessment?<Link className="btn btn-outline" href={`/assessments?assessment=${encodeURIComponent(assessment.id)}`}>
           {finished.size===totalLessons&&totalLessons>0?"Reassess when ready":"Check my baseline"}</Link>:null}
       </div>
     </article>;})}
   </div>
   <p className="course-note">Course reading and videos do not automatically change verified quiz scores, learning streaks or assessed readiness.</p>
 </div>;
}
