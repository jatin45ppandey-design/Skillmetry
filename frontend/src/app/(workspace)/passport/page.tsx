"use client";
import {ActivityIndicator,ActionSpinner,ActionSuccess} from "@/components/motion-ui";
import {useEffect,useState} from "react";
import Link from "next/link";
import {SectionTitle} from "@/components/section-title";
import {CareerDirectionRequired} from "@/components/career-direction-required";
import {useAuth} from "@/components/auth-provider";
import {useAssessmentProfile} from "@/hooks/use-assessment-profile";
import {assessmentSnapshot} from "@skillmetry/shared/lib/assessments/grading";
import {selectCareer} from "@skillmetry/shared/lib/readiness";
import {skillById} from "@skillmetry/shared/data/catalog";
import {useSkillmetry} from "@/store/use-skillmetry";

type LinkItem={id:string;created_at:string;expires_at:string;revoked_at:string|null};
const available=process.env.NEXT_PUBLIC_PASSPORT_SHARING_ENABLED==="true";
export default function Passport(){
 const {name,careerId,preferences,profileSource}=useSkillmetry();
 const {user}=useAuth();
 const {attempts,scores,illustrative}=useAssessmentProfile();
 const career=selectCareer(careerId),summary=assessmentSnapshot(career,attempts);
 const skills=Object.keys(scores).filter(id=>Boolean(skillById[id])).sort();
 const [chosen,setChosen]=useState<string[]>([]),[consent,setConsent]=useState(false);
 const [links,setLinks]=useState<LinkItem[]>([]),[url,setUrl]=useState("");
 const [pending,setPending]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const canShare=Boolean(user&&available&&!illustrative);
 useEffect(()=>{
  if(!canShare)return;
  let cancelled=false;
  void fetch("/api/passport/shares",{cache:"no-store"}).then(r=>r.json())
    .then((data:{links?:LinkItem[]})=>{if(!cancelled)setLinks(data.links??[]);})
    .catch(()=>{if(!cancelled)setNotice("Could not retrieve earlier share links.");});
  return ()=>{cancelled=true;};
 },[canShare,user?.id]);
 function toggle(id:string,checked:boolean){
  setChosen(curr=>checked?[...curr,id].slice(0,8):curr.filter(x=>x!==id));
  setUrl("");
 }
 async function create(){
  setPending(true);setError("");setNotice("");
  try{
   const res=await fetch("/api/passport/shares",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({skillIds:chosen,consent})});
   const body=await res.json() as {url?:string;link?:{id:string;created_at:string;expires_at:string};error?:string};
   if(!res.ok||!body.url||!body.link)throw new Error(body.error??"Cannot create private link.");
   setUrl(body.url);setConsent(false);
   setLinks(list=>[{...body.link!,revoked_at:null},...list]);
   setNotice("Share URL created. Copy it now: for privacy, the token is not shown again after reloading.");
  }catch(e){setError(e instanceof Error?e.message:"Share creation failed");}
  finally{setPending(false);}
 }
 async function revoke(id:string){
  setPending(true);setError("");
  try{
   const res=await fetch("/api/passport/shares",{method:"DELETE",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id})});
   const body=await res.json() as {revoked?:boolean;error?:string};
   if(!res.ok)throw new Error(body.error??"Could not revoke link");
   setLinks(items=>items.map(item=>item.id===id?{...item,revoked_at:new Date().toISOString()}:item));
   setUrl("");setNotice("Share access revoked.");
  }catch(e){setError(e instanceof Error?e.message:"Could not revoke link");}
  finally{setPending(false);}
 }
 if(!preferences.learning.primaryCareerId)return <>
   <SectionTitle eyebrow="Private preview" title="Skill Summary"
     description="Your optional presentation of truthful foundational assessment evidence."/>
   <CareerDirectionRequired feature="Skill Summary"/>
 </>;
 return <>
  <SectionTitle eyebrow="Skill Summary" title="Your learning evidence, your choice"
   description="Preview your recorded quizzes, download a private report through browser print, or explicitly select what to share."
   action={<Link href="/account" className="btn btn-outline">Account & data export</Link>}/>
  <section className="panel workflow-passport-print" style={{maxWidth:860}}>
   <span className="eyebrow">Skillmetry · Private learning passport</span>
   <h2 style={{fontSize:"2rem",margin:"14px 0 6px"}}>{name}</h2>
   <p className="note">Exploring {career.title}</p>
   <div className="grid-2"><div className="panel"><span className="stat-label">Target skill coverage</span>
     <strong className="stat-value">{summary.coveragePercent}%</strong></div>
    <div className="panel"><span className="stat-label">Completed assessment attempts</span>
     <strong className="stat-value">{attempts.length}</strong></div></div>
   <h3>Measured foundational skills</h3>
   {skills.length?skills.map(id=><div className="workflow-result" key={id}>
     <strong>{skillById[id].label}</strong>
     <span>{scores[id]}/100 from supported server-graded quizzes</span>
   </div>):<p>No trusted assessment evidence is available yet.</p>}
   <p className="note">Profile source: {profileSource}. Records are {illustrative?"illustrative demo data":"account-associated server-graded outcomes"}.
   Not a certification or hiring forecast. Project and practice submissions are not score sources.</p>
  </section>
  <div className="workflow-inline-actions workflow-no-print">
   <button type="button" className="btn btn-primary" onClick={()=>window.print()}>Print / Save as PDF</button>
   <Link href="/api/account/export" className="btn btn-outline">Download private JSON export</Link>
  </div>
  <section className="panel workflow-panel workflow-no-print" style={{maxWidth:860}}>
   <h2>Selective share links</h2>
   {!canShare?<p className="workflow-notice">{illustrative?"Demo records cannot be shared.":user?
     "Public sharing is staged pending private database and security approval.":"Sign in to manage consent-based sharing."}</p>:
    <>
     <p className="note">Sharing is off by default. Choose 1–8 measured skills. The generated link contains your display name, chosen quiz results and career direction, expires after seven days and can be revoked.</p>
     {skills.map(id=><label className="workflow-field" key={id}><span><input type="checkbox"
       checked={chosen.includes(id)} disabled={pending||(!chosen.includes(id)&&chosen.length>=8)}
       onChange={e=>toggle(id,e.target.checked)}/> {skillById[id].label} · {scores[id]}/100</span></label>)}
     <label className="workflow-field"><span><input type="checkbox" checked={consent}
       onChange={e=>setConsent(e.target.checked)} disabled={pending}/>
       I agree to publish my display name, career and selected results to anyone holding the link for up to seven days.</span></label>
     <button type="button" className="btn btn-primary" disabled={pending||!consent||!chosen.length}
       onClick={()=>void create()}>{pending?<ActionSpinner label="Creating private share link…"/>:"Create expiring share link"}</button>
     {url?<div className="workflow-field"><label>One-time share URL<input className="workflow-input" readOnly value={url}/></label>
       <button type="button" className="btn btn-outline" onClick={()=>void navigator.clipboard.writeText(url)}>Copy URL</button></div>:null}
     <h3>Existing links</h3>
     {links.length?links.map(link=><div className="workflow-result" key={link.id}>
       <span>Created {new Date(link.created_at).toLocaleDateString("en-IN")} · Expires {new Date(link.expires_at).toLocaleDateString("en-IN")}</span>
       <strong>{link.revoked_at?"Revoked":Date.parse(link.expires_at)<=Date.now()?"Expired":"Active"}</strong>
       {!link.revoked_at&&Date.parse(link.expires_at)>Date.now()?
         <button type="button" className="btn btn-outline" disabled={pending}
           onClick={()=>void revoke(link.id)}>{pending?<ActionSpinner label="Revoking access…"/>:"Revoke access"}</button>:null}</div>):
       <p className="note">No share links created.</p>}
    </>}
   {error?<p role="alert" className="auth-error">{error}</p>:null}
   {pending?<ActivityIndicator compact label="Updating your consent-based Passport sharing…" detail="This operation is not complete until the server confirms."/ >:null}
   {notice?<ActionSuccess>{notice}</ActionSuccess>:null}
  </section>
 </>;
}
