import { skillById } from "@skillmetry/shared/data/catalog";
import type { Career, SkillMap } from "@skillmetry/shared/types/domain";
import { clamp } from "@skillmetry/shared/lib/readiness";
export function SkillBars({career,skills,max=6}:{career:Career;skills:SkillMap;max?:number}) {
  return <>{career.skills.slice(0,max).map(({skillId}) => { const assessed = Object.hasOwn(skills,skillId); const score = assessed ? clamp(skills[skillId]) : null; return <div key={skillId} className="skill-line"><div className="skill-head"><strong>{skillById[skillId].label}</strong><span className="muted">{score === null ? "Not assessed" : `${score} / 100`}</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${score ?? 0}%`}}/></div></div>; })}</>;
}
