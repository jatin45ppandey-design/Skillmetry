"use client";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, Fingerprint, FlaskConical } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { SkillBars } from "@/components/skill-bars";
import { useSkillmetry } from "@/store/use-skillmetry";
import { readiness, getSkillGaps, selectCareer } from "@/lib/readiness";
import { skillById } from "@/data/catalog";
export default function Dashboard(){
 const {name,careerId,skills,attempts,baselineSource}=useSkillmetry();const career=selectCareer(careerId); const score=readiness(career,skills);const gaps=getSkillGaps(career,skills);
 return <><SectionTitle eyebrow="Overview" title={`Welcome, ${name.split(" ")[0] || "Explorer"}`} description="Your next move, based on the skills you have today." action={<Link href="/onboarding" className="btn btn-outline"><Compass size={16}/> Edit career goal</Link>}/>
 <div className="grid-3" style={{marginBottom:19}}><div className="panel"><div className="stat-label">Current readiness index</div><div className="stat-value">{score}<span className="muted" style={{fontSize:"1.1rem"}}> / 100</span></div><div className="note">{baselineSource === "demo"?"Illustrative demo profile":"Self-reported baseline + quiz adjustments"}</div></div>
 <div className="panel"><div className="stat-label">Target role</div><div style={{fontSize:"1.3rem",fontWeight:780,margin:"20px 0 14px"}}>{career.title}</div><Link href="/careers" className="small card-link">Explore careers →</Link></div>
 <div className="panel"><div className="stat-label">Completed quiz attempts</div><div className="stat-value">{attempts.length}</div><div className="note">Quiz passes give only a limited score adjustment</div></div></div>
 <div className="grid-2"><section className="panel"><div className="row between"><h2 style={{fontSize:"1.06rem"}}>Your skill twin</h2><Fingerprint size={18} style={{color:"#22D3EE"}}/></div><p className="note">A directional view; not a prediction of employability.</p><SkillBars career={career} skills={skills} max={7}/><Link href="/twin" className="btn btn-outline" style={{marginTop:12}}>Explore your twin <ArrowRight size={15}/></Link></section>
 <div className="stack"><section className="panel"><div className="row between"><h2 style={{fontSize:"1.05rem"}}>Highest-impact gaps</h2><BadgeCheck size={18} style={{color:"#22D3EE"}}/></div>{gaps.slice(0,3).map((g,i)=><div className="row between" style={{padding:"17px 0",borderBottom:i<2?"1px solid #25344B":"none"}} key={g.skillId}><span className="small">{skillById[g.skillId].label}</span><span className="tag">{Math.round(g.proficiency)} / 100</span></div>)}<Link className="small card-link" href="/roadmap">See adaptive roadmap →</Link></section>
 <section className="panel" style={{background:"linear-gradient(135deg,#16384A,#121D32)"}}><FlaskConical style={{color:"#22D3EE"}}/><h2 style={{margin:"15px 0 8px",fontSize:"1.1rem"}}>Explore your next move</h2><p className="note">Compare learning missions and see projected readiness impact without changing your actual twin.</p><Link href="/simulator" className="btn btn-primary">Open What-If Lab <ArrowRight size={16}/></Link></section></div></div></>;
}
