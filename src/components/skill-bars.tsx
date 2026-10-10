import { skillById } from "@/data/catalog";
import type { Career, SkillMap } from "@/types/domain";
import { clamp } from "@/lib/readiness";
export function SkillBars({career,skills,max=6}:{career:Career;skills:SkillMap;max?:number}) {
  return <>{career.skills.slice(0,max).map(({skillId}) => <div key={skillId} className="skill-line"><div className="skill-head"><strong>{skillById[skillId].label}</strong><span className="muted">{clamp(skills[skillId]??0)} / 100</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${clamp(skills[skillId]??0)}%`}}/></div></div>)}</>;
}
