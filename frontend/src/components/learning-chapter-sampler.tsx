"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, BookOpenCheck, Check, Fingerprint, GitBranch, LockKeyhole } from "lucide-react";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { skillById } from "@skillmetry/shared/data/catalog";

type Chapter = "assess" | "navigate" | "reflect";

const samples = [
  { key: "assess", number: "01", name: "Assess", color: "peach" },
  { key: "navigate", number: "02", name: "Navigate", color: "mint" },
  { key: "reflect", number: "03", name: "Reflect", color: "lilac" }
] as const;

export function LearningChapterSampler() {
  const [chapter, setChapter] = useState<Chapter>("assess");
  const sampleQuiz = assessmentCatalog.find(item => item.skillId === "sql") ?? assessmentCatalog[0];
  const exampleSkill = skillById["react"];
  return (
    <section className="lc-sampler" id="inside" aria-labelledby="lc-sampler-title">
      <div className="lc-sampler-heading">
        <span className="lc-eyebrow">CHAPTER 03 / OPEN THE STUDY BOOK</span>
        <h2 id="lc-sampler-title">Less guessing.<br/><em>More doing.</em></h2>
        <p>Try the three views below. These are previews of actual product workflows—not fake student performance data.</p>
      </div>
      <div className="lc-sampler-tabs" role="group" aria-label="Explore learning experiences">
        {samples.map(sample => (
          <button key={sample.key} type="button"
            aria-pressed={chapter === sample.key}
            className={"lc-sampler-tab" + (chapter === sample.key ? " is-active" : "")}
            onClick={() => setChapter(sample.key)}>
            <span>{sample.number}</span> {sample.name}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>

      <div className={"lc-book lc-book--" + chapter} aria-live="polite">
        <div className="lc-book-spine" aria-hidden="true" />
        <div className="lc-book-page lc-book-page--cover">
          <span className="lc-book-folio">SKILLMETRY / STUDY NOTES</span>
          {chapter === "assess" ? <>
            <BookOpenCheck className="lc-book-icon" size={47} strokeWidth={1.4} aria-hidden="true"/>
            <h3>Start with<br/>a baseline.</h3>
            <p>{sampleQuiz.title}</p>
            <span className="lc-book-annotation">{sampleQuiz.questionCount} questions · about {sampleQuiz.estimatedMinutes} minutes</span>
          </> : chapter === "navigate" ? <>
            <GitBranch className="lc-book-icon" size={47} strokeWidth={1.4} aria-hidden="true"/>
            <h3>Follow<br/>the why.</h3>
            <p>{exampleSkill.label}</p>
            <span className="lc-book-annotation">Actual prerequisite relationships</span>
          </> : <>
            <Fingerprint className="lc-book-icon" size={47} strokeWidth={1.4} aria-hidden="true"/>
            <h3>Keep the<br/>evidence.</h3>
            <p>A record you can revisit</p>
            <span className="lc-book-annotation">No predicted readiness scores</span>
          </>}
        </div>
        <div className="lc-book-page lc-book-page--content">
          <span className="lc-book-folio">INSIDE THE EXPERIENCE / {samples.find(sample => sample.key === chapter)?.number}</span>
          {chapter === "assess" ? <>
            <h4>Your first measured starting point.</h4>
            <p>A supported skill quiz opens in Focus Mode. It is graded on the server, then saved to your own assessment history.</p>
            <div className="lc-book-row"><span><Check size={17} /> Secure attempt</span><strong>{sampleQuiz.questionCount} questions</strong></div>
            <div className="lc-book-row"><span><LockKeyhole size={17} /> Answer keys</span><strong>Server only</strong></div>
            <Link href="/assessments" className="lc-book-link">Explore assessments <ArrowUpRight size={18}/></Link>
          </> : chapter === "navigate" ? <>
            <h4>Skills are connected for a reason.</h4>
            <p>{exampleSkill.description} It has these canonical prerequisites in Skillmetry:</p>
            <div className="lc-book-tags">{exampleSkill.prerequisites.map(id => <span key={id}>{skillById[id]?.label ?? id}</span>)}</div>
            <p className="lc-book-footnote">Connections come from the curated skill catalog—not a generated diagram.</p>
            <Link href="/roadmap" className="lc-book-link">Open the roadmap <ArrowUpRight size={18}/></Link>
          </> : <>
            <h4>Unknown is not a zero.</h4>
            <p>When a student has not completed a quiz, the journal reports <strong>Not assessed</strong>. It never fills the gap with a pretend result.</p>
            <div className="lc-book-evidence"><Fingerprint size={20}/><div><strong>Not assessed</strong><small>No completed server-graded quiz yet</small></div></div>
            <p className="lc-book-footnote">Illustrative empty state. Your real results are private to your account.</p>
            <Link href="/twin" className="lc-book-link">Explore the evidence journal <ArrowUpRight size={18}/></Link>
          </>}
        </div>
      </div>
    </section>
  );
}
