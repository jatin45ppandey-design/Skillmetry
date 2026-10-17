"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,BookOpen,Clock,ExternalLink,PlayCircle} from "lucide-react";
import {skills,skillById} from "@skillmetry/shared/data/catalog";
import {coursePayloadSchema,type CoursePayload} from "@skillmetry/shared/lib/admin-courses";
import {ActivityIndicator} from "@/components/motion-ui";
type Published=CoursePayload&{slug:string;skillId:string;version:number};
export default function CoursesPage(){
 const [items,setItems]=useState<Published[]>([]);
 const [selected,setSelected]=useState<string>("all");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [openCourse,setOpenCourse]=useState<string|null>(null);
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
 const filtered=useMemo(()=>items.filter(item=>selected==="all"||item.skillId===selected),[items,selected]);
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
     <span>{filtered.length} published {filtered.length===1?"course":"courses"}</span>
   </div>
   {loading?<ActivityIndicator compact label="Loading published lessons…"/>:null}
   {error?<p role="status" className="course-note">{error}</p>:null}
   {!loading&&!filtered.length?<section className="course-empty" role="status">
     <BookOpen size={27} aria-hidden="true"/>
     <h2>No published course for this filter yet.</h2>
     <p>Explore our existing documentation, video lectures and short notes while the course library grows.</p>
     <Link href={selected==="all"?"/resources":"/resources?skill="+encodeURIComponent(selected)}
       className="btn btn-primary">Study this skill <ArrowRight size={16}/></Link>
   </section>:null}
   <div className="course-card-grid">
     {filtered.map(course=><article className="course-card" key={course.slug}>
       <header><span className="v3-kicker">{skillById[course.skillId]?.label??course.skillId} · VERSION {course.version}</span>
         <h2>{course.title}</h2><p>{course.summary}</p></header>
       <div className="course-card-count"><BookOpen size={17}/> {course.modules.length} modules ·
         {course.modules.reduce((n,m)=>n+m.lessons.length,0)} lessons</div>
       <button type="button" className="course-toggle" aria-expanded={openCourse===course.slug}
         onClick={()=>setOpenCourse(openCourse===course.slug?null:course.slug)}>
         {openCourse===course.slug?"Hide lessons":"Explore course lessons"} <ArrowRight size={16}/>
       </button>
       {openCourse===course.slug?<div className="course-module-list">
         {course.modules.map((module,mi)=><section key={module.id}>
           <h3>Module {mi+1} · {module.title}</h3>
           <ol>{module.lessons.map((lesson,li)=><li key={lesson.id}>
             <div><strong>{li+1}. {lesson.title}</strong>
               <span><Clock size={13}/> {lesson.estimatedMinutes} min · {lesson.kind}</span>
               <p>{lesson.summary}</p>
               {lesson.notes.length?<ul>{lesson.notes.map(note=><li key={note}>{note}</li>)}</ul>:null}
               <p><strong>Try:</strong> {lesson.task}</p>
               {lesson.url?<a href={lesson.url} target="_blank" rel="noopener noreferrer"
                 className="course-lesson-link">{lesson.kind==="video"?<PlayCircle size={16}/>:<ExternalLink size={16}/>}
                 Open published {lesson.kind==="video"?"video":"resource"} <ExternalLink size={13}/></a>:null}
             </div>
           </li>)}</ol>
         </section>)}
       </div>:null}
     </article>)}
   </div>
   <p className="course-note">Course reading and videos do not automatically change verified quiz scores, learning streaks or assessed readiness.</p>
 </div>;
}
