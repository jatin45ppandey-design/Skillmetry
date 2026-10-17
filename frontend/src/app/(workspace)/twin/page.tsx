import { DigitalTwinWorkspace } from "@/components/digital-twin-workspace";
import { DiagnosticTwinInsights } from "@/components/diagnostic-twin-insights";
import { LearningActivitySummary } from "@/components/learning-activity-summary";
import { SectionTitle } from "@/components/section-title";

export default function Twin() {
  return <>
    <SectionTitle
      eyebrow="Digital skill twin"
      title="Your evidence, made useful"
      description="Understand what trusted quizzes measure, what remains unknown, and which valid next step fits your selected learning goals."
    />
    <details className="v3-context-details">
      <summary>How is Skillmetry progress measured?</summary>
      <p>Only completed, server-graded quizzes become measured skill evidence. Unassessed skills remain unknown; browsing lessons or checking notes does not increase proficiency.</p>
    </details>
    <DigitalTwinWorkspace />
    <DiagnosticTwinInsights />
    <LearningActivitySummary />
  </>;
}
