"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BrainCircuit, Code2, Layers3, ServerCog } from "lucide-react";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import type { CareerId } from "@skillmetry/shared/types/domain";

const careerIcons = {
  "frontend-developer": Code2,
  "backend-developer": ServerCog,
  "ml-engineer": BrainCircuit,
  "full-stack-developer": Layers3
} as const;

export function CareerChapterGallery() {
  const [selectedId, setSelectedId] = useState<CareerId>("backend-developer");
  const selected = careers.find(career => career.id === selectedId) ?? careers[0];
  const SelectedIcon = careerIcons[selected.id as keyof typeof careerIcons];

  return (
    <div className="mb-career-browser" data-ui>
      <div className="mb-career-browser__choices" role="group" aria-label="Preview career directions">
        {careers.map(career => {
          const Icon = careerIcons[career.id as keyof typeof careerIcons];
          const active = career.id === selectedId;
          return (
            <button
              type="button"
              key={career.id}
              aria-pressed={active}
              onClick={() => setSelectedId(career.id)}
              className={active ? "is-selected" : undefined}
            >
              <Icon aria-hidden="true" />
              <span><strong>{career.title}</strong><small>{career.subtitle}</small></span>
              <ArrowRight aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <article className="mb-career-browser__preview" aria-live="polite">
        <SelectedIcon aria-hidden="true" className="mb-career-browser__icon" />
        <h3>{selected.title}</h3>
        <p>Explore this path: {selected.subtitle}. The skills below come from Skillmetry&apos;s real curated catalog.</p>
        <dl>
          <div><dt>Foundation</dt><dd>{selected.skills.filter(item => skillById[item.skillId]?.group === "Foundation").map(item => skillById[item.skillId]?.label).join(", ") || "No foundation skills listed"}</dd></div>
          <div><dt>Core & applied</dt><dd>{selected.skills.filter(item => skillById[item.skillId]?.group !== "Foundation").slice(0, 5).map(item => skillById[item.skillId]?.label).join(", ")}</dd></div>
        </dl>
        <Link href={`/onboarding?career=${encodeURIComponent(selected.id)}`}>
          Choose this direction <ArrowRight aria-hidden="true" />
        </Link>
        <small>A career direction is editable. It is not an assessment or hiring prediction.</small>
      </article>
    </div>
  );
}
