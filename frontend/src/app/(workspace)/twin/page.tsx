import { DigitalTwinWorkspace } from "@/components/digital-twin-workspace";
import { DiagnosticTwinInsights } from "@/components/diagnostic-twin-insights";
import { SectionTitle } from "@/components/section-title";

export default function Twin() {
  return <>
    <SectionTitle
      eyebrow="Digital skill twin"
      title="Your evidence, made useful"
      description="Understand what trusted quizzes measure, what remains unknown, and which valid next step fits your selected learning goals."
    />
    <DigitalTwinWorkspace />
    <DiagnosticTwinInsights />
  </>;
}
