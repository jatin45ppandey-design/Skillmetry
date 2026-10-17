"use client";

import Link from "next/link";
import {useMemo, useState, useEffect} from "react";
import {useSearchParams} from "next/navigation";
import {BookOpen, CircleHelp, ExternalLink, FileText, PlayCircle, ArrowRight, CheckCircle2} from "lucide-react";
import {skills,careers} from "@skillmetry/shared/data/catalog";
import {assessmentCatalog} from "@skillmetry/shared/data/assessment-catalog";
import {skillLearningGuides} from "@skillmetry/shared/data/skill-learning-guides";
import {adminGuidePayloadSchema,type AdminGuidePayload} from "@skillmetry/shared/lib/admin-content";
import {useSkillmetry} from "@/store/use-skillmetry";

type Mode = "docs"|"lectures"|"notes";
const modes:{key:Mode;label:string;description:string;icon:typeof BookOpen}[]=[
 {key:"docs",label:"Documentation",description:"Read the reference",icon:BookOpen},
 {key:"lectures",label:"Video lectures",description:"Watch a guided course",icon:PlayCircle},
 {key:"notes",label:"Quick notes",description:"Revise key concepts",icon:FileText}
];

/** Focused study surface. External lectures are links to the publisher; they
 * are not hosted, re-uploaded or counted as verified Skillmetry outcomes. */
