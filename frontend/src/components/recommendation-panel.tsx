import Link from "next/link";
import { ArrowRight, Compass, RefreshCw, Sparkles } from "lucide-react";
import { skillById } from "@skillmetry/shared/data/catalog";
import { toolById } from "@skillmetry/shared/data/learning-catalog";
import { getResourceBrowseHref } from "@skillmetry/shared/lib/resource-intelligence";
import type { LearningRecommendation, LearningRecommendationPlan } from "@skillmetry/shared/types/domain";

const slotLabels = { now: "Now", next: "Next", later: "Later" } as const;
const actionLabels = {
  "take-assessment": "Take assessment",
  "strengthen-skill": "Strengthen skill",
  "review-prerequisite": "Review prerequisite",
  reassess: "Retake assessment",
  "explore-skill": "Explore skill",
  "explore-tool": "Explore tool"
} as const;

function recommendationTitle(recommendation: LearningRecommendation) {
  if (recommendation.kind === "tool" && recommendation.toolId) return toolById[recommendation.toolId].label;
  return recommendation.skillId ? skillById[recommendation.skillId]?.label ?? recommendation.skillId : "Learning focus";
}

function assessmentHref(recommendation: LearningRecommendation) {
  return recommendation.assessment.available && (recommendation.action === "take-assessment" || recommendation.action === "reassess") ? `/assessments?assessment=${encodeURIComponent(recommendation.assessment.assessmentId)}` : null;
}

function resourceHref(recommendation: LearningRecommendation) {
  if (recommendation.kind === "tool" && recommendation.toolId) return getResourceBrowseHref({ kind: "tool", toolId: recommendation.toolId });
  return recommendation.skillId ? getResourceBrowseHref({ kind: "skill", skillId: recommendation.skillId }) : null;
}

export function RecommendationPanel({ plan, onSelect }: { plan: LearningRecommendationPlan; onSelect: (recommendation: LearningRecommendation) => void }) {
  return <section className="recommendation-panel" aria-labelledby="recommendation-title"><div className="recommendation-panel-head"><div><span className="eyebrow">Personalized guidance</span><h2 id="recommendation-title">Your next moves</h2></div><Sparkles aria-hidden="true"/></div><div className="recommendation-slots">{(["now", "next", "later"] as const).map(slot => {
    const recommendation = plan[slot];
    if (!recommendation) return <div className="recommendation-card empty" key={slot}><span>{slotLabels[slot]}</span><p>{slot === "now" ? "Choose a career, skill, or tool to receive a grounded next step." : "More guidance appears as you add learning goals or complete trusted quizzes."}</p></div>;
    const href = assessmentHref(recommendation);
    const learningHref = resourceHref(recommendation);
    const action = href ? <Link href={href} className="text-link">{recommendation.action === "reassess" ? <RefreshCw aria-hidden="true"/> : <ArrowRight aria-hidden="true"/>}{recommendation.action === "reassess" ? "Retake assessment" : "Open assessment"}</Link> : learningHref ? <Link href={learningHref} className="text-link"><Compass aria-hidden="true"/>Learn resources</Link> : <button className="text-link button-link" type="button" onClick={() => onSelect(recommendation)}><Compass aria-hidden="true"/>View details</button>;
    if(slot!=="now")return <details className="recommendation-card sx-recommendation-details" key={slot}>
      <summary><span>{slotLabels[slot]}</span><strong>{recommendationTitle(recommendation)}</strong><small>{actionLabels[recommendation.action]}</small></summary>
      <div className="sx-recommendation-content"><p>{recommendation.explanation}</p><button className="text-button" type="button" onClick={()=>onSelect(recommendation)}>Inspect skill</button><div className="recommendation-card-foot">{action}</div></div>
    </details>;
    return <article className="recommendation-card" key={slot}><div className="recommendation-card-top"><span>{slotLabels[slot]}</span><button className="text-button" type="button" onClick={() => onSelect(recommendation)}>Details</button></div><h3>{recommendationTitle(recommendation)}</h3><strong>{actionLabels[recommendation.action]}</strong><p>{recommendation.explanation}</p><div className="recommendation-card-foot">{action}</div></article>;
  })}</div></section>;
}
