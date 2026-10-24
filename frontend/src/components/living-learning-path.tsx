"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass } from "lucide-react";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import type { CareerId } from "@skillmetry/shared/types/domain";
import styles from "@/app/landing-v2.module.css";

const nodePositions = [
  { x: 74, y: 238 },
  { x: 238, y: 108 },
  { x: 406, y: 252 },
  { x: 574, y: 82 },
  { x: 756, y: 226 },
  { x: 925, y: 118 }
] as const;

type LivingLearningPathProps = { mode: "hero" | "explorer" };

export function LivingLearningPath({ mode }: LivingLearningPathProps) {
  const [careerId, setCareerId] = useState<CareerId>("frontend-developer");
  const [selectedSkillId, setSelectedSkillId] = useState("javascript");
  const careerIndex = Math.max(0, careers.findIndex(item => item.id === careerId));
  const career = careers[careerIndex] ?? careers[0];
  const visibleSkills = useMemo(() => career.skills.slice(0, mode === "hero" ? 5 : 6)
    .map(item => ({ ...item, skill: skillById[item.skillId] }))
    .filter(item => item.skill), [career, mode]);
  const selectedSkill = visibleSkills.find(item => item.skill.id === selectedSkillId) ?? visibleSkills[0];
  const assessment = assessmentCatalog.find(item => item.skillId === selectedSkill?.skill.id) ?? null;
  const pathPoints = visibleSkills.map((_, index) => `${nodePositions[index].x},${nodePositions[index].y}`).join(" ");

  const chooseCareer = (nextId: CareerId) => {
    const nextCareer = careers.find(item => item.id === nextId) ?? careers[0];
    setCareerId(nextCareer.id);
    setSelectedSkillId(nextCareer.skills[0]?.skillId ?? "");
  };

  const moveCareer = (direction: -1 | 1) => {
    const nextIndex = (careerIndex + direction + careers.length) % careers.length;
    chooseCareer(careers[nextIndex].id);
  };

  return <div className={`${styles.pathExperience} ${mode === "hero" ? styles.pathHero : styles.pathExplorer}`}>
    <div className={styles.pathTopline}>
      <div><span className={styles.liveMark}><i /> Live curriculum path</span><small>Catalog-backed</small></div>
      <span className={styles.pathCount}>{String(careerIndex + 1).padStart(2, "0")} / {careers.length}</span>
    </div>

    {mode === "explorer" ? <div className={styles.careerControl}>
      <div className={styles.careerTitleBlock}>
        <span>Selected direction</span>
        <h3>{career.title}</h3>
        <p>{career.subtitle}</p>
      </div>
      <div className={styles.careerPicker}>
        <label htmlFor="career-path-select">Explore all careers</label>
        <div>
          <button type="button" onClick={() => moveCareer(-1)} aria-label="Previous career"><ArrowLeft aria-hidden="true" /></button>
          <select id="career-path-select" value={career.id} onChange={event => chooseCareer(event.target.value as CareerId)}>
            {careers.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <button type="button" onClick={() => moveCareer(1)} aria-label="Next career"><ArrowRight aria-hidden="true" /></button>
        </div>
      </div>
    </div> : <div className={styles.heroPathTitle}>
      <span>Selected direction</span><strong>{career.title}</strong><small>{career.subtitle}</small>
    </div>}

    <div className={styles.pathStage} key={career.id}>
      <svg viewBox="0 0 1000 340" preserveAspectRatio="none" aria-hidden="true">
        <polyline className={styles.pathShadow} points={pathPoints} />
        <polyline className={styles.pathStroke} points={pathPoints} pathLength="1" />
      </svg>
      {visibleSkills.map((item, index) => {
        const active = item.skill.id === selectedSkill?.skill.id;
        const position = nodePositions[index];
        return <button
          type="button"
          key={item.skill.id}
          className={`${styles.pathNode} ${active ? styles.pathNodeActive : ""}`}
          style={{ left: `${position.x / 10}%`, top: `${position.y / 3.4}%`, animationDelay: `${180 + index * 90}ms` } as CSSProperties}
          aria-pressed={active}
          onClick={() => setSelectedSkillId(item.skill.id)}
        >
          <span>{active ? <Check aria-hidden="true" /> : String(index + 1).padStart(2, "0")}</span>
          <strong>{item.skill.label}</strong>
        </button>;
      })}
    </div>

    <div className={styles.mobilePath} aria-label={`${career.title} learning path`}>
      {visibleSkills.slice(0, 5).map((item, index) => {
        const active = item.skill.id === selectedSkill?.skill.id;
        return <button type="button" key={item.skill.id} aria-pressed={active} onClick={() => setSelectedSkillId(item.skill.id)}>
          <span>{active ? <Check aria-hidden="true" /> : String(index + 1).padStart(2, "0")}</span>
          <strong>{item.skill.label}</strong><small>{item.skill.group}</small>
        </button>;
      })}
    </div>

    {selectedSkill ? <div className={styles.pathDetail} key={`${career.id}-${selectedSkill.skill.id}`} aria-live="polite">
      <span className={styles.detailIcon}>{assessment ? <Compass aria-hidden="true" /> : <BookOpen aria-hidden="true" />}</span>
      <div><small>{selectedSkill.skill.group} · {selectedSkill.weight}% of this path</small><strong>{selectedSkill.skill.label}</strong><p>{selectedSkill.skill.description}</p></div>
      {mode === "explorer" ? <Link href={`/onboarding?career=${encodeURIComponent(career.id)}`}>Open this career <ArrowRight aria-hidden="true" /></Link>
        : <a href="#career-explorer">Explore the path <ArrowRight aria-hidden="true" /></a>}
    </div> : null}
  </div>;
}
