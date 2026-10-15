"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpenCheck, Check, CheckCircle2, Clock3, LoaderCircle, LockKeyhole, RotateCcw, ShieldCheck, TrendingDown, TrendingUp, X } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { EmptyState, StatusPill } from "@/components/workspace-ui";
import { useAuth } from "@/components/auth-provider";
import { assessmentById, assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { performanceLabel } from "@skillmetry/shared/lib/assessments/grading";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import type { AssessmentAttempt, AssessmentId, AssessmentSession } from "@skillmetry/shared/types/domain";

type ResultState = { attempt: AssessmentAttempt; previousScore: number | null };

function scoreTone(score: number): "success" | "warning" {
  return score >= 75 ? "success" : "warning";
}

function AssessmentExperience() {
  const requestedAssessment = useSearchParams().get("assessment");
  const { user } = useAuth();
  const { attempts, illustrative, status, message, refresh } = useAssessmentProfile();
  const [chosen, setChosen] = useState<AssessmentId>(assessmentCatalog[0].id);
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ResultState | null>(null);
  const [pending, setPending] = useState<"start" | "submit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const assessment = assessmentById[chosen];
  const latest = useMemo(() => attempts.find(attempt => attempt.assessmentId === chosen) ?? null, [attempts, chosen]);
  const answered = session?.questions.filter(question => answers[question.id] !== undefined).length ?? 0;
  const complete = Boolean(session && answered === session.questions.length);
  const progressPercent = session ? Math.round((answered / session.questions.length) * 100) : 0;

  useEffect(() => {
    const known = assessmentCatalog.find(item => item.id === requestedAssessment);
    if (!known) return;
    setChosen(known.id);
    setSession(null);
    setAnswers({});
    setResult(null);
    setError(null);
  }, [requestedAssessment]);

  function selectAssessment(id: AssessmentId) {
    setChosen(id);
    setSession(null);
    setAnswers({});
    setResult(null);
    setError(null);
  }

  async function start() {
    if (!user) return;
    setPending("start");
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/assessments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: chosen })
      });
      const body = await response.json() as { session?: AssessmentSession; error?: string };
      if (!response.ok || !body.session) throw new Error(body.error ?? "The assessment could not be started.");
      setSession(body.session);
      setAnswers({});
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "The assessment could not be started.");
    } finally {
      setPending(null);
    }
  }

  async function submit() {
    if (!session || !complete) return;
    setPending("submit");
    setError(null);
    const previousScore = latest?.score ?? null;
    try {
      const response = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId, answers })
      });
      const body = await response.json() as { attempt?: AssessmentAttempt; error?: string };
      if (!response.ok || !body.attempt) throw new Error(body.error ?? "The assessment could not be submitted.");
      setResult({ attempt: body.attempt, previousScore });
      setSession(null);
      setAnswers({});
      await refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The assessment could not be submitted.");
    } finally {
      setPending(null);
    }
  }

  return <>
    <SectionTitle eyebrow="Skill assessments" title="Measure what you know" description="Authenticated quizzes are graded on the server. The latest completed result becomes the current score while every prior attempt remains in your history."/>
    <section className="assessment-warning"><ShieldCheck aria-hidden="true"/><div><strong>{illustrative ? "Illustrative demo history" : "Server-authoritative scoring"}</strong><p>{illustrative ? "These sample results demonstrate the experience and are not connected to you. Sign in to create trusted results." : "Answer keys never reach the browser. Students can read results but cannot create or edit grades directly."}</p></div>{!user ? <Link className="btn btn-primary" href="/auth/sign-in?next=/assessments"><LockKeyhole aria-hidden="true"/>Sign in to assess</Link> : null}</section>

    <div className="assessment-layout">
      <aside className="assessment-picker"><span className="eyebrow">Available assessments</span><h2>Choose a skill</h2><div>{assessmentCatalog.map(item => { const selected = item.id === chosen; const itemLatest = attempts.find(attempt => attempt.assessmentId === item.id); return <button type="button" key={item.id} className={selected ? "selected" : ""} disabled={pending !== null} onClick={() => selectAssessment(item.id)}><span className="assessment-picker-icon"><BookOpenCheck aria-hidden="true"/></span><span><strong>{item.title}</strong><small>{item.questionCount} questions · {item.estimatedMinutes} min</small></span>{itemLatest ? <StatusPill tone={scoreTone(itemLatest.score)}>{itemLatest.score}%</StatusPill> : <StatusPill tone="neutral">Not assessed</StatusPill>}</button>; })}</div></aside>

      <section className="assessment-paper">
        <div className="assessment-paper-head"><div><StatusPill tone="accent">{assessment.skillId}</StatusPill><h2>{assessment.title}</h2><p>{assessment.description}</p></div>{session ? <div className="assessment-progress"><div><strong>{answered}/{session.questions.length}</strong><span>answered</span></div><div className="assessment-progress-track" role="progressbar" aria-label="Assessment questions answered" aria-valuemin={0} aria-valuemax={session.questions.length} aria-valuenow={answered}><span style={{ width: `${progressPercent}%` }}/></div></div> : <StatusPill tone={latest ? "success" : "neutral"}>{latest ? `Latest ${latest.score}%` : "Not assessed"}</StatusPill>}</div>

        {!session && !result ? <div className="assessment-start-state"><BookOpenCheck aria-hidden="true"/><h3>{user ? "Ready for a secure attempt?" : "Sign in to begin"}</h3><p>{user ? "You have 30 minutes after starting. Immediate retakes are available after completion; only one session stays active for this assessment version." : "Secure sessions, grading, saved history, and retakes require an authenticated account."}</p>{user ? <button className="btn btn-primary" type="button" onClick={start} disabled={pending === "start"}>{pending === "start" ? <LoaderCircle className="spin" aria-hidden="true"/> : <ShieldCheck aria-hidden="true"/>}{pending === "start" ? "Starting securely…" : latest ? "Start another attempt" : "Start assessment"}</button> : <Link className="btn btn-primary" href="/auth/sign-in?next=/assessments">Sign in</Link>}</div> : null}

        {session ? <><div className="question-list">{session.questions.map((question, index) => <fieldset key={question.id} disabled={pending === "submit"}><legend><span>{String(index + 1).padStart(2, "0")}</span>{question.prompt}</legend>{question.choices.map((choice, choiceIndex) => { const selected = answers[question.id] === choiceIndex; return <label key={choice}><input className="sr-only" type="radio" name={question.id} checked={selected} onChange={() => setAnswers(current => ({ ...current, [question.id]: choiceIndex }))}/><span className="choice-control">{selected ? <Check aria-hidden="true"/> : String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span></label>; })}</fieldset>)}</div><div className="assessment-submit"><span><Clock3 aria-hidden="true"/>Session expires {new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(session.expiresAt))}</span><button className="btn btn-primary" type="button" disabled={!complete || pending === "submit"} onClick={submit}>{pending === "submit" ? <LoaderCircle className="spin" aria-hidden="true"/> : null}{pending === "submit" ? "Grading securely…" : "Submit assessment"}</button></div></> : null}

        {result ? <div className={`assessment-outcome ${result.attempt.passed ? "passed" : "retry"}`} role="status">{result.attempt.passed ? <CheckCircle2 aria-hidden="true"/> : <X aria-hidden="true"/>}<div><span>Trusted result saved</span><h3>{result.attempt.score}% · {performanceLabel(result.attempt.score)}</h3><p>{result.previousScore === null ? `This is your first measured score for this skill. The pass threshold for this version is ${result.attempt.passThreshold}%.` : result.attempt.score > result.previousScore ? `Improved by ${result.attempt.score - result.previousScore} points from your previous score.` : result.attempt.score < result.previousScore ? `Changed by ${result.attempt.score - result.previousScore} points from your previous score.` : "Your score is unchanged from the previous attempt."}</p></div><button className="btn btn-quiet" type="button" onClick={() => setResult(null)}><RotateCcw aria-hidden="true"/>View retake</button></div> : null}

        {error ? <div className="auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span><button className="btn btn-quiet" type="button" onClick={() => setError(null)}>Dismiss</button></div> : null}
      </section>
    </div>

    <section className="attempt-history"><div className="panel-header"><div><span className="eyebrow">Immutable history</span><h2>Completed attempts</h2></div><StatusPill tone={status === "error" || status === "offline" ? "warning" : "neutral"}>{attempts.length} total</StatusPill></div>{message ? <p className="note">{message}</p> : null}{attempts.length ? <div className="attempt-table">{attempts.map((attempt, index) => { const previous = attempts.slice(index + 1).find(item => item.skillId === attempt.skillId); const delta = previous ? attempt.score - previous.score : null; return <div key={attempt.id}><span>{attempt.passed ? <CheckCircle2 aria-hidden="true"/> : <X aria-hidden="true"/>}</span><div><strong>{assessmentById[attempt.assessmentId]?.title ?? attempt.assessmentId}</strong><small>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(attempt.completedAt))} · v{attempt.assessmentVersion} · {attempt.passed ? "Passed" : "Below pass"} at {attempt.passThreshold}%</small></div>{delta !== null ? <span className="attempt-delta">{delta > 0 ? <TrendingUp aria-hidden="true"/> : delta < 0 ? <TrendingDown aria-hidden="true"/> : null}{delta > 0 ? "+" : ""}{delta}</span> : null}<StatusPill tone={scoreTone(attempt.score)}>{attempt.score}%</StatusPill></div>; })}</div> : <EmptyState title="No completed assessments" description="Unassessed means unknown, not 0%. Start a quiz to create your first trusted score."/>}</section>
  </>;
}

export default function Assessments() {
  return <Suspense fallback={<p className="assessment-warning" role="status">Loading assessments.</p>}><AssessmentExperience/></Suspense>;
}
