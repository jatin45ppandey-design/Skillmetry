"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, BrainCircuit, Code2, Layers3, ServerCog } from "lucide-react";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import type { CareerId } from "@skillmetry/shared/types/domain";

const careerVisuals = {
  "frontend-developer": { icon: Code2, color: "lilac", edition: "01" },
  "backend-developer": { icon: ServerCog, color: "apricot", edition: "02" },
  "ml-engineer": { icon: BrainCircuit, color: "sage", edition: "03" },
  "full-stack-developer": { icon: Layers3, color: "sky", edition: "04" }
} as const;

export function CareerChapterGallery() {
  const [selectedId, setSelectedId] = useState<CareerId>("frontend-developer");
  const selected = careers.find(career => career.id === selectedId) ?? careers[0];

  return (
    <div className="lc-careers">
      <div className="lc-career-shelf" role="group" aria-label="Preview career directions">
        {careers.map(career => {
          const artwork = careerVisuals[career.id as keyof typeof careerVisuals];
          const Icon = artwork.icon;
          const active = career.id === selectedId;
          return (
            <button
              type="button"
              key={career.id}
              aria-pressed={active}
              onClick={() => setSelectedId(career.id)}
              className={"lc-island lc-island--" + artwork.color + (active ? " is-selected" : "")}
            >
              <span className="lc-island-index">FIELD NOTES / {artwork.edition}</span>
              <span className="lc-island-art" aria-hidden="true">
                <span className="lc-orbit lc-orbit-a" />
                <span className="lc-orbit lc-orbit-b" />
                <Icon size={48} strokeWidth={1.45} />
              </span>
              <span className="lc-island-title">{career.title}</span>
              <span className="lc-island-action">{active ? "Currently previewing" : "Open preview"} <ArrowUpRight size={16} aria-hidden="true" /></span>
            </button>
          );
        })}
      </div>
      <div className="lc-career-preview" aria-live="polite">
        <div>
          <span className="lc-eyebrow">THE PATH YOU ARE EXPLORING</span>
          <h3>{selected.title}</h3>
          <p>{selected.subtitle}. Explore the foundational and applied skills in this curated pathway.</p>
          <div className="lc-skill-tags">
            {selected.skills.slice(0, 5).map(item => (
              <span key={item.skillId}>{skillById[item.skillId]?.label ?? item.skillId}</span>
            ))}
            {selected.skills.length > 5 ? <span>+{selected.skills.length - 5} more</span> : null}
          </div>
        </div>
        <Link className="lc-inline-action" href="/onboarding">
          Build my learning profile <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <p className="lc-disclaimer">This is a career preview, not a recommendation or an assessment of your skills. Your actual goals are selected during onboarding.</p>
    </div>
  );
}
