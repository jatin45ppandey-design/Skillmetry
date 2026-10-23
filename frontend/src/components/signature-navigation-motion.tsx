"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SignatureArea = "home" | "path" | "learn" | "practice" | "progress";

export type SignatureTransition = {
  area: SignatureArea;
  id: number;
  phase: "leaving" | "arriving";
  variant: "first" | "repeat";
};

const transitionDuration = {
  first: 620,
  repeat: 420
} as const;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Keeps navigation feedback decorative and cancellable. Routes change through Next immediately;
 * this state only gives the selected learning area a short, recognisable visual hand-off.
 */
export function useSignatureNavigation(
  pathname: string,
  areaForPathname: (path: string) => SignatureArea | null
) {
  const [transition, setTransition] = useState<SignatureTransition | null>(null);
  const previousPathname = useRef<string | null>(null);
  const expectedArea = useRef<SignatureArea | null>(null);
  const timer = useRef<number | null>(null);
  const sequence = useRef(0);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const finishAfter = useCallback((next: SignatureTransition) => {
    clearTimer();
    timer.current = window.setTimeout(() => {
      setTransition(current => current?.id === next.id ? null : current);
      timer.current = null;
    }, transitionDuration[next.variant]);
  }, [clearTimer]);

  const begin = useCallback((area: SignatureArea) => {
    expectedArea.current = area;
    if (prefersReducedMotion()) {
      clearTimer();
      setTransition(null);
      return;
    }

    const storageKey = `skillmetry.signature.${area}`;
    const variant = window.sessionStorage.getItem(storageKey) ? "repeat" : "first";
    window.sessionStorage.setItem(storageKey, "seen");
    const next: SignatureTransition = { area, id: ++sequence.current, phase: "leaving", variant };
    clearTimer();
    setTransition(next);
    finishAfter(next);
  }, [clearTimer, finishAfter]);

  useEffect(() => {
    const prior = previousPathname.current;
    previousPathname.current = pathname;
    if (!prior) return;

    const area = areaForPathname(pathname);
    if (!area) return;

    if (expectedArea.current === area) {
      expectedArea.current = null;
      setTransition(current => {
        if (!current || current.area !== area) return current;
        const arriving = { ...current, phase: "arriving" as const };
        finishAfter(arriving);
        return arriving;
      });
      return;
    }

    if (areaForPathname(prior) !== area) begin(area);
  }, [areaForPathname, begin, finishAfter, pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (!mediaQuery.matches) return;
      clearTimer();
      setTransition(null);
    };
    mediaQuery.addEventListener("change", onChange);
    return () => {
      clearTimer();
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [clearTimer]);

  return { beginSignatureNavigation: begin, signatureTransition: transition };
}

function SignatureGlyph({ area }: Pick<SignatureTransition, "area">) {
  switch (area) {
    case "home":
      return <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true"><path d="M10 29 32 11l22 18v23H39V37H25v15H10Z" /><path d="M20 52V31h24v21" /></svg>;
    case "path":
      return <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true"><path d="M9 48c12 0 9-27 23-27s10 27 23 27" /><path d="m48 40 7 8-7 8" /><circle cx="10" cy="48" r="3" /></svg>;
    case "learn":
      return <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true"><path d="M32 17c-8-5-16-4-22 0v31c7-4 15-4 22 1" /><path d="M32 17c8-5 16-4 22 0v31c-7-4-15-4-22 1" /><path d="M32 17v32" /></svg>;
    case "practice":
      return <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true"><path d="M25 16 12 32l13 16" /><path d="m39 16 13 16-13 16" /><path d="m36 12-8 40" /></svg>;
    case "progress":
      return <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true"><path d="M12 52V12" /><path d="M12 52h42" /><path d="m17 43 11-12 9 6 15-20" /><circle cx="17" cy="43" r="2" /><circle cx="28" cy="31" r="2" /><circle cx="37" cy="37" r="2" /><circle cx="52" cy="17" r="2" /></svg>;
  }
}

export function SignatureNavigationMotion({ transition }: { transition: SignatureTransition | null }) {
  if (!transition) return null;

  return (
    <div
      className="signature-navigation-motion"
      data-area={transition.area}
      data-phase={transition.phase}
      data-variant={transition.variant}
      aria-hidden="true"
    >
      <SignatureGlyph key={`${transition.area}-${transition.id}`} area={transition.area} />
    </div>
  );
}
