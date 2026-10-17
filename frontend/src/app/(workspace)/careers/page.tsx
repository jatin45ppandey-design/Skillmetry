"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, GitBranch, Layers3, LayoutPanelTop, ServerCog } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { StatusPill } from "@/components/workspace-ui";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { assessmentSnapshot } from "@skillmetry/shared/lib/assessments/grading";
import { useSkillmetry } from "@/store/use-skillmetry";

const careerIcons = { "ml-engineer": BrainCircuit, "frontend-developer": LayoutPanelTop, "backend-developer": ServerCog, "full-stack-developer": Layers3 };

export default function Careers() {
  const { preferences, setCareer } = useSkillmetry();
  const { attempts, scores } = useAssessmentProfile();
  const careerId = preferences.learning.primaryCareerId ?? "no-primary-career";
  const currentCareer = careers.find(career => career.id === careerId) ?? { title: "No primary career direction" };

  return <><SectionTitle eyebrow="Career explorer" title="Compare paths using measured results" description="Coverage shows how much of each curated role has been assessed. Performance uses only available quiz results—not missing-skill zeroes, fit, salary, or hiring probability."/><div className="career-explorer-grid">{careers.map(career => { const Icon = careerIcons[career.id]; const current = career.id === careerId; const snapshot = assessmentSnapshot(career,attempts); const strongest = career.skills.filter(item => Object.hasOwn(scores,item.skillId)).sort((a,b) => scores[b.skillId]-scores[a.skillId]).slice(0,2); return <article key={career.id} className={`career-explorer-card motion-stage ${current ? "selected" : ""}`}><div className="career-card-head"><span className="career-icon"><Icon aria-hidden="true"/></span>{current ? <StatusPill tone="accent"><Check aria-hidden="true"/>Current goal</StatusPill> : <StatusPill tone="neutral">Compare</StatusPill>}</div><h2>{career.title}</h2><p>{career.subtitle}</p><div className="career-coverage"><div><span>Assessment coverage</span><strong>{snapshot.coveragePercent}<small>%</small></strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${snapshot.coveragePercent}%`}}/></div></div><div className="career-skill-preview"><span>Measured strengths</span>{strongest.length ? strongest.map(item => <span key={item.skillId}><strong>{skillById[item.skillId].label}</strong><small>{scores[item.skillId]}/100</small></span>) : <span><strong>Not assessed</strong><small>No overlap measured yet</small></span>}</div><div className="career-card-actions">{current ? <Link href="/roadmap" className="btn btn-primary">View current roadmap <ArrowRight aria-hidden="true"/></Link> : <button className="btn btn-quiet" type="button" onClick={() => setCareer(career.id)}>Set as target</button>}</div></article>; })}</div><section className="career-selection-summary motion-stage" key={careerId}><GitBranch aria-hidden="true"/><div><span>Current pathway</span><h2>{currentCareer.title}</h2><p>Changing the target role updates the roadmap and missions. It never changes or fabricates assessment scores.</p></div><Link href="/roadmap" className="text-link">Open adaptive roadmap <ArrowRight aria-hidden="true"/></Link></section></>;
}
