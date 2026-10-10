"use client";
import { SectionTitle } from "@/components/section-title";
import { RoadmapGraph } from "@/components/roadmap-graph";
import { selectCareer } from "@/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";
export default function Roadmap(){const {careerId,skills}=useSkillmetry();const career=selectCareer(careerId);return <><SectionTitle eyebrow="Adaptive roadmap" title={`${career.title} pathway`} description="A skill dependency graph tuned to your profile. Scroll to zoom, drag to explore."/><div className="row" style={{gap:14,flexWrap:"wrap",marginBottom:15}}><span className="tag">Green border: stronger estimate</span><span className="tag">Cyan border: available next</span><span className="tag">Neutral: prerequisite pending</span></div><RoadmapGraph career={career} proficiency={skills}/><p className="note" style={{marginTop:18}}>Demo logic: prerequisites below 50/100 are treated as pending; strong estimates begin at 70/100. These thresholds can be tuned and verified later.</p></>}
