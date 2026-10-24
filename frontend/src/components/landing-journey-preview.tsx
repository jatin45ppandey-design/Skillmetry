"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, BookOpenCheck, CodeXml, Compass, Fingerprint, ScanSearch } from "lucide-react";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import type { CareerId } from "@skillmetry/shared/types/domain";
import styles from "@/app/landing-v2.module.css";

const stages = ["career", "learn", "practice", "evidence", "next"] as const;
type Stage = (typeof stages)[number];

const stageCopy: Record<Stage, { label: string; title: string; copy: string }> = {
  career: { label: "Career", title: "Choose a direction", copy: "A direction gives the catalog a useful context. It is editable and does not create evidence." },
  learn: { label: "Learn", title: "Open the relevant concept", copy: "Resources explain the selected topic without creating a proficiency claim." },
  practice: { label: "Practice", title: "Work through the idea", copy: "Guided practice supports learning activity. It remains separate from quiz evidence." },
  evidence: { label: "Evidence", title: "Keep unknowns visible", copy: "No trusted attempt in this preview means Not assessed, never an invented zero." },
  next: { label: "Next step", title: "Take one grounded action", copy: "When a supported assessment exists, it is the route to numerical evidence." }
};

export function LandingJourneyPreview() {
  const [activeStage, setActiveStage] = useState<Stage>("career");
  const [careerId, setCareerId] = useState<CareerId>("backend-developer");
  const career = careers.find(item => item.id === careerId) ?? careers[0];
  const focusSkill = skillById[career.skills[0]?.skillId] ?? skillById.javascript;
  const assessment = useMemo(() => assessmentCatalog.find(item => item.skillId === focusSkill.id) ?? null, [focusSkill.id]);
  const stage = stageCopy[activeStage];

  return <section className={styles.journeyCanvas} id="learning-canvas" aria-labelledby="journey-canvas-title" data-stage={activeStage}>
    <header className={styles.canvasHeader}>
      <div><p>Illustrative product walkthrough</p><h2 id="journey-canvas-title">A connected learning canvas</h2></div>
      <span>Catalog-backed &middot; no fictional score</span>
    </header>

    <div className={styles.canvasControls} role="tablist" aria-label="Explore the learning journey">
      {stages.map((item, index) => <button key={item} type="button" role="tab" aria-selected={activeStage === item}
        aria-controls="journey-canvas-panel" onClick={() => setActiveStage(item)}>
        <i aria-hidden="true">0{index + 1}</i>{stageCopy[item].label}
      </button>)}
    </div>

    <div className={styles.canvasNetwork} aria-hidden="true">
      <svg viewBox="0 0 760 248" preserveAspectRatio="none"><path d="M18 166C116 166 120 48 220 48s102 152 202 152 87-122 190-122h130" /><path d="M18 207c88 0 120-78 202-78s99 82 202 82 101-43 190-43h130" /></svg>
      {stages.map((item, index) => <span key={item} className={activeStage === item ? styles.canvasNodeActive : undefined} style={{ "--node-index": index } as CSSProperties} />)}
    </div>

    <div className={styles.canvasPanel} id="journey-canvas-panel" role="tabpanel" key={`${activeStage}-${career.id}`} aria-live="polite">
      <div className={styles.canvasPanelTop}><span>{stage.label}</span><strong>{stage.title}</strong><p>{stage.copy}</p></div>
      {activeStage === "career" ? <div className={styles.canvasCareerChoice}>
        <Compass aria-hidden="true" /><label>Career direction<select value={career.id} onChange={event => setCareerId(event.target.value as CareerId)}>{careers.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <div><strong>{career.title}</strong><small>{career.skills.length} catalog skills &middot; {career.subtitle}</small></div>
        <Link href={`/onboarding?career=${encodeURIComponent(career.id)}`}>Use this direction <ArrowRight aria-hidden="true" /></Link>
      </div> : null}
      {activeStage === "learn" ? <div className={styles.canvasActionState}><BookOpenCheck aria-hidden="true" /><div><span>Focus skill</span><strong>{focusSkill.label}</strong><small>{focusSkill.description}</small></div><Link href={`/resources?skill=${encodeURIComponent(focusSkill.id)}`}>Browse resources <ArrowRight aria-hidden="true" /></Link></div> : null}
      {activeStage === "practice" ? <div className={styles.canvasActionState}><CodeXml aria-hidden="true" /><div><span>Topic practice</span><strong>Try {focusSkill.label} in context</strong><small>Practice activity is not a quiz result.</small></div><Link href={`/practice?skill=${encodeURIComponent(focusSkill.id)}`}>Open practice <ArrowRight aria-hidden="true" /></Link></div> : null}
      {activeStage === "evidence" ? <div className={styles.canvasEvidenceState}><Fingerprint aria-hidden="true" /><div><span>Assessment state</span><strong>Not assessed</strong><small>This preview has no trusted attempt, so it shows no percentage.</small></div><em>Unknown, not 0%</em></div> : null}
      {activeStage === "next" ? <div className={styles.canvasActionState}><ScanSearch aria-hidden="true" /><div><span>Grounded next step</span><strong>{assessment ? `Check ${assessment.title}` : `Keep learning ${focusSkill.label}`}</strong><small>{assessment ? `${assessment.questionCount} supported questions can establish evidence.` : "No supported assessment is currently available for this focus."}</small></div><Link href={assessment ? `/assessments?assessment=${encodeURIComponent(assessment.id)}` : `/resources?skill=${encodeURIComponent(focusSkill.id)}`}>{assessment ? "View assessment" : "Continue learning"} <ArrowRight aria-hidden="true" /></Link></div> : null}
    </div>
    <p className={styles.canvasNote}>The path changes context as you move. Learning activity stays separate from measured quiz evidence.</p>
  </section>;
}
