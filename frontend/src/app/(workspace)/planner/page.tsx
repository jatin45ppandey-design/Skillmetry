"use client";
import {ActivityIndicator, ActionSpinner} from "@/components/motion-ui";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {SectionTitle} from "@/components/section-title";
import {useAuth} from "@/components/auth-provider";
import {useAssessmentProfile} from "@/hooks/use-assessment-profile";
import {useSkillmetry} from "@/store/use-skillmetry";
import {buildWeeklyStudyPlan,weekStartUtc,type StudyTask,type StudyTaskStatus} from "@skillmetry/shared/lib/learning-plan";

const enabled=process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true";
export default function Planner() {
  const {user}=useAuth();
  const {preferences}=useSkillmetry();
  const {scores,illustrative}=useAssessmentProfile();
  const [tasks,setTasks]=useState<StudyTask[]>([]);
  const [view,setView]=useState<"all"|"pending"|"completed">("all");
  const [loading,setLoading]=useState(false);
  const [pending,setPending]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [week,setWeek]=useState(weekStartUtc(new Date()));
  const preview=useMemo(()=>buildWeeklyStudyPlan({learning:preferences.learning,trustedScores:scores,
    hoursPerWeek:preferences.hoursPerWeek,monday:week}),[preferences,scores,week]);
  const persisted=Boolean(user&&enabled);
  const refresh=useCallback(async()=>{
    if(!persisted){setTasks([]);return;}
    setLoading(true);setError(null);
    try{
      const response=await fetch("/api/learning/plan",{cache:"no-store"});
      const body=await response.json() as {tasks?:StudyTask[];week?:string;error?:string};
      if(!response.ok)throw new Error(body.error??"Unable to load tasks");
      setTasks(body.tasks??[]);if(body.week)setWeek(body.week);
    }catch(e){setError(e instanceof Error?e.message:"Unable to load tasks");}
    finally{setLoading(false);}
  },[persisted]);
  useEffect(()=>{void refresh();},[refresh]);
  async function request(method:"POST"|"PATCH",task?:StudyTask,status?:StudyTaskStatus,plannedDate?:string){
    setPending(task?.taskKey??"generate");setError(null);
    try{
      const response=await fetch("/api/learning/plan",{
        method,headers:{"Content-Type":"application/json"},
        body:method==="POST"?"{}":JSON.stringify({taskKey:task?.taskKey,status,plannedDate})
      });
      const body=await response.json() as {tasks?:StudyTask[];task?:StudyTask;error?:string};
      if(!response.ok)throw new Error(body.error??"Task could not be saved");
      if(body.tasks)setTasks(body.tasks);
      if(body.task)setTasks(items=>items.map(item=>item.taskKey===body.task?.taskKey?body.task:item));
    }catch(e){setError(e instanceof Error?e.message:"Study plan update failed");}
    finally{setPending(null);}
  }
  const visible=persisted?tasks:preview;
  const shownTasks=visible.filter(task=>view==="all"||(view==="completed"?task.status==="completed":task.status!=="completed"&&task.status!=="skipped"));
  const completed=visible.filter(t=>t.status==="completed").length;
  const focus=visible.filter(t=>t.status!=="skipped");
  const upcoming=visible.find(t=>t.status==="in_progress")??visible.find(t=>t.status==="todo");
  const nextTaskHref=upcoming?(upcoming.kind==="reassess"?"/assessments":upcoming.kind==="practice"?"/lab":"/resources?skill="+encodeURIComponent(upcoming.skillId)):"/roadmap";
  return <>
    <SectionTitle eyebrow="Chapter 05 / Learning planner" title="Your weekly learning rhythm"
      description="A practical plan based on selected goals, available study hours and real quiz evidence. Task completion is activity—not a skill score."
      action={<Link href="/roadmap" className="btn btn-quiet">Back to roadmap</Link>}/>
    {!user?<p className="workflow-notice" role="status">Illustrative local plan. <Link href="/auth/sign-in?next=/planner">Sign in</Link> to save activity after the workflow rollout.</p>
      :!enabled?<p className="workflow-notice" role="status">Planning preview only: saved tasks require an approved database rollout. No changes are being saved.</p>:null}
    {illustrative?<p className="note">The example quiz results shown in demo mode are not your personal assessment evidence.</p>:null}
    {upcoming?<section className="sx-task-focus" aria-label="Your next unfinished study task">
      <div><span className="sx-eyebrow">YOUR NEXT STUDY ACTION</span><h2>{upcoming.title}</h2>
      <p>{upcoming.estimatedMinutes} minutes · {upcoming.kind==="learn"?"Learning":upcoming.kind==="practice"?"Guided practice":"Assessment review"}
        · {upcoming.plannedDate}</p></div>
      <Link href={nextTaskHref} className="sx-main-action">Continue this task →</Link>
      {!persisted?<small>Preview only. Your task status is not stored until the approved database rollout.</small>:null}
    </section>:null}
    <section className="panel workflow-panel">
      <div className="workflow-top"><div><span className="eyebrow">WEEK OF {week}</span><h2>Focused learning plan</h2>
        <p className="note">{persisted?"Your private saved tasks":"Generated draft from your current learning preferences"} · {preferences.hoursPerWeek} study hours/week</p></div>
        {persisted?<button type="button" className="btn btn-primary" disabled={pending!==null||loading} onClick={()=>void request("POST")}>{pending==="generate"?<ActionSpinner label="Building your week…"/>:"Generate / fill this week"}</button>:<Link href="/settings" className="btn btn-outline">Adjust goals</Link>}
      </div>
      {loading?<div className="motion-action-status"><ActivityIndicator label="Loading your saved weekly plan…" compact/></div>:null}
      {pending?<div className="motion-action-status"><ActivityIndicator compact label={pending==="generate"?"Building your plan…":"Saving study task…"} detail="Changes are confirmed only after the server responds."/></div>:null}
      {error?<p className="auth-error" role="alert">{error}</p>:null}
      <p className="note">{completed} completed of {focus.length} active tasks. Progress is self-reported learning activity.</p>
      {!visible.length?<p>Choose a career or skill focus in settings to receive a suggested learning plan.</p>:null}
      <div className="sx-planner-view" role="group" aria-label="Filter weekly tasks">
       {(["all","pending","completed"] as const).map(value=><button type="button" key={value}
          aria-pressed={view===value} onClick={()=>setView(value)}>{value==="all"?"All tasks":value==="pending"?"To do":"Completed"}</button>)}
       <span>{shownTasks.length} shown</span>
      </div>
      <ol className="workflow-task-list sx-planner-tasks">
      {shownTasks.map(task=><li key={task.taskKey}>
        <div><strong>{task.title}</strong><small>{task.plannedDate} · {task.estimatedMinutes} min · {task.kind}</small>
        <Link href={task.kind==="reassess"?"/assessments":task.kind==="practice"?"/lab":"/resources?skill="+encodeURIComponent(task.skillId)}>Open {task.kind==="learn"?"resources":task.kind==="practice"?"practice lab":"assessments"}</Link></div>
        {persisted?<div className="workflow-inline-actions"><label className="workflow-task-status">Study date
          <input className="workflow-input" type="date" value={task.plannedDate} min={week}
            max={new Date(new Date(week+"T00:00:00Z").getTime()+6*86400000).toISOString().slice(0,10)}
            disabled={pending!==null} onChange={e=>void request("PATCH",task,task.status,e.target.value)}/>
        </label><label className="workflow-task-status">Progress<select value={task.status}
          disabled={pending!==null} onChange={event=>void request("PATCH",task,event.target.value as StudyTaskStatus)}>
          <option value="todo">To do</option><option value="in_progress">Learning</option>
          <option value="completed">Completed</option><option value="skipped">Skipped</option>
        </select></label></div>:<span className="tag">Suggested</span>}
      </li>)}
      </ol>
    </section>
  </>;
}
