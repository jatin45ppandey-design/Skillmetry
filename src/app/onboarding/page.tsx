"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { careers, skillById } from "@/data/catalog";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { CareerId, SkillMap } from "@/types/domain";
export default function Onboarding(){const router=useRouter();const {name,careerId,skills,completeOnboarding}=useSkillmetry();const [localName,setLocalName]=useState(name==="Demo Student"?"":name);const [selected,setSelected]=useState<CareerId>(careerId);const [ratings,setRatings]=useState<SkillMap>(()=>careerId==="ml-engineer"&&name==="Demo Student"?{}:{...skills});
 const career=careers.find(c=>c.id===selected)!;
 function submit(e:React.FormEvent){e.preventDefault();const roleSkills=Object.fromEntries(career.skills.map(s=>[s.skillId,ratings[s.skillId]??0]));completeOnboarding(localName.trim()||"Student",selected,roleSkills);router.push("/dashboard");}
 return <div className="container" style={{maxWidth:940,paddingBottom:90}}><nav className="topnav"><Brand/><Link className="btn btn-outline" href="/"><ArrowLeft size={16}/> Home</Link></nav><div style={{margin:"40px 0 32px"}}><div className="eyebrow">Get started</div><h1 style={{fontSize:"clamp(2.1rem,5vw,3.6rem)",letterSpacing:"-.06em",margin:"12px 0"}}>Create your first skill twin.</h1><p className="muted">No resume needed. Self-reported levels start a low-confidence baseline; future assessments add limited evidence.</p></div><form className="stack" onSubmit={submit}>
 <section className="panel"><label className="field">What should we call you?<input className="input" value={localName} onChange={e=>setLocalName(e.target.value)} maxLength={64} placeholder="Your first name"/></label></section>
 <section className="panel"><h2 style={{fontSize:"1.13rem",marginBottom:17}}>1. Select your target career</h2><div className="grid-3">{careers.map(c=><button type="button" key={c.id} onClick={()=>setSelected(c.id)} className={`career-card ${selected===c.id?"selected":""}`}><strong>{c.title}</strong><p className="note">{c.subtitle}</p></button>)}</div></section>
 <section className="panel"><h2 style={{fontSize:"1.13rem"}}>2. Rate your current familiarity</h2><p className="note">0 = not started • 50 = can do guided tasks • 100 = confident independently (self-estimate only)</p><div className="grid-2" style={{marginTop:19}}>{career.skills.map(s=><label key={s.skillId} className="field"><span className="row between"><span>{skillById[s.skillId].label}</span><strong>{ratings[s.skillId]??0}/100</strong></span><input className="range" type="range" min="0" max="100" step="10" value={ratings[s.skillId]??0} onChange={e=>setRatings(r=>({...r,[s.skillId]:Number(e.target.value)}))}/></label>)}</div></section>
 <button className="btn btn-primary" type="submit" style={{alignSelf:"end"}}>Open my career dashboard <ArrowRight size={17}/></button></form></div>;
}
