"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpenCheck, Compass, Fingerprint, GitBranch, LibraryBig, RefreshCw, ShieldCheck, Target } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { toolById } from "@skillmetry/shared/data/learning-catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { buildDigitalTwinSnapshot } from "@skillmetry/shared/lib/digital-twin-intelligence";
import { getPersonalizedResources } from "@skillmetry/shared/lib/resource-intelligence";
import { useSkillmetry } from "@/store/use-skillmetry";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Dashboard() {
  const { name, preferences } = useSkillmetry();
  const { attempts, scores, illustrative } = useAssessmentProfile();
  const learning = preferences.learning;
  const career = learning.primaryCareerId ? careers.find(item => item.id === learning.primaryCareerId) ?? null : null;
  const twin = useMemo(() => buildDigitalTwinSnapshot({ attempts, learning, context: illustrative ? "demo" : "authenticated" }), [attempts, illustrative, learning]);
  const resources = useMemo(() => getPersonalizedResources({ learning, trustedScores: scores, maxResults: 1 }), [learning, scores]);
  const latestAttempt = attempts.toSorted((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || b.id.localeCompare(a.id))[0] ?? null;
  const now = twin.insights[0] ?? null;
  const selectedCareerEvidence = career ? twin.careers.find(item => item.careerId === career.id) ?? null : null;
  const focusLabels = [
    ...learning.selectedSkillIds.map(id => skillById[id]?.label ?? id),
    ...learning.selectedToolIds.map(id => toolById[id].label)
  ];
  const nowHref = now?.action.href ?? "/settings";
  const nowAction = now?.action.kind === "assessment" ? "Open assessment" : now?.action.kind === "resources" ? "Open learning resources" : "Set learning goals";
  const activeJourney = now?.type === "reassessment-opportunity" ? "reassess" : now?.action.kind === "resources" ? "learn" : "assess";

  return <>
    <SectionTitle
      eyebrow="01 / Learning command"
      title={`Good to see you, ${name.split(" ")[0] || "Explorer"}.`}
      description="One connected view of your learning direction, trusted quiz evidence, and clearest next move."
      action={<Link href="/settings" className="btn btn-quiet"><Compass aria-hidden="true"/>Change goals</Link>}
    />

    <section className="signal-direction" aria-labelledby="learning-direction-title">
      <div className="signal-direction-mark"><Target aria-hidden="true"/><span>Learning direction</span></div>
      <div className="signal-direction-copy"><span className="eyebrow">Current configuration</span><h2 id="learning-direction-title">{career?.title ?? "Self-directed learning system"}</h2><p>{career ? career.subtitle : "No career track is required. Your selected skills and tools can define the pathway."}</p></div>
      <div className="signal-focus-tags">{focusLabels.length ? focusLabels.slice(0, 6).map(label => <span key={label}>{label}</span>) : <span className="empty">No additional skill or tool focus</span>}{focusLabels.length > 6 ? <span>+{focusLabels.length - 6} more</span> : null}</div>
    </section>

    <section className="signal-next-action" aria-labelledby="signal-next-title">
      <div className="signal-action-index"><span>NOW</span><strong>01</strong></div>
      <div className="signal-action-copy"><span className="eyebrow">Signature next action</span><h2 id="signal-next-title">{now?.skillId ? skillById[now.skillId]?.label ?? "Continue your learning path" : now?.toolId ? toolById[now.toolId as keyof typeof toolById]?.label ?? "Continue your learning path" : "Choose your first learning focus"}</h2><p>{now?.explanation ?? "Select a career, skill, or tool so Skillmetry can provide a grounded next step without inventing a score."}</p><div className="signal-action-proof"><ShieldCheck aria-hidden="true"/><span>{now ? "Derived from your selected goals and trusted assessment state" : "No recommendation generated without learning context"}</span></div></div>
      <Link href={nowHref} className="signal-action-cta">{nowAction}<ArrowRight aria-hidden="true"/></Link>
    </section>

    <section className="signal-evidence-strip" aria-label="Current assessment evidence">
      <div><span>Trusted skill evidence</span><strong>{twin.catalogCoverage.measuredSkillCount}<small> / {twin.catalogCoverage.catalogSkillCount}</small></strong><p>canonical skills measured</p></div>
      <div><span>Catalog coverage</span><strong>{twin.catalogCoverage.catalogCoveragePercent}<small>%</small></strong><p>unknown skills excluded</p></div>
      <div><span>Latest valid assessment</span><strong className="signal-evidence-text">{latestAttempt ? `${latestAttempt.score}% · ${skillById[latestAttempt.skillId]?.label ?? latestAttempt.skillId}` : "Not available"}</strong><p>{latestAttempt ? dateFormatter.format(new Date(latestAttempt.completedAt)) : "complete a secure quiz"}</p></div>
      <div><span>{career ? `${career.title} evidence` : "Evidence source"}</span><strong className="signal-evidence-text">{selectedCareerEvidence ? `${selectedCareerEvidence.weightedEvidenceCoveragePercent}% covered` : illustrative ? "Illustrative demo" : "Server graded"}</strong><p>{selectedCareerEvidence ? `${selectedCareerEvidence.assessmentAvailabilityCeilingPercent}% availability ceiling` : "not professional readiness"}</p></div>
    </section>

    <section className="signal-journey" aria-labelledby="signal-journey-title">
      <div className="signal-journey-heading"><span className="eyebrow">Measure → Understand → Learn → Evolve</span><h2 id="signal-journey-title">Your learning loop</h2><p>The active step follows your current recommendation; it is not a fabricated completion percentage.</p></div>
      <div className="signal-journey-rail">
        <Link href="/assessments" className={activeJourney === "assess" ? "active" : ""}><span>01</span><BookOpenCheck aria-hidden="true"/><div><strong>Assess</strong><small>Establish trusted evidence</small></div></Link>
        <Link href="/resources" className={activeJourney === "learn" ? "active" : ""}><span>02</span><LibraryBig aria-hidden="true"/><div><strong>Learn</strong><small>Follow curated material</small></div></Link>
        <Link href="/assessments" className={activeJourney === "reassess" ? "active" : ""}><span>03</span><RefreshCw aria-hidden="true"/><div><strong>Reassess</strong><small>Observe a new result</small></div></Link>
      </div>
    </section>

    <section className="signal-preview-grid">
      <article className="signal-preview signal-preview-roadmap"><div className="signal-preview-top"><span>02 / Navigate</span><GitBranch aria-hidden="true"/></div><h2>{now?.skillId ? `Continue with ${skillById[now.skillId]?.label ?? now.skillId}` : "Build a prerequisite-aware path"}</h2><p>The roadmap preserves canonical relationships and marks unknown evidence without assigning zero-derived gaps.</p><Link href="/roadmap" className="text-link">Open adaptive roadmap <ArrowRight aria-hidden="true"/></Link></article>
      <article className="signal-preview signal-preview-resource"><div className="signal-preview-top"><span>03 / Learn</span><LibraryBig aria-hidden="true"/></div><h2>{resources[0]?.resource.title ?? "Browse the curated library"}</h2><p>{resources[0]?.reason ?? "Select learning goals to receive resource recommendations grounded in your current context."}</p><Link href={resources[0] ? resources[0].resource.target.kind === "skill" ? `/resources?skill=${encodeURIComponent(resources[0].resource.target.skillId)}` : `/resources?tool=${encodeURIComponent(resources[0].resource.target.toolId)}` : "/resources"} className="text-link">Explore resources <ArrowRight aria-hidden="true"/></Link></article>
      <article className="signal-preview signal-preview-twin"><div className="signal-preview-top"><span>04 / Understand</span><Fingerprint aria-hidden="true"/></div><h2>{twin.catalogCoverage.measuredSkillCount ? `${twin.catalogCoverage.measuredSkillCount} skills carry trusted evidence` : "Your evidence record is ready"}</h2><p>{twin.insights[0]?.explanation ?? "Take a supported assessment to create the first measured entry. Unknown remains distinct from 0%."}</p><Link href="/twin" className="text-link">Inspect Digital Twin <ArrowRight aria-hidden="true"/></Link></article>
    </section>
  </>;
}
