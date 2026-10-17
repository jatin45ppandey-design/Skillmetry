"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,CheckCircle2,CloudOff,Save,ShieldCheck} from "lucide-react";
import {LearningGoalEditor} from "@/components/learning-goal-editor";
import {ActivityIndicator,ActionSuccess} from "@/components/motion-ui";
import {SectionTitle} from "@/components/section-title";
import {useAuth} from "@/components/auth-provider";
import {useSkillmetry} from "@/store/use-skillmetry";
import {careers} from "@skillmetry/shared/data/catalog";

export default function Settings(){
 const {name,profileSource,cloudOwnerId,onboardingCompleted,preferences,setPreferences,resetDemo}=useSkillmetry();
 const {configured,user,syncStatus,syncMessage}=useAuth();
 const [draft,setDraft]=useState(preferences.learning);
 const [applied,setApplied]=useState(false);
 const [observedSync,setObservedSync]=useState(false);
 useEffect(()=>{setDraft(preferences.learning);},[preferences.learning]);
 const changed=JSON.stringify(draft)!==JSON.stringify(preferences.learning);
 const verifiedProfile=Boolean(user&&profileSource==="student"&&onboardingCompleted&&cloudOwnerId===user.id);
 const selectedCareer=careers.find(c=>c.id===draft.primaryCareerId)?.title??"No career selected";
 const isBusy=syncStatus==="loading"||syncStatus==="saving";
 const syncFailed=syncStatus==="error"||syncStatus==="offline";
 useEffect(()=>{if(applied&&syncStatus==="saving")setObservedSync(true);},[applied,syncStatus]);
 useEffect(()=>{
   if(!changed)return;
   const beforeExit=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue="";};
   window.addEventListener("beforeunload",beforeExit);
   return()=>window.removeEventListener("beforeunload",beforeExit);
 },[changed]);
 function saveLearningGoals(){
   if(!changed||isBusy)return;
   setObservedSync(false);setApplied(true);
   setPreferences({...preferences,learning:draft});
 }
 function updateDraft(value:typeof draft){setDraft(value);setApplied(false);setObservedSync(false);}
 let saveStatus=changed?"Unsaved changes · Apply your selections":
   !verifiedProfile?"Demo/local selections · Complete profile setup to save to your account":
   isBusy?"Checking or syncing your cloud profile…":
   syncFailed?"Cloud sync unavailable · Your local selections remain":
   applied&&observedSync&&syncStatus==="synced"?"Learning goals synced to cloud":
   applied?"Applied locally · Waiting for cloud confirmation":
   "No pending changes · Cloud profile connected";
 return <div className="sx-settings-page">
  <SectionTitle eyebrow="Learning goals & settings" title="Shape your learning direction"
    description="Choose a career or skills you care about. These choices never create an assessment score."/>
  <div className="sx-settings-overview">
   <section className="panel" aria-label="Account and cloud connection">
    <span className="eyebrow">PROFILE CONNECTION</span>
    <h2>{verifiedProfile?"Your saved student profile":user?"Signed in · No saved learning profile":"Explore as a guest"}</h2>
    <p>{verifiedProfile?name:user?"You're signed in; a demo goal is not yet a saved student profile.":"Start with a local preview. Sign in to keep your learning goals."}</p>
    <p className="sx-settings-source">
      {syncFailed?<><CloudOff size={15} aria-hidden="true"/> {syncMessage??"Cloud sync unavailable"}</>:
      isBusy?"Checking private profile…":verifiedProfile?"Saved profile connected to your account.":"Learning direction not yet saved to your account."}
    </p>
    <Link className="btn btn-outline" href={user?"/account":"/auth/sign-in"}>{user?"Manage account":"Sign in"} <ArrowRight size={16} aria-hidden="true"/></Link>
   </section>
   <section className="sx-settings-goals" aria-label="Current learning-goal preview">
    <span className="eyebrow">CURRENT SELECTIONS {changed?"· NOT APPLIED":""}</span>
    <h2>{selectedCareer}</h2>
    <p>{draft.primaryCareerId?"Your selected career direction":"You can learn individual skills without selecting a career."}</p>
    <div className="sx-settings-goals-counts">
      <span>{draft.selectedSkillIds.length} individual skills</span>
      <span>{draft.selectedToolIds.length} tools</span>
      <span>{changed?"Unsaved edits":verifiedProfile?"Profile set up":"Preview only"}</span>
    </div>
   </section>
  </div>
  {isBusy?<ActivityIndicator compact label={syncStatus==="saving"?"Syncing changes securely…":"Loading your cloud profile…"} detail="Only actual server confirmation can establish a cloud save."/>:null}
  <section className="panel sx-goal-editor-panel" aria-label="Edit career, skills and technology goals">
   <div className="learning-goals-panel-head"><div>
    <span className="eyebrow">EDIT LEARNING GOALS</span>
    <h2>Choose what to focus on</h2>
    <p>Pick a career direction, then optionally add individual skills and tools. Nothing here is graded.</p>
   </div></div>
   <LearningGoalEditor value={draft} onChange={updateDraft}/>
   <div className="sx-goal-actions" role="status" aria-live="polite">
    <p>{saveStatus}</p>
    <div className="row">
      {changed?<button type="button" className="btn btn-outline" onClick={()=>updateDraft(preferences.learning)}>Discard edits</button>:null}
      <button type="button" className="btn btn-primary" disabled={!changed||isBusy} onClick={saveLearningGoals}>
       <Save size={16} aria-hidden="true"/>{changed?"Apply learning goals":"No pending changes"}
      </button>
      {!verifiedProfile?<Link href="/onboarding" className="btn btn-outline">Complete profile setup <ArrowRight size={16} aria-hidden="true"/></Link>:null}
    </div>
   </div>
   {applied&&!changed&&!isBusy&&!syncFailed?(
    verifiedProfile&&observedSync&&syncStatus==="synced"?
       <ActionSuccess><CheckCircle2 size={15} aria-hidden="true"/> Cloud sync completed for your learning goals.</ActionSuccess>:
       <p className="note"><ShieldCheck size={15} aria-hidden="true"/> Applied in this browser. {verifiedProfile?"Cloud confirmation is not yet available.":"Finish profile setup to save goals to your account."}</p>
   ):null}
  </section>
  {!user&&configured?<p className="note"><Link href="/auth/sign-in">Sign in</Link> to create trusted assessments. Local learning preferences do not count as measured evidence.</p>:null}
  {!user?<button type="button" className="btn btn-outline" onClick={()=>{if(window.confirm("Reset the local illustrative profile? This does not change cloud quiz results."))resetDemo();}}>Reset local preview</button>:null}
 </div>;
}
