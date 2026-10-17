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
  const canSave=Boolean(user&&enabled);

  useEffect(()=>{
    const controller=new AbortController();
    void fetch("/api/content/missions",{cache:"no-store",signal:controller.signal})
      .then(async response=>{
        if(!response.ok)throw new Error("Published mission feed unavailable");
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
      if(!response.ok)throw new Error(body.error??"Mission progress unavailable");
      return body.work??[];
    }).then(items=>{
      if(controller.signal.aborted)return;
      setWork(Object.fromEntries(items.map(item=>[item.missionId,item])));
      setLoading(false);
    }).catch(e=>{
      if(controller.signal.aborted)return;
      setError(e instanceof Error?e.message:"Mission progress unavailable");
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
      setNotice(status==="in_progress"?"Private mission progress saved.":"Project submission saved as learner-reported evidence, not verified proficiency.");
    }catch(e){setError(e instanceof Error?e.message:"Mission progress could not be saved");}
    finally{setPending(null);}
  }

  if(!preferences.learning.primaryCareerId)return <>
    <SectionTitle eyebrow="Mission workshop" title="Build real projects" description="Curated projects are organized by career direction."/>
    <CareerDirectionRequired feature="the missions workshop"/>
  </>;
  return <>
    <SectionTitle eyebrow="Chapter 07 / Mission workshop" title="Build something that proves your effort"
      description="Work through curated deliverables, save notes and attach project evidence. Completed checklists are self-reported, never a trusted quiz score."
      action={<Link href="/planner" className="btn btn-quiet">Open weekly planner</Link>}/>
    {!canSave?<p className="workflow-notice" role="status">
      {user?"Private mission saving is staged until the approved database rollout.":"Sign in to save project progress after the workflow rollout."}
      {" "}The reviewed mission descriptions are available for preview.
    </p>:null}
    {loading?<div className="motion-action-status"><ActivityIndicator compact label="Loading your saved project progress…"/></div>:null}
    {error?<p className="auth-error" role="alert">{error}</p>:null}
    {notice?<ActionSuccess>{notice}</ActionSuccess>:null}
    {pending?<div className="motion-action-status"><ActivityIndicator compact label="Saving your private project submission…" detail="Submitted projects remain learner-reported, not verified proficiency."/></div>:null}
    <div className="mission-grid">
      {[...roleMissions,...publishedMissions.filter(m=>m.roleId===careerId&&
        !roleMissions.some(existing=>existing.id===m.id))].map((mission,index)=>{
        const item=work[mission.id]??draft(mission.id);
        const complete=mission.deliverables.every((_,i)=>item.completedIndices.includes(i));
        const hasEvidence=Boolean(item.repositoryUrl||item.demoUrl);
        return <article key={mission.id} className={"mission-work-card workflow-mission "+(priority.has(mission.skillId)?"priority":"")}>
          <div className="mission-card-top"><span className="mission-index">M{String(index+1).padStart(2,"0")}</span>
            <div><StatusPill tone={priority.has(mission.skillId)?"accent":"neutral"}>
              {priority.has(mission.skillId)?"Roadmap priority":"Curated mission"}</StatusPill>
              <StatusPill tone="neutral"><Clock3 aria-hidden="true"/>{mission.estimatedHours}h</StatusPill></div>
          </div>
          <div className="mission-title-row"><span><Target aria-hidden="true"/></span>
            <div><h2>{mission.title}</h2><p>{mission.description}</p></div></div>
          <div className="mission-focus"><span>Primary skill</span><strong>{skillById[mission.skillId].label}</strong></div>
          <div className="mission-deliverables"><h3><FileCheck2 aria-hidden="true"/>Acceptance checklist</h3>
            <ul>{mission.deliverables.map((label,i)=><li key={label}><label>
              <input type="checkbox" checked={item.completedIndices.includes(i)} disabled={!canSave||pending!==null}
                onChange={e=>update(mission.id,{completedIndices:e.target.checked
                  ?[...item.completedIndices,i]:item.completedIndices.filter(n=>n!==i),status:"in_progress"})}/>
              {" "}{label}</label></li>)}</ul>
          </div>
          {canSave?<div className="workflow-mission-fields">
            <label className="workflow-field">GitHub repository URL
              <input className="workflow-input" type="url" value={item.repositoryUrl} disabled={pending!==null}
                onChange={e=>update(mission.id,{repositoryUrl:e.target.value,status:"in_progress"})}
                placeholder="https://github.com/owner/repo" maxLength={500}/></label>
            <label className="workflow-field">Public HTTPS demo URL (optional)
              <input className="workflow-input" type="url" value={item.demoUrl} disabled={pending!==null}
                onChange={e=>update(mission.id,{demoUrl:e.target.value,status:"in_progress"})}
                placeholder="https://example.com/demo" maxLength={500}/></label>
            <label className="workflow-field">Project notes
              <textarea className="workflow-input" value={item.notes} disabled={pending!==null}
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
          <div className="mission-card-footer"><p>No generated skill scores.</p>
            <Link className="text-link" href="/simulator">Compare hypothetical plan <ArrowRight aria-hidden="true"/></Link></div>
        </article>;
      })}
    </div>
  </>;
}
