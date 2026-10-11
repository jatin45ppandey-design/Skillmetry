"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, GitBranch, LayoutPanelTop, ServerCog } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { StatusPill } from "@/components/workspace-ui";
import { careers, skillById } from "@/data/catalog";
import { readiness } from "@/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

const careerIcons = {"ml-engineer":BrainCircuit,"frontend-developer":LayoutPanelTop,"backend-developer":ServerCog};

export default function Careers() {
  const {careerId,setCareer,skills} = useSkillmetry();
  const currentCareer = careers.find(career => career.id === careerId)!;

  return <><SectionTitle eyebrow="Career explorer" title="Compare paths using your baseline" description="Coverage values use the same profile across each curated role. They describe skill overlap—not fit, salary, or likelihood of being hired."/><div className="career-explorer-grid">{careers.map(career => { const Icon = careerIcons[career.id]; const current = career.id === careerId; const score = readiness(career,skills); const strongest = [...career.skills].sort((a,b)=>(skills[b.skillId] ?? 0)-(skills[a.skillId] ?? 0)).slice(0,2); return <article key={career.id} className={`career-explorer-card ${current ? "selected" : ""}`}><div className="career-card-head"><span className="career-icon"><Icon aria-hidden="true"/></span>{current ? <StatusPill tone="accent"><Check aria-hidden="true"/>Current goal</StatusPill> : <StatusPill tone="neutral">Compare</StatusPill>}</div><h2>{career.title}</h2><p>{career.subtitle}</p><div className="career-coverage"><div><span>Your current coverage</span><strong>{score}<small>/100</small></strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${score}%`}}/></div></div><div className="career-skill-preview"><span>Strongest profile overlap</span>{strongest.map(item => <span key={item.skillId}><strong>{skillById[item.skillId].label}</strong><small>{skills[item.skillId] ?? 0}/100</small></span>)}</div><div className="career-card-actions">{current ? <Link href="/roadmap" className="btn btn-primary">View current roadmap <ArrowRight aria-hidden="true"/></Link> : <button className="btn btn-quiet" type="button" onClick={()=>setCareer(career.id)}>Set as target</button>}</div></article>; })}</div><section className="career-selection-summary"><GitBranch aria-hidden="true"/><div><span>Current pathway</span><h2>{currentCareer.title}</h2><p>Changing the target role updates roadmap dependencies, role weights, and curated missions. It does not change your skill estimates.</p></div><Link href="/roadmap" className="text-link">Open adaptive roadmap <ArrowRight aria-hidden="true"/></Link></section></>;
}
