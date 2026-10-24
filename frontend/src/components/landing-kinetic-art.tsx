"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, Code2, Zap } from "lucide-react";
import styles from "@/app/landing-v2.module.css";

const cards = [
  { key: "learn", title: "Learn", detail: "Concepts made simple", icon: BookOpen },
  { key: "practice", title: "Practice", detail: "Build real skills", icon: Code2 },
  { key: "improve", title: "Improve", detail: "Track your progress", icon: ChartNoAxesColumnIncreasing },
  { key: "grow", title: "Grow", detail: "Be ready for what’s next", icon: Zap },
] as const;

export function LandingKineticArt() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const bounds = root.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      root.style.setProperty("--tilt-x", `${(x * 2.2).toFixed(2)}deg`);
      root.style.setProperty("--tilt-y", `${(y * -1.8).toFixed(2)}deg`);
      root.style.setProperty("--shift-x", `${(x * 7).toFixed(2)}px`);
      root.style.setProperty("--shift-y", `${(y * 6).toFixed(2)}px`);
    });
  };

  const reset = () => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty("--tilt-x", "0deg");
    root.style.setProperty("--tilt-y", "0deg");
    root.style.setProperty("--shift-x", "0px");
    root.style.setProperty("--shift-y", "0px");
  };

  return (
    <div ref={rootRef} className={styles.kineticArt} onPointerMove={move} onPointerLeave={reset} aria-label="Learn, practice, improve, and grow">
      <div className={styles.artGlow} aria-hidden="true" />
      <svg className={styles.artPath} viewBox="0 0 720 720" aria-hidden="true">
        <path d="M142 554C87 469 111 400 222 348c122-58 355-69 395-199 16-51-10-97-48-113" />
      </svg>
      <span className={`${styles.artOrb} ${styles.artOrbTop}`} aria-hidden="true" />
      <span className={`${styles.artOrb} ${styles.artOrbBottom}`} aria-hidden="true" />
      <div className={styles.cardStack}>
        {cards.map(({ key, title, detail, icon: Icon }, index) => (
          <div
            className={`${styles.learningCard} ${styles[`card${title}`]}`}
            key={key}
            style={{ "--card-index": index } as CSSProperties}
          >
            <span className={styles.cardIcon}><Icon aria-hidden="true" /></span>
            <span className={styles.cardCopy}><strong>{title}</strong><small>{detail}</small></span>
            <ArrowRight className={styles.cardArrow} aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className={styles.artFloor} aria-hidden="true" />
    </div>
  );
}
