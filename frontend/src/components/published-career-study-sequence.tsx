"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,BookOpen} from "lucide-react";
import {skillById} from "@skillmetry/shared/data/catalog";
import {editorialRoadmapPayloadSchema,type EditorialRoadmapPayload} from "@skillmetry/shared/lib/admin-roadmaps";
/** Published editorial study order only. The canonical prerequisite DAG
 * and all trusted assessment scores remain in the roadmap graph. */
export function PublishedCareerStudySequence({careerId}:{careerId:string|null}){
 const [result,setResult]=useState<{careerId:string;roadmap:EditorialRoadmapPayload}|null>(null);
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{
   if(!careerId)return;
   const controller=new AbortController();
   void (async()=>{
     try{
       const response=await fetch("/api/content/career-roadmaps?career="+encodeURIComponent(careerId),
         {cache:"no-store",signal:controller.signal});
       if(!response.ok)return;
       const data=await response.json() as {roadmap:unknown};
       const parsed=editorialRoadmapPayloadSchema.safeParse(data.roadmap);
       if(!controller.signal.aborted)setResult(parsed.success?{careerId,roadmap:parsed.data}:null);
     }catch{if(!controller.signal.aborted)setResult(null);}
   })();
   return()=>controller.abort();
 },[careerId]);
 const roadmap=result?.careerId===careerId?result.roadmap:null;
 if(!roadmap)return null;
 const visible=expanded?roadmap.steps:roadmap.steps.slice(0,3);
 return <section className="admin-published-study" aria-labelledby="published-study-heading">
   <div className="admin-published-study-top">
     <div><span className="v3-kicker">PUBLISHED CAREER STUDY PLAN</span>
       <h2 id="published-study-heading">{roadmap.headline}</h2>
       <p>{roadmap.introduction}</p></div>
     <BookOpen aria-hidden="true" size={23}/>
   </div>
   <ol className="admin-published-study-steps">
     {visible.map((step,index)=><li key={step.skillId}>
       <span>{index+1}</span><div><strong>{skillById[step.skillId]?.label??step.skillId}</strong>
         <p>{step.explanation}</p><small>Try: {step.task}</small></div>
       <Link href={"/resources?skill="+encodeURIComponent(step.skillId)} aria-label={"Open "+step.skillId+" resources"}>
         Learn <ArrowRight size={14} aria-hidden="true"/></Link>
     </li>)}
   </ol>
   {roadmap.steps.length>3?<button type="button" className="admin-study-toggle"
     aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>
     {expanded?"Show first three steps":"See complete "+roadmap.steps.length+"-step study sequence"}
   </button>:null}
   <small className="admin-published-disclaimer">Editorial learning sequence only. Skill prerequisites and quiz scores remain unchanged.</small>
 </section>;
}
