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
    <section className="studio-evidence-cover" aria-label="Evidence journal introduction">
      <div>
        <span className="studio-kicker">CHAPTER 04 / THE EVIDENCE JOURNAL</span>
        <h2>Keep a record of <em>what&apos;s real.</em></h2>
        <p>Every completed, server-graded quiz becomes a dated entry. Explore actual evidence, revisit the same skill and distinguish missing results from measured zeros.</p>
      </div>
      <div className="studio-evidence-cover-art" aria-hidden="true">
        <span className="studio-journal-sheet studio-journal-sheet--back"/>
        <span className="studio-journal-sheet studio-journal-sheet--front"><span>01</span><i/><i/><i/></span>
        <span className="studio-journal-seal">MEASURED<br />NOT GUESSED</span>
      </div>
    </section>
    <DigitalTwinWorkspace />
    <DiagnosticTwinInsights />
  </>;
}
