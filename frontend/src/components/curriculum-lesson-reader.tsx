"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, Check, Clock, ExternalLink, PlayCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import type { CurriculumLesson, CurriculumTopic } from "@skillmetry/shared/types/curriculum";
import type { LearningResource } from "@skillmetry/shared/types/domain";

type ProgressState = "loading" | "signed-out" | "staged" | "ready" | "saving" | "saved" | "error";

export function CurriculumLessonReader({
  skillId, skillLabel, topic, lesson, resources, position, total, previousHref, nextHref
}: {
  skillId: string;
  skillLabel: string;
  topic: CurriculumTopic;
  lesson: CurriculumLesson;
  resources: readonly LearningResource[];
  position: number;
  total: number;
  previousHref: string | null;
  nextHref: string | null;
}) {
  const { user } = useAuth();
  const [progressState, setProgressState] = useState<ProgressState>(user ? "loading" : "signed-out");
  const [completed, setCompleted] = useState(false);
  const courseSlug = `skillmetry-${skillId}-path`;
  const topicPracticeId = lesson.practiceIds.find(id => id.startsWith("topic-practice:"));
  const assessmentPracticeId = lesson.practiceIds.find(id => id.startsWith("assessment:"));

  useEffect(() => {
    if (!user) { setProgressState("signed-out"); setCompleted(false); return; }
    const controller = new AbortController();
    setProgressState("loading");
    void fetch("/api/learning/course-progress", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json() as { enabled?: boolean; progress?: { courseSlug: string; lessonId: string; publishedRevision: number; completed: boolean }[]; error?: string };
        if (!response.ok) throw new Error(body.error ?? "Saved lesson activity is unavailable.");
        if (controller.signal.aborted) return;
        if (!body.enabled) { setProgressState("staged"); return; }
        setCompleted(Boolean(body.progress?.some(entry => entry.courseSlug === courseSlug
          && entry.lessonId === lesson.id.split(":lesson:")[1] && entry.publishedRevision === 1 && entry.completed)));
        setProgressState("ready");
      }).catch(() => { if (!controller.signal.aborted) setProgressState("error"); });
    return () => controller.abort();
  }, [courseSlug, lesson.id, user]);

  async function updateCompletion() {
    if (!user || !["ready", "saved"].includes(progressState)) return;
    const nextCompleted = !completed;
    setProgressState("saving");
    try {
      const response = await fetch("/api/learning/course-progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonId: lesson.id.split(":lesson:")[1], publishedRevision: 1, completed: nextCompleted })
      });
      const body = await response.json() as { saved?: boolean; error?: string };
      if (!response.ok || !body.saved) throw new Error(body.error ?? "Lesson activity was not saved.");
      setCompleted(nextCompleted);
      setProgressState("saved");
    } catch { setProgressState("error"); }
  }

  return <div className="p2-lesson-shell">
    <nav className="p2-path-breadcrumb" aria-label="Lesson breadcrumb">
      <Link href="/learn">Learn</Link><ArrowRight aria-hidden="true"/>
      <Link href={`/learn?skill=${encodeURIComponent(skillId)}`}>{skillLabel}</Link><ArrowRight aria-hidden="true"/>
      <span aria-current="page">{topic.title}</span>
    </nav>
    <div className="p2-lesson-layout">
      <article className="p2-lesson-article">
        <header><div><span className="v3-kicker">{topic.difficulty} · LESSON {position} OF {total}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div>
          <span className="p2-reading-time"><Clock aria-hidden="true"/>{lesson.estimatedMinutes} min</span></header>
        <section aria-labelledby="lesson-objectives"><h2 id="lesson-objectives">What you will learn</h2><ul>{lesson.learningObjectives.map(objective => <li key={objective}>{objective}</li>)}</ul></section>
        <section aria-labelledby="lesson-explanation"><h2 id="lesson-explanation">The idea</h2><p>{lesson.explanation}</p></section>
        <section className="p2-worked-example" aria-labelledby="lesson-example"><span>WORKED EXAMPLE</span><h2 id="lesson-example">See it in context</h2><p>{lesson.example}</p></section>
        <section aria-labelledby="lesson-mistakes"><h2 id="lesson-mistakes">Common mistakes</h2><ul>{lesson.commonMistakes.map(mistake => <li key={mistake}>{mistake}</li>)}</ul></section>
        <section className="p2-practical-task" aria-labelledby="lesson-task"><span>PRACTICAL TASK</span><h2 id="lesson-task">Try it yourself</h2><p>{lesson.task}</p></section>
        <section aria-labelledby="lesson-outcomes"><h2 id="lesson-outcomes">After this lesson</h2><ul>{lesson.learningOutcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></section>
        <nav className="p2-lesson-pagination" aria-label="Lesson sequence">
          {previousHref ? <Link className="btn btn-outline" href={previousHref}><ArrowLeft aria-hidden="true"/>Previous lesson</Link> : <span/>}
          {nextHref ? <Link className="btn btn-primary" href={nextHref}>Next lesson<ArrowRight aria-hidden="true"/></Link> : <Link className="btn btn-primary" href={`/learn?skill=${encodeURIComponent(skillId)}`}>Review skill path<ArrowRight aria-hidden="true"/></Link>}
        </nav>
      </article>
      <aside className="p2-lesson-aside" aria-label="Lesson references and progress">
        <section><span className="v3-kicker">LESSON ACTIVITY</span><h2>{completed ? "Marked studied" : "Completion"}</h2>
          {progressState === "loading" ? <p role="status">Loading saved activity…</p> : null}
          {progressState === "signed-out" ? <p>Sign in to use saved lesson activity when the staged progress service is enabled.</p> : null}
          {progressState === "staged" ? <p role="status">Progress saving is not enabled on this deployment. No completion is claimed.</p> : null}
          {progressState === "error" ? <p role="alert">Saved activity is unavailable. The lesson remains readable; try again later.</p> : null}
          {["ready", "saved", "saving"].includes(progressState) ? <button type="button" className={completed ? "btn btn-outline" : "btn btn-primary"}
            aria-pressed={completed} disabled={progressState === "saving"} onClick={() => void updateCompletion()}>
            <Check aria-hidden="true"/>{progressState === "saving" ? "Saving…" : completed ? "Undo studied" : "Mark lesson studied"}</button> : null}
          {progressState === "saved" ? <p className="p2-save-success" role="status" aria-live="polite"><Check aria-hidden="true"/>Saved to your private lesson activity.</p> : null}
          <small>Lesson activity is self-reported and never changes proficiency.</small>
        </section>
        <section><span className="v3-kicker">REVIEWED REFERENCES</span><h2>Learn from the source</h2>
          <div className="p2-reference-list">{resources.map(resource => <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer">
            <span>{resource.type === "video" ? <PlayCircle aria-hidden="true"/> : <BookOpenCheck aria-hidden="true"/>}<strong>{resource.title}</strong></span>
            <small>{resource.provider} · {resource.language ?? "English"} · {resource.difficulty}</small>
            <span>Open {resource.type}<ExternalLink aria-hidden="true"/></span>
          </a>)}</div>
        </section>
        {topicPracticeId ? <section><span className="v3-kicker">PRACTICE HANDOFF</span><h2>Apply this lesson</h2>
          <p>Try three guided checks with hints and explanations. Topic practice is learning activity and never creates a proficiency score.</p>
          <Link className="btn btn-primary" href={`/practice?topic=${encodeURIComponent(topic.id)}`}>Practice this topic<ArrowRight aria-hidden="true"/></Link>
          {assessmentPracticeId ? <><p className="note">When you are ready, the secure assessment is the only place a numerical skill score can be created.</p>
            <Link className="btn btn-outline" href={`/assessments?assessment=${encodeURIComponent(assessmentPracticeId.replace("assessment:", ""))}`}>Open assessment<ArrowRight aria-hidden="true"/></Link></> : null}
        </section> : null}
        <Link className="text-link" href="/roadmap">Return to My Learning Path <ArrowRight aria-hidden="true"/></Link>
      </aside>
    </div>
  </div>;
}
