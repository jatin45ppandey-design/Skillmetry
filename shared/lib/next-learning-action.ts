import { skillById } from "@skillmetry/shared/data/catalog";
import type { LearningRecommendationPlan } from "@skillmetry/shared/types/domain";

/** A single next action for product UX, derived only from catalog + trusted quiz evidence. */
export function resolveNextLearningAction(plan: LearningRecommendationPlan) {
  const now = plan.now;
  if (!now) {
    return { kind: "choose-goals" as const, title: "Choose a learning direction",
      label: "Set learning goals", href: "/settings", explanation:
        "Select a career, skill or tool before starting your personal learning path." };
  }
  const title = now.skillId ? skillById[now.skillId]?.label ?? "A learning skill" : "Your learning focus";
  if ((now.action === "take-assessment" || now.action === "reassess") && now.assessment.available) {
    return { kind: "assessment" as const, title, label: now.action === "reassess" ?
      "Retake assessment" : "Take baseline assessment",
      href: "/assessments?assessment=" + encodeURIComponent(now.assessment.assessmentId),
      explanation: now.explanation };
  }
  const target = now.skillId ? "?skill=" + encodeURIComponent(now.skillId)
    : now.toolId ? "?tool=" + encodeURIComponent(now.toolId) : "";
  return { kind: "learning" as const, title, label: "Explore learning resources",
    href: "/resources" + target, explanation: now.explanation };
}
