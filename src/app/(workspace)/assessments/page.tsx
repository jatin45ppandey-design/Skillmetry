"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, Check, CheckCircle2, Clock3, RotateCcw, ShieldAlert, X } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { EmptyState, StatusPill } from "@/components/workspace-ui";
import { assessments, skillById } from "@/data/catalog";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Assessments() {
  const {attempts,recordAssessment} = useSkillmetry();
  const [chosen,setChosen] = useState(assessments[0].id);
  const [answers,setAnswers] = useState<Record<string,number>>({});
  const [outcome,setOutcome] = useState<{score:number;passed:boolean}|null>(null);
  const quiz = useMemo(() => assessments.find(item => item.id === chosen) ?? assessments[0],[chosen]);
  const answered = quiz.questions.filter(question => answers[question.id] !== undefined).length;
  const complete = answered === quiz.questions.length;

  function selectAssessment(id:string) { setChosen(id); setAnswers({}); setOutcome(null); }
  function grade() {
    if (!complete) return;
    const correct = quiz.questions.filter(question => answers[question.id] === question.correctIndex).length;
    const score = Math.round(100 * correct / quiz.questions.length);
    const passed = score >= 67;
    recordAssessment({assessmentId:quiz.id,score,passed,attemptedAt:new Date().toISOString()});
    setOutcome({score,passed});
  }

  return <><SectionTitle eyebrow="Skill assessments" title="Add an assessed signal" description="Short local quizzes test foundational knowledge. Results are recorded separately and never presented as verified mastery."/><section className="assessment-warning"><ShieldAlert aria-hidden="true"/><div><strong>Demo-only evaluation</strong><p>Answer keys are currently shipped to the browser. These checks are useful for product feedback, not credentials or secure evaluation.</p></div></section><div className="assessment-layout"><aside className="assessment-picker"><span className="eyebrow">Available checks</span><h2>Choose a skill</h2><div>{assessments.map(assessment => { const selected = assessment.id === chosen; const latest = [...attempts].reverse().find(attempt => attempt.assessmentId === assessment.id); return <button type="button" key={assessment.id} className={selected ? "selected" : ""} onClick={()=>selectAssessment(assessment.id)}><span className="assessment-picker-icon"><BookOpenCheck aria-hidden="true"/></span><span><strong>{assessment.title}</strong><small>{skillById[assessment.skillId].label} · {assessment.questions.length} questions</small></span>{latest ? <StatusPill tone={latest.passed ? "success" : "warning"}>{latest.score}%</StatusPill> : null}</button>; })}</div></aside><section className="assessment-paper"><div className="assessment-paper-head"><div><StatusPill tone="accent">{skillById[quiz.skillId].label}</StatusPill><h2>{quiz.title}</h2><p>Choose one answer for each question.</p></div><div className="assessment-progress"><strong>{answered}/{quiz.questions.length}</strong><span>answered</span></div></div><div className="question-list">{quiz.questions.map((question,index) => <fieldset key={question.id} disabled={outcome !== null}><legend><span>{String(index+1).padStart(2,"0")}</span>{question.prompt}</legend>{question.choices.map((choice,choiceIndex) => { const selected = answers[question.id] === choiceIndex; return <label key={choice}><input className="sr-only" type="radio" name={question.id} checked={selected} onChange={()=>setAnswers(current=>({...current,[question.id]:choiceIndex}))}/><span className="choice-control">{selected ? <Check aria-hidden="true"/> : String.fromCharCode(65+choiceIndex)}</span><span>{choice}</span></label>; })}</fieldset>)}</div>{outcome ? <div className={`assessment-outcome ${outcome.passed ? "passed" : "retry"}`} role="status">{outcome.passed ? <CheckCircle2 aria-hidden="true"/> : <AlertTriangle aria-hidden="true"/>}<div><span>Assessment recorded</span><h3>{outcome.score}% · {outcome.passed ? "Foundational check passed" : "More practice recommended"}</h3><p>The result was added to your evidence log. Your self-reported skill level and role coverage did not change.</p></div><button className="btn btn-quiet" type="button" onClick={()=>{setAnswers({});setOutcome(null);}}><RotateCcw aria-hidden="true"/>Try again</button></div> : <div className="assessment-submit"><span><Clock3 aria-hidden="true"/>No time limit in this demo</span><button className="btn btn-primary" type="button" disabled={!complete} onClick={grade}>Submit assessment</button></div>}</section></div><section className="attempt-history"><div className="panel-header"><div><span className="eyebrow">Evidence log</span><h2>Recent attempts</h2></div><StatusPill tone="neutral">{attempts.length} total</StatusPill></div>{attempts.length ? <div className="attempt-table">{attempts.slice(-6).reverse().map((attempt,index) => { const assessment = assessments.find(item => item.id === attempt.assessmentId); return <div key={`${attempt.attemptedAt}-${index}`}><span>{attempt.passed ? <CheckCircle2 aria-hidden="true"/> : <X aria-hidden="true"/>}</span><div><strong>{assessment?.title ?? attempt.assessmentId}</strong><small>{new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(new Date(attempt.attemptedAt))}</small></div><StatusPill tone={attempt.passed ? "success" : "warning"}>{attempt.score}%</StatusPill></div>; })}</div> : <EmptyState title="No attempts recorded" description="Your completed checks will appear here as separate assessed signals."/>}</section></>;
}
