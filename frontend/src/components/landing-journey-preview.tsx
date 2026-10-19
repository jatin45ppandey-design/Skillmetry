import Link from "next/link";
import { ArrowRight, BookOpenCheck, Compass, Fingerprint } from "lucide-react";
import { assessmentById } from "@skillmetry/shared/data/assessment-catalog";
import { careers } from "@skillmetry/shared/data/catalog";
import { EvidenceStatus } from "@/components/evidence-status";

export function LandingJourneyPreview() {
  const career = careers.find(item => item.id === "backend-developer") ?? careers[0];
  const assessment = assessmentById["javascript-foundations"];

  return (
    <section className="mb-loop-preview" aria-labelledby="mb-loop-title" data-ui>
      <ol className="mb-loop-preview__tabs" aria-label="Skillmetry learning loop">
        <li>Goal</li>
        <li>Evidence</li>
        <li>Next action</li>
      </ol>
      <header className="mb-loop-preview__header">
        <div>
          <h2 id="mb-loop-title">Goal → evidence → next action</h2>
        </div>
        <span>Real catalog data · no fictional score</span>
      </header>

      <div className="mb-loop-preview__body">
        <article className="mb-loop-row mb-loop-row--goal" data-ui>
          <span className="mb-loop-row__label"><Compass aria-hidden="true" /> Career goal</span>
          <div>
            <strong>{career.title}</strong>
            <p>{career.subtitle}</p>
          </div>
          <Link href="/careers">Explore paths <ArrowRight aria-hidden="true" /></Link>
        </article>

        <article className="mb-loop-row mb-loop-row--evidence" data-ui>
          <span className="mb-loop-row__label"><Fingerprint aria-hidden="true" /> Assessment evidence</span>
          <div>
            <strong>{assessment.title}</strong>
            <p>No trusted attempt exists in this example, so Skillmetry shows no score.</p>
          </div>
          <EvidenceStatus state="not-assessed" />
        </article>

        <article className="mb-loop-row mb-loop-row--next" data-ui>
          <span className="mb-loop-row__label"><BookOpenCheck aria-hidden="true" /> Next learning action</span>
          <div>
            <strong>Take the available baseline assessment</strong>
            <p>{assessment.questionCount} questions · about {assessment.estimatedMinutes} minutes</p>
          </div>
          <Link href={`/assessments?assessment=${encodeURIComponent(assessment.id)}`}>
            View assessment <ArrowRight aria-hidden="true" />
          </Link>
        </article>
      </div>

      <p className="mb-loop-preview__note">
        Learning activity stays separate from measured quiz evidence.
      </p>
    </section>
  );
}
