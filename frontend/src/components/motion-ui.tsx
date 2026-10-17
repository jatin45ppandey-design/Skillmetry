import {CheckCircle2, LoaderCircle, ShieldCheck} from "lucide-react";
import type {ReactNode} from "react";

/** One consistent, accessible progress treatment. Indeterminate: never fakes a
 * completion percentage or a successful write. */
export function ActivityIndicator({label,detail,secure=false,compact=false}:{
 label:string;detail?:string;secure?:boolean;compact?:boolean
}){
 return <div className={"motion-status"+(compact?" motion-status--compact":"")} role="status" aria-live="polite" aria-atomic="true">
   <span className="motion-status-icon" aria-hidden="true">{secure?<ShieldCheck size={19}/>:<LoaderCircle size={19} className="motion-spin"/>}</span>
   <span className="motion-status-copy"><strong>{label}</strong>{detail?<small>{detail}</small>:null}</span>
   <span className="motion-status-dots" aria-hidden="true"><i/><i/><i/></span>
 </div>;
}
export function ActionSpinner({label="Working"}:{label?:string}) {
 return <span className="motion-button-label" role="status" aria-live="polite">
   <LoaderCircle size={16} className="motion-spin" aria-hidden="true"/>{label}
 </span>;
}
export function ActionSuccess({children}:{children:ReactNode}){
 return <div className="motion-success" role="status"><CheckCircle2 size={21} aria-hidden="true"/>{children}</div>;
}
/** Occupies the real shape of the app's content; no fake learner data. */
export function ContentSkeleton({kind="workspace",label="Preparing your learning space"}:{
 kind?:"workspace"|"auth"|"dashboard"|"cards";label?:string
}){
 return <section className={"motion-skeleton motion-skeleton--"+kind} aria-label={label} role="status" aria-busy="true">
   <span className="sr-only">{label}</span>
   <div className="motion-skeleton-title motion-shimmer"/>
   <div className="motion-skeleton-subtitle motion-shimmer"/>
   <div className="motion-skeleton-grid">
     <div className="motion-skeleton-card motion-shimmer"><div/><div/><div/></div>
     <div className="motion-skeleton-card motion-shimmer"><div/><div/><div/></div>
     {kind!=="auth"?<div className="motion-skeleton-card motion-shimmer"><div/><div/><div/></div>:null}
   </div>
 </section>;
}
