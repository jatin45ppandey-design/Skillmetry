"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, Code2, Compass, Layers3, ServerCog } from "lucide-react";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import type { CareerId } from "@skillmetry/shared/types/domain";
import styles from "@/app/landing-v2.module.css";

const careerIcons = {
  "frontend-developer": Code2,
  "backend-developer": ServerCog,
  "ml-engineer": BrainCircuit,
  "full-stack-developer": Layers3
} as const;

export function CareerChapterGallery() {
  const [selectedId, setSelectedId] = useState<CareerId>("backend-developer");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("javascript");
  const selected = careers.find(career => career.id === selectedId) ?? careers[0];
  // Phase 5 added catalog pathways beyond the four illustrated foundations.
  // A neutral compass keeps every real path explorable without inventing an
  // icon-specific meaning for it.
  const SelectedIcon = careerIcons[selected.id as keyof typeof careerIcons] ?? Compass;
  const selectedSkills = selected.skills.map(item => ({ ...item, skill: skillById[item.skillId] })).filter(item => item.skill);
  const foundations = selectedSkills.filter(item => item.skill.group === "Foundation");
  const applied = selectedSkills.filter(item => item.skill.group !== "Foundation");
  const availableAssessments = assessmentCatalog.filter(item => selected.skills.some(skill => skill.skillId === item.skillId));
  const selectedSkill = selectedSkills.find(item => item.skill.id === selectedSkillId) ?? selectedSkills[0];
  const selectedSkillAssessment = assessmentCatalog.find(item => item.skillId === selectedSkill?.skill.id);

  return (
    <div className={styles.careerBrowser}>
      <div className={styles.careerChoices} role="group" aria-label="Preview career blueprints">
        {careers.map(career => {
          const Icon = careerIcons[career.id as keyof typeof careerIcons] ?? Compass;
          const active = career.id === selectedId;
          return (
            <button
              type="button"
              key={career.id}
              aria-pressed={active}
              onClick={() => {
                setSelectedId(career.id);
                setSelectedSkillId(career.skills[0]?.skillId ?? "");
              }}
              className={active ? styles.careerChoiceActive : undefined}
            >
              <Icon aria-hidden="true" />
              <span><strong>{career.title}</strong><small>{career.skills.length} catalog skills</small></span>
              <ArrowRight aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <article className={styles.blueprint} aria-live="polite">
        <header className={styles.blueprintHeader}>
          <span><SelectedIcon aria-hidden="true" /></span>
          <div><h3>{selected.title}</h3><span>{selected.subtitle}</span></div>
          <Link href={`/onboarding?career=${encodeURIComponent(selected.id)}`}>
            Choose this direction <ArrowRight aria-hidden="true" />
          </Link>
        </header>

        <section className={styles.skillAtlas} aria-labelledby="skill-atlas-title">
          <header>
            <div><h4 id="skill-atlas-title">Skill & prerequisite atlas</h4><p>Select a catalog skill to inspect its real connections.</p></div>
            <strong>{selectedSkills.length} skills in this direction</strong>
          </header>
          <div className={styles.skillAtlasGraph} data-ui>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {applied.map((item, appliedIndex) => item.skill.prerequisites.map(prerequisiteId => {
                const foundationIndex = foundations.findIndex(entry => entry.skill.id === prerequisiteId);
                if (foundationIndex < 0) return null;
                const startY = ((foundationIndex + 0.5) / Math.max(1, foundations.length)) * 100;
                const endY = ((appliedIndex + 0.5) / Math.max(1, applied.length)) * 100;
                const active = selectedSkill?.skill.id === item.skill.id || selectedSkill?.skill.id === prerequisiteId;
                return <path key={`${prerequisiteId}-${item.skill.id}`}
                  className={active ? styles.skillEdgeActive : undefined}
                  d={`M 27 ${startY} C 43 ${startY}, 57 ${endY}, 73 ${endY}`}/>;
              }))}
            </svg>
            <div className={styles.skillAtlasColumn} role="group" aria-label="Foundation skills">
              <span>Foundations</span>
              {foundations.map(item => <button type="button" key={item.skill.id}
                aria-pressed={selectedSkill?.skill.id === item.skill.id}
                onClick={() => setSelectedSkillId(item.skill.id)}>{item.skill.label}</button>)}
            </div>
            <div className={`${styles.skillAtlasColumn} ${styles.skillAtlasApplied}`} role="group" aria-label="Core and applied skills">
              <span>Core & applied</span>
              {applied.map(item => <button type="button" key={item.skill.id}
                aria-pressed={selectedSkill?.skill.id === item.skill.id}
                onClick={() => setSelectedSkillId(item.skill.id)}>{item.skill.label}</button>)}
            </div>
          </div>
          {selectedSkill ? <div className={styles.skillAtlasDetail} key={selectedSkill.skill.id} aria-live="polite" data-ui>
            <div><strong>{selectedSkill.skill.label}</strong><span>{selectedSkill.skill.group}</span></div>
            <p>{selectedSkill.skill.description}</p>
            <small>{selectedSkill.skill.prerequisites.length
              ? `Prerequisites: ${selectedSkill.skill.prerequisites.map(id => skillById[id]?.label ?? id).join(", ")}.`
              : "No catalog prerequisite."}</small>
            {selectedSkillAssessment ? <Link href={`/assessments?assessment=${encodeURIComponent(selectedSkillAssessment.id)}`}>
              View assessment <ArrowRight aria-hidden="true" />
            </Link> : <Link href={`/resources?skill=${encodeURIComponent(selectedSkill.skill.id)}`}>
              Browse learning material <ArrowRight aria-hidden="true" />
            </Link>}
          </div> : null}
          <details className={styles.skillAtlasList}>
            <summary>Read every skill as a list</summary>
            <ul>{selectedSkills.map(item => <li key={item.skill.id}>
              <strong>{item.skill.label}</strong>
              <span>{item.skill.prerequisites.length
                ? `Catalog prerequisites include ${item.skill.prerequisites.map(id => skillById[id]?.label ?? id).join(", ")}.`
                : "The catalog lists no prerequisite for this skill."}</span>
            </li>)}</ul>
          </details>
        </section>

        <section className={styles.assessmentEntries} aria-labelledby="assessment-entry-title">
          <div><h4 id="assessment-entry-title">Assessment entry points</h4><p>Availability comes from the active assessment catalog.</p></div>
          <div>
            {availableAssessments.length ? availableAssessments.map(assessment => (
              <Link key={assessment.id} href={`/assessments?assessment=${encodeURIComponent(assessment.id)}`}>
                <CheckCircle2 aria-hidden="true" /> {assessment.title}
              </Link>
            )) : <span>No supported assessment is active for this path yet.</span>}
          </div>
        </section>

        <p className={styles.blueprintNote}>A career direction is editable. It is not an assessment or hiring prediction.</p>
      </article>
    </div>
  );
}
