"use client";
import {ActivityIndicator,ActionSpinner,ActionSuccess} from "@/components/motion-ui";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,Clock3,FileCheck2,Target} from "lucide-react";
import {CareerDirectionRequired} from "@/components/career-direction-required";
import {SectionTitle} from "@/components/section-title";
import {StatusPill} from "@/components/workspace-ui";
import {useAuth} from "@/components/auth-provider";
import {missions,skillById} from "@skillmetry/shared/data/catalog";
import {useAssessmentProfile} from "@/hooks/use-assessment-profile";
import {getNextSkills,selectCareer} from "@skillmetry/shared/lib/readiness";
import {useSkillmetry} from "@/store/use-skillmetry";
import type {MissionWork,MissionWorkStatus} from "@skillmetry/shared/lib/mission-work";
import type {PublishedAdminMission} from "@skillmetry/shared/lib/admin-missions";
import {missionSpecificationById} from "@skillmetry/shared/data/mission-specs";
import {learningResources} from "@skillmetry/shared/data/learning-resources";

const enabled=process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true";
const draft=(missionId:string):MissionWork=>({missionId,status:"in_progress",completedIndices:[],
  repositoryUrl:"",demoUrl:"",notes:""});
export default function Missions(){
  const {careerId,preferences}=useSkillmetry();
  const {user}=useAuth();
  const {scores}=useAssessmentProfile();
  const career=selectCareer(careerId);
  const roleMissions=missions.filter(mission=>mission.roleId===careerId);
  const priority=new Set(getNextSkills(career,scores,3).map(item=>item.skillId));
  const [publishedMissions,setPublishedMissions]=useState<PublishedAdminMission[]>([]);
  const [work,setWork]=useState<Record<string,MissionWork>>({});
  const [dirty,setDirty]=useState<string[]>([]);
  const [pending,setPending]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [notice,setNotice]=useState<string|null>(null);
  const [showPriorityOnly,setShowPriorityOnly]=useState(false);
  const canSave=Boolean(user&&enabled);

  useEffect(()=>{
    const controller=new AbortController();
    void fetch("/api/content/missions",{cache:"no-store",signal:controller.signal})
      .then(async response=>{
        if(!response.ok)throw new Error("Published project list unavailable");
        const body=await response.json() as {missions?:PublishedAdminMission[]};
        if(!controller.signal.aborted)setPublishedMissions(body.missions??[]);
      }).catch(()=>{/* Preserve curated missions if content publishing is unavailable. */});
    return()=>controller.abort();
  },[]);

  useEffect(()=>{
    setWork({});setDirty([]);setError(null);setNotice(null);
    if(!canSave)return;
    const controller=new AbortController();
    setLoading(true);
    void fetch("/api/learning/missions",{cache:"no-store",signal:controller.signal}).then(async response=>{
      const body=await response.json() as {work?:MissionWork[];error?:string};
      if(!response.ok)throw new Error(body.error??"Project progress unavailable");
      return body.work??[];
    }).then(items=>{
      if(controller.signal.aborted)return;
      setWork(Object.fromEntries(items.map(item=>[item.missionId,item])));
      setLoading(false);
    }).catch(e=>{
      if(controller.signal.aborted)return;
      setError(e instanceof Error?e.message:"Project progress unavailable");
      setLoading(false);
    });
    return ()=>controller.abort();
  },[canSave,user?.id]);

  function update(missionId:string,change:Partial<MissionWork>){
    setWork(current=>({...current,[missionId]:{...(current[missionId]??draft(missionId)),...change}}));
    setDirty(items=>items.includes(missionId)?items:[...items,missionId]);
    setNotice(null);
  }
  async function save(missionId:string,status:MissionWorkStatus){
    const item={...(work[missionId]??draft(missionId)),status};
    setPending(missionId);setError(null);setNotice(null);
    try{
      const response=await fetch("/api/learning/missions",{method:"PUT",
        headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});
      const body=await response.json() as {work?:MissionWork;error?:string};
      if(!response.ok||!body.work)throw new Error(body.error??"Unable to save your work");
      setWork(current=>({...current,[missionId]:body.work!}));
      setDirty(items=>items.filter(id=>id!==missionId));
      setNotice(status==="in_progress"?"Private project progress saved.":"Project submission saved as learner-reported evidence, not verified proficiency.");
    }catch(e){setError(e instanceof Error?e.message:"Project progress could not be saved");}
    finally{setPending(null);}
  }

  if(!preferences.learning.primaryCareerId)return <>
    <SectionTitle eyebrow="Projects" title="Build real projects" description="Curated projects are organized by career direction."/>
    <CareerDirectionRequired feature="Projects"/>
  </>;
  return <>
    <SectionTitle eyebrow="Projects" title="Build something that proves your effort"
      description="Work through curated deliverables, save notes and attach project evidence. Completed checklists are self-reported, never a trusted quiz score."
      action={<Link href="/planner" className="btn btn-quiet">Open Weekly Study Plan</Link>}/>
    {!canSave?<p className="workflow-notice" role="status">
      {user?"Private project saving is staged until the approved database rollout.":"Sign in to save project progress after the workflow rollout."}
      {" "}The reviewed project descriptions are available for preview.
    </p>:null}
    {loading?<div className="motion-action-status"><ActivityIndicator compact label="Loading your saved project progress…"/></div>:null}
    {error?<p className="auth-error" role="alert">{error}</p>:null}
    {notice?<ActionSuccess>{notice}</ActionSuccess>:null}
    {pending?<div className="motion-action-status"><ActivityIndicator compact label="Saving your private project submission…" detail="Submitted projects remain learner-reported, not verified proficiency."/></div>:null}
    <div className="sx-mission-toolbar"><strong>{roleMissions.length+publishedMissions.filter(m=>m.roleId===careerId&&!roleMissions.some(existing=>existing.id===m.id)).length} curated projects</strong><label><input type="checkbox" checked={showPriorityOnly} onChange={event=>setShowPriorityOnly(event.target.checked)}/> Show roadmap priorities only</label></div>
    {showPriorityOnly&&!roleMissions.some(m=>priority.has(m.skillId))&&!publishedMissions.some(m=>m.roleId===careerId&&priority.has(m.skillId))?<p className="workflow-notice" role="status">No learning-path priority projects for this career yet. Turn off the filter to view all projects.</p>:null}
    <div className="mission-grid sx-missions-grid">
      {[...roleMissions,...publishedMissions.filter(m=>m.roleId===careerId&&
        !roleMissions.some(existing=>existing.id===m.id))].filter(m=>!showPriorityOnly||priority.has(m.skillId)).map((mission,index)=>{
        const item=work[mission.id]??draft(mission.id);
        const complete=mission.deliverables.every((_,i)=>item.completedIndices.includes(i));
        const hasEvidence=Boolean(item.repositoryUrl||item.demoUrl);
        const specification=missionSpecificationById[mission.id];
        const references=specification?.referenceResourceIds.flatMap(id=>learningResources.find(resource=>resource.id===id)??[] )??[];
        return <article key={mission.id} className={`mission-work-card workflow-mission ${priority.has(mission.skillId)?"priority":""} ${pending===mission.id?"p3-project-saving":""}`}>
          <div className="mission-card-top"><span className="mission-index">M{String(index+1).padStart(2,"0")}</span>
            <div><StatusPill tone={priority.has(mission.skillId)?"accent":"neutral"}>
              {priority.has(mission.skillId)?"Learning path priority":"Curated project"}</StatusPill>
              <StatusPill tone="neutral"><Clock3 aria-hidden="true"/>{mission.estimatedHours}h</StatusPill></div>
          </div>
          <div className="mission-title-row"><span><Target aria-hidden="true"/></span>
            <div><h2>{mission.title}</h2><p>{mission.description}</p></div></div>
          <div className="mission-focus"><span>Primary skill</span><strong>{skillById[mission.skillId].label}</strong></div>
          {specification?<div className="p3-project-brief">
            <div><span className="eyebrow">{specification.difficulty} project</span><h3>Objectives</h3><ul>{specification.objectives.map(objective=><li key={objective}>{objective}</li>)}</ul></div>
            <div><h3>Prerequisites</h3>{specification.prerequisiteSkillIds.length?<ul>{specification.prerequisiteSkillIds.map(id=><li key={id}>{skillById[id]?.label??id}</li>)}</ul>:<p>No catalog prerequisite. Start with the linked lesson and practice.</p>}</div>
            <nav aria-label={`${mission.title} preparation`}><h3>Prepare</h3>
              {specification.lessonHref?<Link className="text-link" href={specification.lessonHref}>Related lesson <ArrowRight aria-hidden="true"/></Link>:null}
              {specification.practiceHref?<Link className="text-link" href={specification.practiceHref}>Topic practice <ArrowRight aria-hidden="true"/></Link>:null}
              {references.map(resource=><a className="text-link" key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title} ↗</a>)}
            </nav>
          </div>:<p className="note">Published project details use the reviewed author brief and checklist.</p>}
          <details className="sx-mission-details" data-phase3-motion="project-disclosure"><summary><FileCheck2 aria-hidden="true"/> View checklist & evidence <span>{item.completedIndices.length}/{mission.deliverables.length} steps</span></summary>
          <div className="mission-deliverables"><h3>Acceptance checklist</h3>
            <ul>{mission.deliverables.map((label,i)=><li key={label}><label>
               <input type="checkbox" name={`deliverable-${mission.id}-${i}`} checked={item.completedIndices.includes(i)} disabled={!canSave||pending!==null}
                onChange={e=>update(mission.id,{completedIndices:e.target.checked
                  ?[...item.completedIndices,i]:item.completedIndices.filter(n=>n!==i),status:"in_progress"})}/>
              {" "}{label}</label></li>)}</ul>
          </div>
          {specification?<div className="p3-project-rubric"><h3>Evaluation rubric</h3>{specification.rubric.map(item=><article key={item.criterion}><strong>{item.criterion}</strong><p>{item.evidence}</p></article>)}</div>:null}
          {canSave?<div className="workflow-mission-fields">
            <label className="workflow-field">GitHub repository URL
              <input className="workflow-input" type="url" name={`repository-${mission.id}`} autoComplete="off" value={item.repositoryUrl} disabled={pending!==null}
                onChange={e=>update(mission.id,{repositoryUrl:e.target.value,status:"in_progress"})}
                placeholder="https://github.com/owner/repo" maxLength={500}/></label>
            <label className="workflow-field">Public HTTPS demo URL (optional)
              <input className="workflow-input" type="url" name={`demo-${mission.id}`} autoComplete="off" value={item.demoUrl} disabled={pending!==null}
                onChange={e=>update(mission.id,{demoUrl:e.target.value,status:"in_progress"})}
                placeholder="https://example.com/demo" maxLength={500}/></label>
            <label className="workflow-field">Project notes
              <textarea className="workflow-input" name={`notes-${mission.id}`} autoComplete="off" value={item.notes} disabled={pending!==null}
                onChange={e=>update(mission.id,{notes:e.target.value,status:"in_progress"})}
                maxLength={3000} placeholder="What did you build? What was challenging?"/></label>
            <div className="workflow-inline-actions">
              <button type="button" className="btn btn-outline" disabled={pending!==null}
                onClick={()=>void save(mission.id,"in_progress")}>
                {pending===mission.id?<ActionSpinner label="Saving project…"/>:dirty.includes(mission.id)?"Save changes":"Save progress"}</button>
              <button type="button" className="btn btn-primary" disabled={pending!==null||!complete||!hasEvidence}
                onClick={()=>void save(mission.id,"submitted")}>{pending===mission.id?<ActionSpinner label="Submitting evidence…"/>:"Submit evidence"}</button>
              {item.status==="submitted"||item.status==="self_completed"?<button className="btn btn-outline"
                disabled={pending!==null} onClick={()=>void save(mission.id,"self_completed")}>Mark self-completed</button>:null}
            </div>
            <p className="note">Status: {item.status.replace("_"," ")} · Evidence is learner-reported, not reviewed or verified.</p>
          </div>:<p className="note">Checklist and evidence submission require an authenticated private workspace.</p>}
          </details>
          <div className="mission-card-footer"><p>No generated skill scores.</p>
            <Link className="text-link" href="/simulator">Compare hypothetical plan <ArrowRight aria-hidden="true"/></Link></div>
        </article>;
      })}
    </div>
  </>;
}
