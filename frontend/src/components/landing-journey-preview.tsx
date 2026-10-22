"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpenCheck, Compass, Fingerprint } from "lucide-react";
import { assessmentById } from "@skillmetry/shared/data/assessment-catalog";
import { careers } from "@skillmetry/shared/data/catalog";
import styles from "@/app/landing-v2.module.css";

const stages = ["goal", "evidence", "action"] as const;
type Stage = (typeof stages)[number];

const stageContext: Record<Stage, { label: string; detail: string }> = {
  goal: { label: "Start with direction", detail: "A chosen path changes context, not your evidence." },
  evidence: { label: "Check what is known", detail: "No trusted attempt stays explicitly Not assessed." },
  action: { label: "Move one step", detail: "The next link uses the real assessment catalog." }
};

export function LandingJourneyPreview() {
  const [activeStage, setActiveStage] = useState<Stage>("goal");
  const career = careers.find(item => item.id === "backend-developer") ?? careers[0];
  const assessment = assessmentById["javascript-foundations"];

  return (
    <section className={styles.loopPreview} aria-labelledby="loop-preview-title" data-stage={activeStage}>
      <header className={styles.loopHeader}>
        <div>
          <h2 id="loop-preview-title">Goal → evidence → action</h2>
        </div>
        <span>Catalog data · no fictional score</span>
      </header>

      <div className={styles.loopStageTabs} role="group" aria-label="Preview a learning decision">
        {stages.map((stage) => (
          <button key={stage} type="button" aria-pressed={activeStage === stage} onClick={() => setActiveStage(stage)}>
            {stage === "goal" ? "Goal" : stage === "evidence" ? "Evidence" : "Next action"}
          </button>
        ))}
      </div>

      <div className={styles.loopStageContext} role="status" aria-live="polite" key={activeStage}>
        <strong>{stageContext[activeStage].label}</strong>
        <span>{stageContext[activeStage].detail}</span>
      </div>

      <div className={styles.loopCanvas} data-ui>
        <div className={styles.loopRail} aria-hidden="true"><i /><i /><i /></div>

        <article className={`${styles.loopCard} ${styles.loopGoal} ${activeStage === "goal" ? styles.loopCardActive : ""}`} aria-current={activeStage === "goal" ? "step" : undefined} data-ui>
          <span className={styles.loopIcon}><Compass aria-hidden="true" /></span>
          <div><p>Career goal</p><h3>{career.title}</h3><span>{career.subtitle}</span></div>
          <Link href="/careers" aria-label="Explore career paths">Explore <ArrowRight aria-hidden="true" /></Link>
        </article>

        <article className={`${styles.loopCard} ${styles.loopEvidence} ${activeStage === "evidence" ? styles.loopCardActive : ""}`} aria-current={activeStage === "evidence" ? "step" : undefined} data-ui>
          <span className={styles.loopIcon}><Fingerprint aria-hidden="true" /></span>
          <div><p>Assessment evidence</p><h3>{assessment.title}</h3><span>No trusted attempt in this preview</span></div>
          <strong>Not assessed</strong>
        </article>

        <article className={`${styles.loopCard} ${styles.loopAction} ${activeStage === "action" ? styles.loopCardActive : ""}`} aria-current={activeStage === "action" ? "step" : undefined} data-ui>
          <span className={styles.loopIcon}><BookOpenCheck aria-hidden="true" /></span>
          <div><p>Grounded next action</p><h3>Take the baseline assessment</h3><span>{assessment.questionCount} questions · about {assessment.estimatedMinutes} minutes</span></div>
          <Link href={`/assessments?assessment=${encodeURIComponent(assessment.id)}`} aria-label={`View ${assessment.title}`}>Open <ArrowRight aria-hidden="true" /></Link>
        </article>
      </div>

      <p className={styles.loopNote}>Learning activity stays separate from measured quiz evidence.</p>
    </section>
  );
}
