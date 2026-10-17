"use client";

import Link from "next/link";
import {useState} from "react";
import {AlertCircle, CheckCircle2, Cloud, CloudOff, LoaderCircle, LogOut, RefreshCw, ShieldCheck, ArrowRight} from "lucide-react";
import {useAuth} from "@/components/auth-provider";
import {StatusPill} from "@/components/workspace-ui";
import {ActivityIndicator,ActionSpinner} from "@/components/motion-ui";
import {useAssessmentProfile} from "@/hooks/use-assessment-profile";
import {useSkillmetry} from "@/store/use-skillmetry";
import {careers} from "@skillmetry/shared/data/catalog";

const statusCopy = {
 demo:"Local demo",loading:"Loading cloud profile",saving:"Saving profile",
 synced:"Cloud connected",offline:"Offline — local changes kept",error:"Cloud sync needs attention"
} as const;

export function AccountPanel(){
 const {user,syncStatus,syncMessage,retrySync}=useAuth();
 const {name,careerId,profileSource,onboardingCompleted,cloudOwnerId,resetDemo}=useSkillmetry();
 const {attempts,status:assessmentStatus}=useAssessmentProfile();
 const [signOutPending,setSignOutPending]=useState(false);
 const [signOutError,setSignOutError]=useState<string|null>(null);
 const savedProfile=Boolean(user&&profileSource==="student"&&onboardingCompleted&&cloudOwnerId===user.id);
 const savedCareer=savedProfile?careers.find(c=>c.id===careerId):null;
 const profilePending=syncStatus==="loading"||syncStatus==="saving";
 const profileUnavailable=syncStatus==="error"||syncStatus==="offline";
 const statusTone=syncStatus==="synced"?"success":syncStatus==="error"||syncStatus==="offline"?"warning":"accent";

 async function signOut(){
  setSignOutPending(true);setSignOutError(null);
  try{
   const response=await fetch("/api/auth/sign-out",{method:"POST"});
   if(!response.ok)throw new Error("sign_out_failed");
   resetDemo();window.location.assign("/");
  }catch{
   setSignOutError(navigator.onLine?"Sign-out could not be completed. Try again.":"Reconnect before signing out securely.");
   setSignOutPending(false);
  }
 }

 return <div className="account-grid sx-account-grid">
   <section className="panel account-summary sx-account-identity">
    <div className="panel-header"><div><span className="eyebrow">Signed-in identity</span><h2 className="sx-account-email">{user?.email??"Skillmetry student"}</h2></div><ShieldCheck aria-hidden="true"/></div>
    <div className="account-status"><StatusPill tone={statusTone}>{statusCopy[syncStatus]}</StatusPill>
      {syncStatus==="loading"||syncStatus==="saving"?<LoaderCircle className="spin" aria-hidden="true"/>:syncStatus==="synced"?<CheckCircle2 aria-hidden="true"/>:syncStatus==="offline"?<CloudOff aria-hidden="true"/>:<Cloud aria-hidden="true"/>}
    </div>
    <p className="note">{syncMessage??"Your sign-in is protected. Your learning goals have a separate save state."}</p>
    {(syncStatus==="error"||syncStatus==="offline")?<button className="btn btn-outline" type="button" onClick={retrySync}><RefreshCw aria-hidden="true"/>Retry sync</button>:null}
   </section>
   <section className="panel account-data sx-account-learning">
    <div className="panel-header"><div><span className="eyebrow">Your learning profile</span><h2>{savedProfile?"Saved learning direction":profilePending?"Checking your profile":profileUnavailable?"Learning profile temporarily unavailable":"Choose your learning direction"}</h2></div><Cloud aria-hidden="true"/></div>
    {savedProfile?<dl>
      <div><dt>Student</dt><dd>{name}</dd></div>
      <div><dt>Career goal</dt><dd>{savedCareer?.title??"Independent skills"}</dd></div>
      <div><dt>Verified quiz attempts</dt><dd>{assessmentStatus==="loading"?"Loading…":assessmentStatus==="error"||assessmentStatus==="offline"?"Unavailable":attempts.length}</dd></div>
      <div><dt>Source</dt><dd>Saved student profile</dd></div>
    </dl>:profilePending?<div className="sx-account-setup" role="status"><strong>Loading your saved learning profile…</strong><p>We are checking your private account before showing goal information.</p></div>:profileUnavailable?<div className="sx-account-setup" role="status"><strong>Profile could not be confirmed</strong><p>Reconnect or retry sync to confirm the current saved goals. Your quiz results are not replaced with demo values.</p></div>:<div className="sx-account-setup" role="status">
      <strong>No saved career setup yet</strong>
      <p>Your account is signed in, but the default illustrative learning profile is not your saved profile. Choose your goals to personalize Skillmetry.</p>
      <span>{assessmentStatus==="ready"?`${attempts.length} verified quiz attempt(s) are still preserved in your account.`:"Your quiz history is kept separate from sample data."}</span>
    </div>}
    <div className="sx-account-actions"><Link className="btn btn-primary" href="/onboarding">{savedProfile?"Edit learning goals":"Set up my learning profile"} <ArrowRight size={17} aria-hidden="true"/></Link><a className="btn btn-outline" href="/api/account/export" download="skillmetry-account-export.json">Export my data (JSON)</a></div>
   </section>
   <section className="panel account-security sx-account-security">
    <div className="sx-account-security-row">
      <details><summary><ShieldCheck size={17} aria-hidden="true"/>How Skillmetry protects my results</summary>
       <p className="note">Only authenticated server-graded quizzes create measured skill scores. Not assessed is never treated as a zero, and sample demo values are never your account results.</p>
       <div className="trust-labels"><StatusPill tone="accent">Quiz assessed</StatusPill><StatusPill tone="success">Server graded</StatusPill><StatusPill>History preserved</StatusPill></div>
      </details>
      <button className="btn btn-outline" type="button" disabled={signOutPending} onClick={signOut}>{signOutPending?<ActionSpinner label="Signing out securely…"/>:<><LogOut aria-hidden="true"/>Sign out securely</>}</button>
    </div>
    {signOutError?<div className="auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{signOutError}</span></div>:null}
    {signOutPending?<ActivityIndicator compact secure label="Ending your private session…"/>:null}
   </section>
 </div>;
}
