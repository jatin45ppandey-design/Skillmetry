import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { ContentSkeleton } from "@/components/motion-ui";
import type { LucideIcon } from "lucide-react";

export function StatusPill({tone = "neutral", children}:{tone?:"neutral"|"accent"|"success"|"warning";children:React.ReactNode}) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

export function MetricCard({label,value,suffix,detail,icon:Icon,tone="default"}:{label:string;value:string|number;suffix?:string;detail:string;icon?:LucideIcon;tone?:"default"|"accent"}) {
  return <article className={`metric-card ${tone === "accent" ? "metric-card-accent" : ""}`}>
    <div className="metric-card-head"><span>{label}</span>{Icon ? <Icon aria-hidden="true"/> : null}</div>
    <div className="metric-card-value">{value}{suffix ? <span>{suffix}</span> : null}</div>
    <p>{detail}</p>
  </article>;
}

export function EmptyState({title,description,actionHref,actionLabel}:{title:string;description:string;actionHref?:string;actionLabel?:string}) {
  return <div className="empty-state"><div className="empty-state-icon"><AlertCircle aria-hidden="true"/></div><strong>{title}</strong><p>{description}</p>{actionHref && actionLabel ? <Link className="text-link" href={actionHref}>{actionLabel}<ArrowRight aria-hidden="true"/></Link> : null}</div>;
}

export function LoadingState({label="Loading your workspace"}:{label?:string}) {
  return <ContentSkeleton kind="workspace" label={label}/>;
}

export function ErrorState({title="This view could not be loaded",onRetry}:{title?:string;onRetry:()=>void}) {
  return <div className="state-page" role="alert"><AlertCircle aria-hidden="true"/><strong>{title}</strong><p>Your saved profile has not been changed.</p><button className="btn btn-primary" onClick={onRetry}>Try again</button></div>;
}

export function StepMarker({step,label,active,complete}:{step:number;label:string;active:boolean;complete:boolean}) {
  return <div className={`step-marker ${active ? "active" : ""} ${complete ? "complete" : ""}`}><span>{complete ? <CheckCircle2 aria-hidden="true"/> : step}</span><small>{label}</small></div>;
}
