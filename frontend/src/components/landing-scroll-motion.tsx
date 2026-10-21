"use client";
import { useEffect } from "react";
/** Reveals enhance visible content; never hide content before JS or observer support. */
export function LandingScrollMotion() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sections = document.querySelectorAll<HTMLElement>(".lc-site [data-reveal], .mb-landing [data-reveal], .atlas-site [data-reveal]");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sx-reveal-active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .09, rootMargin: "0px 0px -24px 0px" });
    sections.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return null;
}
