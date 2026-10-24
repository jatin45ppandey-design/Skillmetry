"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import styles from "@/app/landing-v2.module.css";

export function LandingKineticArt() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const bounds = root.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      root.style.setProperty("--pointer-x", x.toFixed(3));
      root.style.setProperty("--pointer-y", y.toFixed(3));
    });
  };

  const reset = () => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty("--pointer-x", "0");
    root.style.setProperty("--pointer-y", "0");
  };

  return <div ref={rootRef} className={styles.kineticArt} onPointerMove={move} onPointerLeave={reset} aria-hidden="true">
    <div className={styles.artIndex}><span>01</span><i /></div>
    <svg className={styles.artCanvas} viewBox="0 0 720 720" role="presentation">
      <circle className={styles.artOrbit} cx="371" cy="349" r="284" />
      <circle className={styles.artOrbitInner} cx="371" cy="349" r="194" />
      <path className={styles.artBackPage} d="M208 147C282 108 353 91 409 94c21 87 28 168 20 243-10 94-44 178-100 251-61-42-111-94-148-156-42-72-65-152-69-240 28-18 60-33 96-45Z" />
      <path className={styles.artFrontPage} d="M408 94c69 13 139 43 199 88-6 91-31 173-74 245-39 64-90 118-153 161-40-70-57-148-51-233 6-89 32-176 79-261Z" />
      <path className={styles.artFold} d="M409 94c-25 97-37 184-36 261 1 89 4 167 7 233" />
      <path className={styles.artCut} d="M126 363c103-53 208-62 315-27 61 20 116 55 164 105" />
      <circle className={styles.artDot} cx="126" cy="363" r="13" />
      <circle className={styles.artDotEnd} cx="605" cy="441" r="13" />
    </svg>
    <div className={styles.artType}><span>make</span><strong>room</strong><span>to grow</span></div>
    <div className={styles.artCaption}><span>Ideas open</span><i /><span>when you do</span></div>
  </div>;
}
