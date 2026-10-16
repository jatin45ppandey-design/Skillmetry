"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight, ArrowUpRight, BookOpenCheck, Compass, Fingerprint,
  GitBranch, LibraryBig, RefreshCw, ShieldCheck, Sparkles
} from "lucide-react";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { toolById } from "@skillmetry/shared/data/learning-catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { buildDigitalTwinSnapshot } from "@skillmetry/shared/lib/digital-twin-intelligence";
import { getPersonalizedResources } from "@skillmetry/shared/lib/resource-intelligence";
import { useSkillmetry } from "@/store/use-skillmetry";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

const stages = [
  { key: "choose", number: "01", title: "Choose", subtitle: "Shape your direction", icon: Compass, href: "/settings" },
  { key: "assess", number: "02", title: "Assess", subtitle: "Measure with a quiz", icon: BookOpenCheck, href: "/assessments" },
  { key: "learn", number: "03", title: "Learn", subtitle: "Explore what matters", icon: LibraryBig, href: "/resources" },
  { key: "reassess", number: "04", title: "Reassess", subtitle: "Review new evidence", icon: RefreshCw, href: "/assessments" }
] as const;

export default function Dashboard() {
  const { name, preferences } = useSkillmetry();
  const { attempts, scores, illustrative, status } = useAssessmentProfile();
  const learning = preferences.learning;
  const career = learning.primaryCareerId ? careers.find(item => item.id === learning.primaryCareerId) ?? null : null;
  const twin = useMemo(() => buildDigitalTwinSnapshot({ attempts, learning, context: illustrative ? "demo" : "authenticated" }), [attempts, illustrative, learning]);
  const resources = useMemo(() => getPersonalizedResources({ learning, trustedScores: scores, maxResults: 1 }), [learning, scores]);
  const latestAttempt = attempts.toSorted((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || b.id.localeCompare(a.id))[0] ?? null;
  const now = twin.insights[0] ?? null;
  const focusLabels = [
    ...learning.selectedSkillIds.map(id => skillById[id]?.label ?? id),
    ...learning.selectedToolIds.map(id => toolById[id]?.label ?? id)
  ];
  const nowHref = now?.action.href ?? "/settings";
  const nowAction = now?.action.kind === "assessment" ? "Start an assessment" : now?.action.kind === "resources" ? "Explore learning resources" : "Choose my learning goals";
  const nowTitle = now?.skillId ? skillById[now.skillId]?.label ?? "Your next learning step"
    : now?.toolId ? toolById[now.toolId as keyof typeof toolById]?.label ?? "Your next learning step"
    : "Your next chapter starts with a goal.";
  const nowExplanation = now?.explanation ?? "Choose a career, a skill, or a tool. Skillmetry will suggest a grounded next move without inventing a score.";
  const currentStage = !learning.primaryCareerId && !learning.selectedSkillIds.length && !learning.selectedToolIds.length ? "choose"
    : now?.type === "reassessment-opportunity" ? "reassess" : now?.action.kind === "resources" ? "learn" : "assess";
  const resource = resources[0];
  const resourceHref = !resource ? "/resources"
    : resource.resource.target.kind === "skill" ? "/resources?skill=" + encodeURIComponent(resource.resource.target.skillId)
    : "/resources?tool=" + encodeURIComponent(resource.resource.target.toolId);

  return (
    <div className="studio-home">
      <header className="studio-home-greeting">
        <div>
          <span className="studio-kicker"><span className="studio-kicker-mark" /> YOUR LEARNING JOURNAL / CHAPTER ONE</span>
          <h1>Make room for <em>what's next,</em> {name.split(" ")[0] || "Explorer"}.</h1>
          <p>A calm place to understand your learning direction—and take one useful step forward.</p>
        </div>
        <Link href="/settings" className="studio-round-link" aria-label="Edit learning goals"><Compass size={19} /><span>Edit goals</span><ArrowUpRight size={16} /></Link>
      </header>

      <section className="studio-cover" aria-labelledby="studio-cover-title">
        <div className="studio-cover-copy">
          <span className="studio-cover-overline">YOUR CURRENT CHAPTER <span aria-hidden="true">✳</span> {illustrative ? "ILLUSTRATIVE DEMO" : "PERSONAL LEARNING RECORD"}</span>
          <span className="studio-cover-career">{career?.title ?? "Your own learning direction"}</span>
          <h2 id="studio-cover-title">{nowTitle}</h2>
          <p>{nowExplanation}</p>
          <Link href={nowHref} className="studio-cover-cta"><span>{nowAction}</span><span><ArrowUpRight size={20} aria-hidden="true" /></span></Link>
          <div className="studio-cover-proof"><ShieldCheck size={16} /><span>{now ? "Based on your learning goals and available assessment evidence" : "A recommendation appears once you set learning goals"}</span></div>
        </div>
        <div className="studio-cover-art" aria-hidden="true">
          <span className="studio-cover-orbit studio-cover-orbit--outer" />
          <span className="studio-cover-orbit studio-cover-orbit--inner" />
          <span className="studio-cover-sticker studio-cover-sticker--top">learn<br />your way</span>
          <span className="studio-cover-art-center"><Fingerprint size={55} strokeWidth={1.4} /></span>
          <span className="studio-cover-sticker studio-cover-sticker--bottom">NEXT<br />MOVE ↗</span>
          <span className="studio-cover-art-number">FIELD NOTE / 01</span>
        </div>
      </section>

      <section className="studio-journey" aria-labelledby="studio-journey-title">
        <div className="studio-section-heading">
          <div><span className="studio-kicker">THE LEARNING LOOP</span><h2 id="studio-journey-title">Your path is a work in progress.</h2></div>
          <Link href="/roadmap">Open my skill map <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="studio-trail" role="list">
          {stages.map(({ key, number, title, subtitle, icon: Icon, href }) => (
            <Link key={key} href={href} className={"studio-trail-step" + (key === currentStage ? " is-active" : "")}
              role="listitem" aria-label={title + ": " + subtitle + (key === currentStage ? ", current suggested phase" : "")}>
              <span className="studio-trail-number">{number}</span>
              <span className="studio-trail-symbol"><Icon size={25} strokeWidth={1.65} aria-hidden="true" /></span>
              <strong>{title}</strong><small>{subtitle}</small>
              <ArrowUpRight className="studio-trail-arrow" size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="studio-trail-note">The highlighted step follows your current recommendation. It is not a completion badge or an invented progress percentage.</p>
      </section>

      <section className="studio-desk" aria-label="Learning journal and resource shelf">
        <article className="studio-desk-evidence">
          <div className="studio-desk-top"><span className="studio-kicker">YOUR EVIDENCE JOURNAL</span><Fingerprint size={24} aria-hidden="true" /></div>
          <h2>See what's measured.<br /><em>Know what's not.</em></h2>
          <div className="studio-evidence-row"><span>Skills with measured evidence</span><strong>{twin.catalogCoverage.measuredSkillCount} / {twin.catalogCoverage.catalogSkillCount}</strong></div>
          <div className="studio-evidence-row"><span>Catalog coverage</span><strong>{twin.catalogCoverage.catalogCoveragePercent}%</strong></div>
          <div className="studio-evidence-row"><span>Latest assessment</span><strong>{latestAttempt ? (skillById[latestAttempt.skillId]?.label ?? latestAttempt.skillId) + " · " + latestAttempt.score + "%" : "Not yet assessed"}</strong></div>
          {latestAttempt ? <p className="studio-evidence-date">Most recent valid quiz: {dateFormatter.format(new Date(latestAttempt.completedAt))}</p> : null}
          <p className="studio-evidence-trust">{illustrative ? "Illustrative demo history, not your personal result." : status === "loading" ? "Assessment history is loading; no result has been estimated." : "Results come from supported server-graded quizzes. They are not employability predictions."}</p>
          <Link href="/twin" className="studio-quiet-link">Open my evidence journal <ArrowRight size={17} aria-hidden="true" /></Link>
        </article>

        <article className="studio-desk-resources">
          <div className="studio-desk-top"><span className="studio-kicker">PICK UP A NEW IDEA</span><LibraryBig size={24} aria-hidden="true" /></div>
          <div className="studio-resource-illustration" aria-hidden="true"><span /><span /><span /></div>
          <h2>{resource?.resource.title ?? "Your learning shelf is ready."}</h2>
          <p>{resource?.reason ?? "Choose a learning focus to see useful materials and the reasons they match your goals."}</p>
          <div className="studio-tags">
            {focusLabels.slice(0, 4).map(item => <span key={item}>{item}</span>)}
            {focusLabels.length > 4 ? <span>+{focusLabels.length - 4} more</span> : null}
          </div>
          <Link href={resourceHref} className="studio-quiet-link">Browse learning resources <ArrowRight size={17} aria-hidden="true" /></Link>
        </article>
      </section>

      <div className="studio-last-note"><Sparkles size={17} aria-hidden="true" /> Every skill has a story beyond a single score. <Link href="/careers">Explore another direction <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
    </div>
  );
}
