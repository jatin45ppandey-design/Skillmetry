"use client";
import { useSkillmetry } from "@/store/use-skillmetry";
import { careers } from "@/data/catalog";
import { readiness } from "@/lib/readiness";
import { SectionTitle } from "@/components/section-title";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function Careers(){const {careerId,setCareer,skills}=useSkillmetry();return <><SectionTitle eyebrow="Career explorer" title="Choose a direction" description="Compare three carefully curated starter career paths. More roles arrive in later releases."/><div className="grid-3">{careers.map(c=><button type="button" key={c.id} className={`career-card ${c.id===careerId?"selected":""}`} onClick={()=>setCareer(c.id)}><span className="tag">{c.id===careerId?"Current goal":"Explore"}</span><h2 style={{margin:"24px 0 8px",fontSize:"1.25rem"}}>{c.title}</h2><p className="muted small" style={{minHeight:45}}>{c.subtitle}</p><div className="row between"><span className="small muted">Readiness index</span><strong>{readiness(c,skills)}/100</strong></div><div className="progress-track" style={{marginTop:10}}><div className="progress-fill" style={{width:`${readiness(c,skills)}%`}}/></div></button>)}</div><div className="panel" style={{marginTop:20}}><div className="row between"><div><h3>Selected career: {careers.find(c=>c.id===careerId)?.title}</h3><p className="note">Changes the roadmap, scoring weights and recommended mission list.</p></div><Link href="/roadmap" className="btn btn-primary">View roadmap <ArrowRight size={16}/></Link></div></div></>}
