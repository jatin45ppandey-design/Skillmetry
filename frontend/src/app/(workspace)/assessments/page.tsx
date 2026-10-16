"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpenCheck, Check, CheckCircle2, Clock3, LoaderCircle, LockKeyhole, RotateCcw, ShieldCheck, TrendingDown, TrendingUp, X } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { EmptyState, StatusPill } from "@/components/workspace-ui";
import { DiagnosticResultPanel } from "@/components/diagnostic-result-panel";
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
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [reviewAttemptId, setReviewAttemptId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const assessment = assessmentById[chosen];
  const latest = useMemo(() => attempts.find(attempt => attempt.assessmentId === chosen) ?? null, [attempts, chosen]);
  const answered = session?.questions.filter(question => answers[question.id] !== undefined).length ?? 0;
  const complete = Boolean(session && answered === session.questions.length);
  const progressPercent = session ? Math.round((answered / session.questions.length) * 100) : 0;
  const secondsRemaining = session ? Math.max(0, Math.floor((Date.parse(session.expiresAt) - currentTime) / 1000)) : 0;
  const expired = Boolean(session && secondsRemaining === 0);
  useEffect(() => {
    if (!session) return;
    setCurrentTime(Date.now());
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session?.sessionId]);
  useEffect(() => {
    if (!session || !user) return;
    try {
      sessionStorage.setItem(`skillmetry-quiz-draft:${user.id}:${session.sessionId}`, JSON.stringify(answers));
    } catch { /* Storage may be unavailable in private browsing. */ }
  }, [answers, session?.sessionId, user?.id]);

  useEffect(() => {
    const known = assessmentCatalog.find(item => item.id === requestedAssessment);
    if (!known) return;
    setChosen(known.id);
    setSession(null);
    setAnswers({});
    setResult(null);
    setError(null);
    setActiveQuestionIndex(0);
    setFlagged([]);
    setReviewAttemptId(null);
  }, [requestedAssessment]);

  function selectAssessment(id: AssessmentId) {
    setChosen(id);
    setSession(null);
    setAnswers({});
    setResult(null);
    setError(null);
    setActiveQuestionIndex(0);
    setFlagged([]);
    setReviewAttemptId(null);
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
      // The server remains the authority for session ID, question order and expiry.
      // Local drafts only restore the student's own in-progress selections.
      let draft: Record<string, number> = {};
      try {
        const raw = sessionStorage.getItem(`skillmetry-quiz-draft:${user.id}:${body.session.sessionId}`);
        const parsed = raw ? JSON.parse(raw) as Record<string, unknown> : {};
        for (const question of body.session.questions) {
          const answer = parsed[question.id];
          if (typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < question.choices.length) {
            draft[question.id] = answer;
          }
        }
      } catch { /* Optional local draft only. */ }
      setSession(body.session);
      setAnswers(draft);
      setFlagged([]);
      setActiveQuestionIndex(0);
      setReviewAttemptId(null);
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
      setReviewAttemptId(body.attempt.assessmentVersion === "2026.3" ? body.attempt.id : null);
      if (user) {
        try { sessionStorage.removeItem(`skillmetry-quiz-draft:${user.id}:${session.sessionId}`); } catch { /* Optional local draft only. */ }
      }
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

        {session ? <div className="diagnostic-quiz-workspace">
          <div className="diagnostic-question-toolbar">
            <div><span className="eyebrow">Question {activeQuestionIndex + 1} of {session.questions.length}</span>
              <p>{answered} answered · {flagged.length} flagged</p></div>
            <span role="timer" aria-live="off"><Clock3 aria-hidden="true"/> {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2,"0")} remaining</span>
          </div>
          <nav className="diagnostic-question-palette" aria-label="Assessment question palette">
            {session.questions.map((question,index) => <button type="button" key={question.id}
              aria-label={`Question ${index+1}, ${answers[question.id]===undefined?"unanswered":"answered"}${flagged.includes(question.id)?", flagged":""}`}
              aria-current={index===activeQuestionIndex?"step":undefined}
              className={`${index===activeQuestionIndex?"active":""} ${answers[question.id]!==undefined?"answered":""} ${flagged.includes(question.id)?"flagged":""}`}
              disabled={pending === "submit" || expired}
              onClick={() => setActiveQuestionIndex(index)}>{index+1}{flagged.includes(question.id)?" •":""}</button>)}
          </nav>
          {expired ? <div className="auth-error" role="alert">This session expired. The server will not accept late answers.
            <button className="btn btn-outline" type="button" onClick={() => {setSession(null);setAnswers({});}}>Start a new attempt</button>
          </div> : <div className="question-list">
            {session.questions.filter((_,index)=>index===activeQuestionIndex).map(question =>
              <fieldset key={question.id} disabled={pending === "submit"}>
                <legend><span>{String(activeQuestionIndex+1).padStart(2,"0")}</span>{question.prompt}</legend>
                {question.choices.map((choice,choiceIndex)=>{
                  const selected=answers[question.id]===choiceIndex;
                  return <label key={choiceIndex}><input className="sr-only" type="radio" name={question.id}
                    checked={selected} onChange={()=>setAnswers(current=>({...current,[question.id]:choiceIndex}))}/>
                    <span className="choice-control">{selected?<Check aria-hidden="true"/>:String.fromCharCode(65+choiceIndex)}</span><span>{choice}</span>
                  </label>;
                })}
              </fieldset>)}
            <div className="diagnostic-question-actions">
              <button className="btn btn-quiet" type="button" disabled={activeQuestionIndex===0||pending==="submit"}
                onClick={()=>setActiveQuestionIndex(index=>Math.max(0,index-1))}>Previous</button>
              <button className="btn btn-outline" type="button" disabled={pending==="submit"}
                onClick={()=>{const id=session.questions[activeQuestionIndex].id;setFlagged(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);}}>
                {flagged.includes(session.questions[activeQuestionIndex].id)?"Remove flag":"Flag for review"}
              </button>
              <button className="btn btn-primary" type="button" disabled={activeQuestionIndex>=session.questions.length-1||pending==="submit"}
                onClick={()=>setActiveQuestionIndex(index=>Math.min(session.questions.length-1,index+1))}>Next question</button>
            </div>
          </div>}
          <div className="assessment-submit"><span><Clock3 aria-hidden="true"/>Expires {new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(new Date(session.expiresAt))}</span>
            <button className="btn btn-primary" type="button" disabled={!complete||pending==="submit"||expired} onClick={submit}>
              {pending==="submit"?<LoaderCircle className="spin" aria-hidden="true"/>:null}
              {pending==="submit"?"Grading securely…":"Submit complete assessment"}
            </button>
          </div>
        </div> : null}

        {result ? <div className={`assessment-outcome ${result.attempt.passed ? "passed" : "retry"}`} role="status">{result.attempt.passed ? <CheckCircle2 aria-hidden="true"/> : <X aria-hidden="true"/>}<div><span>Trusted result saved</span><h3>{result.attempt.score}% · {performanceLabel(result.attempt.score)}</h3><p>{result.previousScore === null ? `This is your first measured score for this skill. The pass threshold for this version is ${result.attempt.passThreshold}%.` : result.attempt.score > result.previousScore ? `Improved by ${result.attempt.score - result.previousScore} points from your previous score.` : result.attempt.score < result.previousScore ? `Changed by ${result.attempt.score - result.previousScore} points from your previous score.` : "Your score is unchanged from the previous attempt."}</p></div><button className="btn btn-quiet" type="button" onClick={() => setResult(null)}><RotateCcw aria-hidden="true"/>View retake</button></div> : null}

        {result?.attempt.assessmentVersion === "2026.3" ? <DiagnosticResultPanel attemptId={result.attempt.id}/> : null}

        {error ? <div className="auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span><button className="btn btn-quiet" type="button" onClick={() => setError(null)}>Dismiss</button></div> : null}
      </section>
    </div>

    <section className="attempt-history"><div className="panel-header"><div><span className="eyebrow">Immutable history</span><h2>Completed attempts</h2></div><StatusPill tone={status === "error" || status === "offline" ? "warning" : "neutral"}>{attempts.length} total</StatusPill></div>{message ? <p className="note">{message}</p> : null}{attempts.length ? <div className="attempt-table">{attempts.map((attempt, index) => { const previous = attempts.slice(index + 1).find(item => item.skillId === attempt.skillId); const delta = previous ? attempt.score - previous.score : null; return <div key={attempt.id}><span>{attempt.passed ? <CheckCircle2 aria-hidden="true"/> : <X aria-hidden="true"/>}</span><div><strong>{assessmentById[attempt.assessmentId]?.title ?? attempt.assessmentId}</strong><small>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(attempt.completedAt))} · v{attempt.assessmentVersion} · {attempt.passed ? "Passed" : "Below pass"} at {attempt.passThreshold}%</small></div>{delta !== null ? <span className="attempt-delta">{delta > 0 ? <TrendingUp aria-hidden="true"/> : delta < 0 ? <TrendingDown aria-hidden="true"/> : null}{delta > 0 ? "+" : ""}{delta}</span> : null}<StatusPill tone={scoreTone(attempt.score)}>{attempt.score}%</StatusPill>{attempt.assessmentVersion === "2026.3" ?
            <button type="button" className="btn btn-quiet" onClick={() => setReviewAttemptId(current => current === attempt.id ? null : attempt.id)}>
              {reviewAttemptId === attempt.id ? "Hide diagnosis" : "View diagnosis"}
            </button> : null}</div>; })}</div> : <EmptyState title="No completed assessments" description="Unassessed means unknown, not 0%. Start a quiz to create your first trusted score."/>}</section>
    {reviewAttemptId && reviewAttemptId !== result?.attempt.id ? <DiagnosticResultPanel key={reviewAttemptId} attemptId={reviewAttemptId}/> : null}
  </>;
}

export default function Assessments() {
  return <Suspense fallback={<p className="assessment-warning" role="status">Loading assessments.</p>}><AssessmentExperience/></Suspense>;
}
