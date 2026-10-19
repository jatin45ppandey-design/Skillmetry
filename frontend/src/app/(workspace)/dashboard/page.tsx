"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Compass, Fingerprint, GitBranch, ShieldCheck } from "lucide-react";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { buildDigitalTwinSnapshot } from "@skillmetry/shared/lib/digital-twin-intelligence";
import { selectCourseContinuation, type ContinueLearning, type ResumeCourse, type SavedLessonActivity } from "@skillmetry/shared/lib/learning-continuation";
import { getPersonalizedResources } from "@skillmetry/shared/lib/resource-intelligence";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { useSkillmetry } from "@/store/use-skillmetry";
import { useAuth } from "@/components/auth-provider";
import { EvidenceStatus } from "@/components/evidence-status";

type TrustedNextAction = {
  kind: "assessment" | "learning" | "choose-goals";
  title: string;
  label: string;
  href: string;
  explanation: string;
};

function formatAttemptDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function Dashboard() {
  const { name, preferences, onboardingCompleted, profileSource, cloudOwnerId } = useSkillmetry();
  const { user } = useAuth();
  const [cloudNext, setCloudNext] = useState<TrustedNextAction | null>(null);
  const [resume, setResume] = useState<ContinueLearning | null>(null);
  const [cloudNextStatus, setCloudNextStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");

  useEffect(() => {
    const controller = new AbortController();
    setCloudNext(null);
    if (!user) {
      setCloudNextStatus("idle");
      return () => controller.abort();
    }
    setCloudNextStatus("loading");
    void fetch("/api/learning/overview", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json() as { nextAction?: TrustedNextAction; error?: string };
        if (!response.ok || !body.nextAction) throw new Error(body.error ?? "Learning overview unavailable");
        if (!controller.signal.aborted) {
          setCloudNext(body.nextAction);
          setCloudNextStatus("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setCloudNextStatus("unavailable");
      });
    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    setResume(null);
    if (!user) return () => controller.abort();
    void fetch("/api/learning/course-progress", { cache: "no-store", signal: controller.signal })
      .then(async activity => {
        if (!activity.ok) return null;
        const body = await activity.json() as { enabled?: boolean; progress?: SavedLessonActivity[]; truncated?: boolean };
        if (!body.enabled || body.truncated || !body.progress?.length) return null;
        const slugs = [...new Set(body.progress.map(row => row.courseSlug))]
          .filter(slug => /^[a-z][a-z0-9-]{3,49}$/.test(slug)).slice(0, 5);
        const catalog = await Promise.all(slugs.map(slug =>
          fetch(`/api/content/courses?course=${encodeURIComponent(slug)}`, { cache: "no-store", signal: controller.signal })
            .then(async response => response.ok ? (await response.json() as { courses?: ResumeCourse[] }).courses ?? [] : [])
            .catch(() => [] as ResumeCourse[])
        ));
        return selectCourseContinuation(catalog.flat(), body.progress);
      })
      .then(next => {
        if (!controller.signal.aborted) setResume(next);
      })
      .catch(() => {
        // Course continuation is optional and never replaces trusted assessment guidance.
      });
    return () => controller.abort();
  }, [user]);

  const profileReady = onboardingCompleted && (!user || (profileSource === "student" && cloudOwnerId === user.id));
  const { attempts, scores, illustrative, status } = useAssessmentProfile();
  const learning = preferences.learning;
  const career = profileReady ? careers.find(item => item.id === learning.primaryCareerId) ?? null : null;
  const hasFocus = profileReady && Boolean(career || learning.selectedSkillIds.length || learning.selectedToolIds.length);
  const loading = !illustrative && status === "loading";
  const evidenceUnavailable = !illustrative && (status === "error" || status === "offline") && !attempts.length;
  const twin = useMemo(() => buildDigitalTwinSnapshot({
    attempts,
    learning,
    context: illustrative ? "demo" : "authenticated"
  }), [attempts, illustrative, learning]);
  const resource = useMemo(() => hasFocus ? getPersonalizedResources({
    learning,
    trustedScores: scores,
    maxResults: 1
  })[0] : undefined, [hasFocus, learning, scores]);
  const focus = hasFocus ? twin.insights.find(item => item.priority === "now") ?? twin.insights[0] : null;
  const detail = focus?.skillId ? skillById[focus.skillId]?.label : null;
  const groundedCloudAction = profileReady && hasFocus && !loading && cloudNextStatus === "ready" ? cloudNext : null;
  const nextHref = groundedCloudAction?.href ?? (!profileReady || !hasFocus ? "/onboarding" : focus?.action.href ?? "/roadmap");
  const nextLabel = groundedCloudAction?.label ?? (!profileReady || !hasFocus ? "Choose a direction" :
    focus?.action.kind === "assessment" ? "Take the available assessment" :
      focus?.action.kind === "resources" ? "Open a learning resource" : "Open My Path");
  const nextTitle = groundedCloudAction?.title ?? (!profileReady || !hasFocus ? "Choose a direction." :
    loading ? "Preparing your next step…" : focus?.type === "assessment-recommended" ?
      "Find out what you already know." : focus?.type === "reassessment-opportunity" ?
        "Check how far you have come." : detail ? `Work on ${detail}.` : "Make one useful move today.");
  const nextExplanation = groundedCloudAction?.explanation ?? (!profileReady || !hasFocus ?
    "Skillmetry needs a career or skill goal before it can recommend an evidence-based next step." :
    loading ? "Your trusted quiz results are loading. Skillmetry will not guess your next action." :
      focus?.explanation ?? "Explore your pathway and choose a practical next step.");
  const lastAttempt = [...attempts].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))[0];
  const focusedSkill = focus?.skillId ? skillById[focus.skillId] : null;
  const relevantPrerequisites = focusedSkill?.prerequisites.map(id => skillById[id]).filter(Boolean) ?? [];
  const pathSkills = career?.skills.slice(0, 5) ?? [];
  const actionBasis = !profileReady || !hasFocus
    ? "No recommendation yet — choose a direction first."
    : illustrative
      ? "Based on illustrative demo evidence."
      : "Based on your goal and the trusted evidence currently available.";
  const evidenceSummary = loading
    ? "Loading trusted evidence"
    : evidenceUnavailable
      ? "Evidence unavailable"
      : attempts.length
        ? `${attempts.length} ${illustrative ? "sample" : "trusted"} attempt${attempts.length === 1 ? "" : "s"}`
        : "Not assessed yet";
  const resourceHref = resource ? (resource.resource.target.kind === "skill"
    ? `/resources?skill=${encodeURIComponent(resource.resource.target.skillId)}`
    : `/resources?tool=${encodeURIComponent(resource.resource.target.toolId)}`) : "/resources";
  const continuation = resume && profileReady && !illustrative ? {
    title: resume.courseTitle,
    detail: `Next lesson: ${resume.lessonTitle}. ${resume.complete}/${resume.total} lessons marked studied.`,
    note: "Lesson activity is self-reported and does not change quiz evidence.",
    href: resume.href,
    label: "Resume course"
  } : resource ? {
    title: resource.resource.title,
    detail: resource.reason,
    note: "Learning activity is unscored. Reassess when you want new measured evidence.",
    href: resourceHref,
    label: "Open this resource"
  } : {
    title: "Explore learning material",
    detail: detail ? `Find curated material related to ${detail}.` : "Choose a direction to receive a more specific learning suggestion.",
    note: "Learning activity is unscored and never manufactures proficiency.",
    href: resourceHref,
    label: "Browse resources"
  };

  return (
    <div className="mb-dashboard">
      <div className="mb-dashboard__intro">
        <header className="mb-dashboard__welcome">
          <div>
            <h1>{name && name !== "Demo Student" ? `Welcome back, ${name.split(" ")[0]}.` : "Your learning workspace."}</h1>
            <p>{career ? `You are exploring ${career.title}.` : "Start with a direction, then let evidence guide the next step."}</p>
          </div>
          <Link href="/settings"><Compass aria-hidden="true" /> Adjust goals</Link>
        </header>

        {illustrative ? (
          <aside className="mb-demo-notice" role="status" data-ui>
            <ShieldCheck aria-hidden="true" />
            <span><strong>Illustrative demo.</strong> Sample results below are not attached to an account.</span>
            <Link href="/auth/sign-in?next=/dashboard">Sign in for private evidence <ArrowRight aria-hidden="true" /></Link>
          </aside>
        ) : null}
      </div>

      <section className="mb-now" aria-labelledby="mb-now-title" aria-busy={loading} data-ui>
        <div className="mb-now__action">
          <p>Now</p>
          <h2 id="mb-now-title">{nextTitle}</h2>
          <Link href={nextHref} aria-disabled={loading} tabIndex={loading ? -1 : undefined}
            onClick={loading ? event => event.preventDefault() : undefined}>
            {loading ? "Loading your next action…" : nextLabel}<ArrowRight aria-hidden="true" />
          </Link>
          <small>{actionBasis}</small>
        </div>
        <aside className="mb-now__why">
          <p>Why this</p>
          <h3>{detail ? `${detail} is the current focus.` : "A direction comes before a recommendation."}</h3>
          <p>{nextExplanation}</p>
          <dl className="mb-now__facts">
            <div><dt>Goal</dt><dd>{career?.title ?? "Not selected"}</dd></div>
            <div><dt>Evidence</dt><dd>{evidenceSummary}</dd></div>
          </dl>
          {cloudNextStatus === "unavailable" && user ? <small>Live overview unavailable. This fallback uses the trusted evidence already loaded in your workspace.</small> : null}
        </aside>
      </section>

      <div className="mb-dashboard__columns">
        <section className="mb-dashboard-panel mb-path-panel" aria-labelledby="mb-path-title" data-ui>
          <header><div><p>My Path</p><h2 id="mb-path-title">{career?.title ?? "No career direction selected"}</h2></div><GitBranch aria-hidden="true" /></header>
          {relevantPrerequisites.length ? (
            <p className="mb-path-panel__reason">{focusedSkill?.label} depends on {relevantPrerequisites.map(item => item.label).join(" and ")}.</p>
          ) : (
            <p className="mb-path-panel__reason">{career ? "Start with the available foundations, then follow their prerequisites." : "Choose a flexible direction to see its skills and prerequisites."}</p>
          )}
          {pathSkills.length ? (
            <ul className="mb-path-list">
              {pathSkills.map(item => {
                const score = scores[item.skillId];
                const measured = typeof score === "number" && Number.isFinite(score);
                return (
                  <li key={item.skillId}>
                    <span><strong>{skillById[item.skillId]?.label ?? item.skillId}</strong><small>{skillById[item.skillId]?.group}</small></span>
                    {evidenceUnavailable ? <EvidenceStatus state="unavailable" />
                      : measured ? <EvidenceStatus state="measured" score={score} />
                        : <EvidenceStatus state="not-assessed" />}
                  </li>
                );
              })}
            </ul>
          ) : <div className="mb-empty-state">Your path will appear after you choose a direction.</div>}
          <Link className="mb-panel-link" href={career ? "/roadmap" : "/onboarding"}>{career ? "Explore My Path" : "Choose a direction"} <ArrowRight aria-hidden="true" /></Link>
        </section>

        <section className="mb-dashboard-panel mb-evidence-panel" aria-labelledby="mb-evidence-title" data-ui>
          <header><div><p>My Evidence</p><h2 id="mb-evidence-title">What has actually been measured</h2></div><Fingerprint aria-hidden="true" /></header>
          <dl className="mb-evidence-counts">
            <div><dt>Skills assessed</dt><dd>{loading || evidenceUnavailable ? "—" : twin.catalogCoverage.measuredSkillCount}</dd></div>
            <div><dt>Quiz attempts</dt><dd>{loading || evidenceUnavailable ? "—" : attempts.length}</dd></div>
          </dl>
          <div className="mb-latest-evidence">
            <p>Latest result</p>
            {loading ? <span role="status">Loading trusted history…</span> : evidenceUnavailable ? <EvidenceStatus state="unavailable" /> : lastAttempt ? (
              <>
                <div><strong>{skillById[lastAttempt.skillId]?.label ?? lastAttempt.skillId}</strong><EvidenceStatus state="measured" score={lastAttempt.score} /></div>
                <small>{illustrative ? "Illustrative sample attempt" : `Server-graded · ${formatAttemptDate(lastAttempt.completedAt)}`}</small>
              </>
            ) : <><EvidenceStatus state="not-assessed" /><small>Your first supported quiz will create a measured baseline.</small></>}
          </div>
          <Link className="mb-panel-link" href="/twin">View evidence & history <ArrowRight aria-hidden="true" /></Link>
        </section>
      </div>

      <section className="mb-continue" aria-labelledby="mb-continue-title" data-ui>
        <div><p>Continue Learning</p><h2 id="mb-continue-title">{continuation.title}</h2><p>{continuation.detail}</p><small>{continuation.note}</small></div>
        <Link href={continuation.href}>{continuation.label} <ArrowRight aria-hidden="true" /></Link>
        <BookOpen aria-hidden="true" className="mb-continue__icon" />
      </section>
    </div>
  );
}