export function FocusedLearningHub(){
 const params=useSearchParams();
 const querySkill=params.get("skill");
 const {preferences}=useSkillmetry();
 const selectedCareer=careers.find(item=>item.id===preferences.learning.primaryCareerId);
 const preferred=selectedCareer?.skills[0]?.skillId ?? preferences.learning.selectedSkillIds[0] ?? "javascript";
 const [skillId,setSkillId]=useState(querySkill && skillLearningGuides[querySkill]?querySkill:preferred);
 const [mode,setMode]=useState<Mode>("docs");
 const [reviewed,setReviewed]=useState<Record<string,readonly number[]>>({});
 const [publishedOverride,setPublishedOverride]=useState<{skillId:string;content:AdminGuidePayload}|null>(null);
 const [checkingPublished,setCheckingPublished]=useState(false);
 useEffect(()=>{if(querySkill && skillLearningGuides[querySkill])setSkillId(querySkill);},[querySkill]);
 const baseGuide=skillLearningGuides[skillId]??skillLearningGuides.javascript;
 const guide={...baseGuide,...(publishedOverride?.skillId===baseGuide.skillId?publishedOverride.content:{})};
 useEffect(()=>{
   const controller=new AbortController();
   // The original curated content remains a complete offline fallback.
   setCheckingPublished(true);
   void (async()=>{
     try{
       const response=await fetch("/api/content/skill-guides?skill="+encodeURIComponent(baseGuide.skillId),{
         cache:"no-store",signal:controller.signal});
       if(!response.ok)return;
       const result=await response.json() as {guide:unknown;source:string};
       const parsed=adminGuidePayloadSchema.safeParse(result.guide);
       if(!controller.signal.aborted)
         setPublishedOverride(parsed.success?{skillId:baseGuide.skillId,content:parsed.data}:null);
     }catch{if(!controller.signal.aborted)setPublishedOverride(null);}
     finally{if(!controller.signal.aborted)setCheckingPublished(false);}
   })();
   return()=>controller.abort();
 },[baseGuide.skillId]);
 const skill=skills.find(item=>item.id===guide.skillId);
 const quiz=assessmentCatalog.find(item=>item.skillId===guide.skillId);
 const fallback=useMemo(()=>selectedCareer?.skills.slice(0,5).map(s=>s.skillId)??[],[selectedCareer]);
 return <section className="v3-learning-desk" aria-labelledby="v3-study-title">
   <div className="v3-learning-head">
     <div><span className="v3-kicker">START LEARNING / NOT JUST BROWSING</span>
       <h1 id="v3-study-title">Pick a skill. Choose how to learn.</h1>
       <p>One focused desk for docs, full video lessons and original revision notes. Everything in one place.</p>
     </div>
     <div className="v3-skill-chooser">
       <label htmlFor="v3-skill-select">Your topic</label>
       <select id="v3-skill-select" value={guide.skillId} onChange={e=>{setSkillId(e.target.value);setMode("docs");}}>
         {skills.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}
       </select>
     </div>
   </div>
   {fallback.length>0?<div className="v3-quick-topics" aria-label="Your career topics">
     <span>On your path</span>
     {fallback.map(id=><button type="button" key={id} aria-pressed={guide.skillId===id}
       onClick={()=>{setSkillId(id);setMode("docs");}}>{skills.find(item=>item.id===id)?.label??id}</button>)}
   </div>:null}
   <div className="v3-learning-content">
     <nav className="v3-learning-modes" aria-label="Choose learning format">
       {modes.map(item=>{const Icon=item.icon;return <button type="button" key={item.key}
         className={"v3-learning-mode "+(mode===item.key?"selected":"")}
         aria-current={mode===item.key?"true":undefined} onClick={()=>setMode(item.key)}>
         <Icon size={20} aria-hidden="true"/>
         <span><strong>{item.label}</strong><small>{item.description}</small></span>
         <ArrowRight size={15} aria-hidden="true"/>
       </button>;})}
     </nav>
     <div className="v3-learning-detail" aria-live="polite" key={guide.skillId+"-"+mode}>
       <span className="v3-kicker">{skill?.label??guide.skillId} / {modes.find(item=>item.key===mode)?.label}</span>
       {checkingPublished?<span className="v3-session-hint" role="status">Checking published learning updates…</span>:null}
       {mode==="docs"?<>
         <h2>Understand the fundamentals.</h2>
         <p>Start with authoritative documentation. Read one section, try its example and come back for practice.</p>
         <div className="v3-source-card"><BookOpen size={23} aria-hidden="true"/>
           <div><strong>{guide.documentation.title}</strong><small>Official/reference documentation · Opens in a new tab</small></div>
         </div>
         <a className="v3-primary-link" href={guide.documentation.url} target="_blank" rel="noopener noreferrer">Read documentation <ExternalLink size={17} aria-hidden="true"/></a>
       </>:mode==="lectures"?<>
         <h2>Learn by watching and building.</h2>
         <p>A selected educational course relevant to this topic. Take notes and pause to reproduce examples.</p>
         <div className="v3-source-card v3-video-source"><PlayCircle size={27} aria-hidden="true"/>
           <div><strong>{guide.lecture.title}</strong><small>External free learning resource · Publisher hosts the content</small></div>
         </div>
         <a className="v3-primary-link" href={guide.lecture.url} target="_blank" rel="noopener noreferrer">
           {guide.lecture.format==="video"?"Watch video lecture":"Open course with video"} <ExternalLink size={17} aria-hidden="true"/></a>
       </>:<>
         <h2>Remember the essentials.</h2>
         <p>Short Skillmetry-written revision notes; use the full docs and lecture for deeper explanations.</p>
         <ul className="v3-note-points">{guide.notes.map((note,i)=>{
           const complete=(reviewed[guide.skillId]??[]).includes(i);
           return <li key={note}><button type="button"
             className={"v3-note-check "+(complete?"is-checked":"")}
             aria-pressed={complete} aria-label={(complete?"Unmark":"Mark")+" note "+(i+1)+" reviewed"}
             onClick={()=>setReviewed(current=>{const existing=current[guide.skillId]??[];
               return {...current,[guide.skillId]:complete?existing.filter(n=>n!==i):[...existing,i]};})}>
             {complete?"✓":String(i+1).padStart(2,"0")}
           </button><span>{note}</span></li>;
         })}</ul>
         <p className="v3-session-hint">{(reviewed[guide.skillId]??[]).length} of {guide.notes.length} reviewed this session. This is self-check only, not graded proficiency.</p>
       </>}
       <div className="v3-do-next"><div><span className="v3-kicker"><CheckCircle2 size={13} aria-hidden="true"/> TRY THIS NEXT</span><p>{guide.challenge}</p></div>
         <Link href={quiz?"/assessments?assessment="+encodeURIComponent(quiz.id):"/lab"} className="v3-secondary-link">{quiz?"Check understanding":"Practice"} <ArrowRight size={16} aria-hidden="true"/></Link>
       </div>
     </div>
   </div>
   <p className="v3-trust-notice"><CircleHelp size={14} aria-hidden="true"/> Watching or reading does not automatically change your assessed skill score. External material belongs to its creators.</p>
 </section>;
}
