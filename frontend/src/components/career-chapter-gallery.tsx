"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpenCheck, BrainCircuit, Code2, Layers3, ServerCog } from "lucide-react";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { buildCareerAtlas } from "@/lib/career-atlas";
import type { CareerId } from "@skillmetry/shared/types/domain";

const careerVisuals = {
  "frontend-developer": { icon: Code2, accent: "lilac", no: "01" },
  "backend-developer": { icon: ServerCog, accent: "apricot", no: "02" },
  "ml-engineer": { icon: BrainCircuit, accent: "sage", no: "03" },
  "full-stack-developer": { icon: Layers3, accent: "sky", no: "04" }
} as const;

export function CareerChapterGallery() {
  const [selectedId, setSelectedId] = useState<CareerId>("backend-developer");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const selected = careers.find(career => career.id === selectedId) ?? careers[0];
  const atlas = useMemo(() => buildCareerAtlas(selected), [selected]);
  const focus = atlas.nodes.find(node => node.id === selectedSkillId) ?? atlas.nodes.find(node => node.assessmentId) ?? atlas.nodes[0];
  const focusSkill = skillById[focus.id];
  const related = new Set([
    focus.id,
    ...focusSkill.prerequisites,
    ...atlas.edges.filter(edge => edge.from === focus.id).map(edge => edge.to)
  ]);
  const position = new Map(atlas.nodes.map(node => [node.id, node]));

  return (
    <div className={"lc-explorer lc-explorer--" + careerVisuals[selected.id as keyof typeof careerVisuals].accent}>
      <div className="lc-explorer-head">
        <div>
          <span className="lc-eyebrow">INTERACTIVE CAREER EXPLORER / REAL CATALOG</span>
          <h3>Pick a direction. <em>See what connects.</em></h3>
        </div>
        <span className="lc-explorer-edition">FIELD GUIDE / 01</span>
      </div>

      <div className="lc-career-switcher" role="group" aria-label="Explore career directions">
        {careers.map(career => {
          const artwork = careerVisuals[career.id as keyof typeof careerVisuals];
          const Icon = artwork.icon;
          const active = career.id === selectedId;
          return (
            <button
              key={career.id}
              type="button"
              className={"lc-career-choice lc-career-choice--" + artwork.accent + (active ? " is-active" : "")}
              aria-pressed={active}
              onClick={() => { setSelectedId(career.id); setSelectedSkillId(null); }}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{career.title}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="lc-atlas-summary" aria-live="polite">
        <div>
          <span className="lc-atlas-index">YOU ARE EXPLORING / {careerVisuals[selected.id as keyof typeof careerVisuals].no}</span>
          <h4>{selected.title}</h4>
          <p>{selected.subtitle}. Select a skill to understand how it fits.</p>
        </div>
        <span className="lc-atlas-count">{atlas.nodes.length} <small>connected skills</small></span>
      </div>

      <div className="lc-atlas-field" aria-label={"Canonical skill prerequisite map for " + selected.title}>
        <div className="lc-atlas-axes" aria-hidden="true"><span>FOUNDATIONS</span><span>CORE</span><span>APPLICATION</span></div>
        <svg className="lc-atlas-lines" viewBox="0 0 1000 470" preserveAspectRatio="none" aria-hidden="true">
          {atlas.edges.map(edge => {
            const from = position.get(edge.from);
            const to = position.get(edge.to);
            if (!from || !to) return null;
            const x1 = from.x * 10, y1 = from.y * 4.7, x2 = to.x * 10, y2 = to.y * 4.7;
            const active = related.has(edge.from) && related.has(edge.to);
            return <path key={edge.from + "-" + edge.to}
              d={`M ${x1} ${y1} C ${x1 + (x2 - x1) * .52} ${y1}, ${x2 - (x2 - x1) * .52} ${y2}, ${x2} ${y2}`}
              className={active ? "lc-atlas-edge is-linked" : "lc-atlas-edge"}
            />;
          })}
        </svg>
        {atlas.nodes.map(node => (
          <button key={node.id} type="button"
            className={"lc-atlas-node" + (node.id === focus.id ? " is-focused" : "") + (related.has(node.id) ? " is-linked" : " is-muted")}
            style={{ left: node.x + "%", top: node.y + "%" }}
            aria-pressed={node.id === focus.id}
            aria-label={node.label + ", " + node.group + (node.assessmentId ? ", assessment available" : ", no assessment yet")}
            onClick={() => setSelectedSkillId(node.id)}
          >
            <span className="lc-node-symbol" aria-hidden="true">{node.assessmentId ? "✳" : node.required ? "↗" : "·"}</span>
            <span>{node.label}</span>
          </button>
        ))}
        <div className="lc-atlas-watermark" aria-hidden="true">SKILL<br/>ATLAS</div>
      </div>

      <div className="lc-atlas-mobile-list" role="group" aria-label="Select a skill">
        {atlas.nodes.map(node => (
          <button key={node.id} type="button" aria-pressed={node.id === focus.id}
            className={node.id === focus.id ? "is-focused" : ""}
            onClick={() => setSelectedSkillId(node.id)}>{node.label}</button>
        ))}
      </div>

      <div className="lc-atlas-focus" aria-live="polite">
        <span className="lc-focus-marker"><BookOpenCheck size={24} aria-hidden="true" /></span>
        <div className="lc-focus-copy">
          <span className="lc-eyebrow">SELECTED SKILL / {focus.group.toUpperCase()}</span>
          <h5>{focus.label}</h5>
          <p>{focusSkill.description}</p>
          <p className="lc-focus-relation">{focusSkill.prerequisites.length
            ? "Builds on: " + focusSkill.prerequisites.map(id => skillById[id]?.label ?? id).join(" · ")
            : "Foundation skill · no listed prerequisites"}</p>
        </div>
        <div className="lc-focus-actions">
          <span className="lc-availability">{focus.assessmentId ? "Assessment available" : "No quiz available for this skill yet"}</span>
          <Link href={focus.assessmentId ? "/assessments?assessment=" + encodeURIComponent(focus.assessmentId) : "/resources?skill=" + encodeURIComponent(focus.id)}
            className="lc-inline-action">
            {focus.assessmentId ? "View assessment" : "Explore resources"} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="lc-explorer-footer">
        <p>Lines represent actual prerequisites. The map is a catalog preview, <strong>not a score, skill assessment or readiness prediction.</strong></p>
        <Link href={"/onboarding?career=" + encodeURIComponent(selected.id)}>Make this my learning direction <ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
