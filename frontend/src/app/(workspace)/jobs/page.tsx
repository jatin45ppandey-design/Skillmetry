"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { StatusPill } from "@/components/workspace-ui";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { useAuth } from "@/components/auth-provider";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { matchJobSkillMentions } from "@skillmetry/shared/lib/job-skill-matching";

export default function Jobs() {
  const { scores, illustrative } = useAssessmentProfile();
  const { user } = useAuth();
  const [aiPending, setAiPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMentions, setAiMentions] = useState<{skillId:string;skillLabel:string;evidenceQuote:string}[] | null>(null);

  async function requestAI() {
    setAiPending(true); setAiError(null); setAiMentions(null);
    try {
      const result = await fetch("/api/ai/jobs", {method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({description:description.trim()})});
      const response = await result.json() as {error?:string;mentions?:{skillId:string;skillLabel:string;evidenceQuote:string}[]};
      if (!result.ok || !response.mentions) throw new Error(response.error ?? "AI analysis is unavailable.");
      setAiMentions(response.mentions);
    } catch (cause) {
      setAiError(cause instanceof Error ? cause.message : "AI analysis is unavailable.");
    } finally { setAiPending(false); }
  }
  const [description, setDescription] = useState("");
  const [analyzedText, setAnalyzedText] = useState<string | null>(null);
  const matches = useMemo(() =>
    analyzedText === null ? [] : matchJobSkillMentions(analyzedText, scores),
    [analyzedText, scores]
  );

  return <div className="studio-job-workspace">
    <SectionTitle eyebrow="Job description explorer" title="See which skills a role mentions"
      description="Compare explicit technology names in a job description against your measured quiz evidence. No hiring probability, AI inference or invented scores." />
    <div className="studio-job-trust"><ShieldCheck aria-hidden="true" />
      <p>This is an <strong>on-device keyword matcher, not AI analysis.</strong> Text stays in this browser tab, is not uploaded or stored, and may miss synonyms or implied requirements.</p>
    </div>
    <section className="studio-job-layout">
      <div className="panel studio-job-input">
        <label className="field">Job description
          <textarea className="input" rows={13} maxLength={12000}
            placeholder="Paste a role description mentioning skills such as React, SQL, Docker, unit testing or Python…"
            value={description} onChange={event => { setDescription(event.target.value); setAnalyzedText(null); setAiMentions(null); setAiError(null); }} />
        </label>
        <p className="note">{description.length.toLocaleString("en-IN")} / 12,000 characters · browser-only matching</p>
        <button type="button" className="btn btn-primary" disabled={description.trim().length < 10}
          onClick={() => setAnalyzedText(description)}>
          <Search aria-hidden="true" /> Match named skills
        </button>
        <div className="studio-ai-option">
          <p>Optional AI extraction sends this job description to an external Gemini API. Do not include private details. Requires sign-in, owner enablement and daily request allowance.</p>
          <button type="button" className="btn btn-outline" disabled={!user || description.trim().length < 30 || description.length > 6000 || aiPending}
            onClick={() => void requestAI()}>{aiPending ? "Analyzing…" : "Send to AI (optional)"}</button>
          {!user ? <p>Sign in to enable optional AI requests.</p> : null}
          {aiError ? <p className="note" role="alert">{aiError}</p> : null}
          {aiMentions ? <div role="status" className="studio-ai-results"><strong>AI-extracted mentions (grounded quotes only)</strong>
            {aiMentions.length ? aiMentions.map(item => <p key={item.skillId}><strong>{item.skillLabel}:</strong> “{item.evidenceQuote}” · <Link href={`/resources?skill=${encodeURIComponent(item.skillId)}`}>Resources</Link></p>)
              : <p>No literal skill evidence validated in this text.</p>}
            <small>Not an employment probability, skill score or verified job requirement.</small>
          </div> : null}
        </div>
      </div>
      <div className="panel studio-job-output">
        <div className="studio-job-output-head"><BriefcaseBusiness aria-hidden="true" />
          <div><span className="eyebrow">Grounded comparison</span><h2>{analyzedText === null ? "Explore the role" : matches.length + " catalog skills mentioned"}</h2></div>
        </div>
        {analyzedText === null ? <p>Paste a description and choose Match named skills. The analysis looks for explicit terms among Skillmetry&apos;s 18 canonical skills.</p> : null}
        {analyzedText !== null && !matches.length ? <p role="status">No supported skill terms were explicitly recognized. This does not mean the role has no requirements—review the description yourself.</p> : null}
        {analyzedText !== null && illustrative ? <p className="note">Your current quiz signals are illustrative demo data, not an authenticated student&apos;s scores.</p> : null}
        {analyzedText !== null && matches.length ? <div className="studio-job-matches">
          {matches.map(match => {
            const assessment = assessmentCatalog.find(item => item.skillId === match.skillId);
            return <article key={match.skillId}>
              <div><strong>{match.skillLabel}</strong><small>Matched: {match.matchedTerms.join(", ")}</small></div>
              <StatusPill tone={match.evidenceState === "strong-quiz-result" ? "success" :
                match.evidenceState === "needs-practice" ? "warning" : "neutral"}>
                {match.score === null ? "Not assessed" : match.score + "% · quiz result"}
              </StatusPill>
              <div className="studio-job-match-actions">
                <Link href={`/resources?skill=${encodeURIComponent(match.skillId)}`}>Learning resources ↗</Link>
                {assessment ? <Link href={`/assessments?assessment=${assessment.id}`}>Assessment ↗</Link> : null}
              </div>
            </article>;
          })}
        </div> : null}
        {analyzedText !== null && matches.length ? <p className="note"><CheckCircle2 aria-hidden="true" /> Recognition of a named term is not proof that a job requires proficiency at any particular level. Unassessed means unknown, not a 0% gap.</p> : null}
      </div>
    </section>
  </div>;
}
