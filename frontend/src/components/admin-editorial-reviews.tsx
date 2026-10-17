"use client";
import {useCallback,useEffect,useState} from "react";
import {ActivityIndicator} from "@/components/motion-ui";
import {CheckCircle2,Clock3,ShieldCheck} from "lucide-react";
type EditorialModule="guides"|"roadmaps"|"courses"|"missions"|"assessments";

type Review={id:string;module:EditorialModule;content_id:string;requested_revision:number;
 status:"pending"|"approved"|"changes_requested";requested_at:string;review_note:string|null;requested_by:string};
type Role="owner"|"editor"|"reviewer";

export function AdminReviewRequest({module,contentId,revision,changed,role}:{
 module:EditorialModule;contentId:string;revision:number;changed:boolean;role:Role
}){
 const [enabled,setEnabled]=useState(false);
 const [review,setReview]=useState<Review|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
   const controller=new AbortController();
   setReview(null);setEnabled(false);setMessage("");
   void fetch("/api/admin/reviews",{cache:"no-store",signal:controller.signal}).then(async response=>{
     if(!response.ok)return;
     const body=await response.json() as {enabled?:boolean;reviews?:Review[]};
     if(controller.signal.aborted)return;
     setEnabled(Boolean(body.enabled));
     setReview(body.reviews?.find(item=>item.module===module&&item.content_id===contentId
       &&item.requested_revision===revision)??null);
   }).catch(()=>{});
   return()=>controller.abort();
 },[module,contentId,revision]);
 async function requestReview(){
   if(busy||changed||revision<1||role==="reviewer")return;
   setBusy(true);setMessage("");
   try{
     const response=await fetch("/api/admin/reviews",{method:"POST",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({module,contentId,revision})});
     const body=await response.json() as {review?:Review;error?:string};
     if(!response.ok||!body.review)throw new Error(body.error??"Review could not be requested.");
     setReview(body.review);
     setMessage("Saved revision submitted for independent review.");
   }catch(e){setMessage(e instanceof Error?e.message:"Review request failed.");}
   finally{setBusy(false);}
 }
 if(!enabled)return null;
 return <section className="sx-admin-review-request" aria-label="Editorial review state">
   <div><ShieldCheck size={17} aria-hidden="true"/><strong>Editorial approval</strong>
     <span>{review?.status==="approved"?<><CheckCircle2 size={15}/> Revision approved</>:
       review?.status==="pending"?<><Clock3 size={15}/> Awaiting review</>:
       review?.status==="changes_requested"?"Changes requested":
       "No review requested for this revision"}</span>
   </div>
   {review?.review_note?<p>{review.review_note}</p>:null}
   {!review&&role!=="reviewer"?<button type="button" className="btn btn-outline" onClick={()=>void requestReview()}
     disabled={changed||revision<1||busy}>{busy?"Submitting…":revision<1?"Save a draft first":changed?"Save changes before review":"Request review"}</button>:null}
   {message?<p role={message.includes("failed")||message.includes("could not")?"alert":"status"}>{message}</p>:null}
   <small>Publication requires reviewer approval only when the staged editorial rollout is enabled.</small>
 </section>;
}

export function AdminReviewQueue({role}:{role:Role}){
 const [enabled,setEnabled]=useState(false);
 const [items,setItems]=useState<Review[]>([]);
 const [pending,setPending]=useState<string|null>(null);
 const [note,setNote]=useState<Record<string,string>>({});
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [view,setView]=useState<"pending"|"approved"|"changes_requested">("pending");
 const refresh=useCallback(async()=>{
   setLoading(true);setError("");
   try{
     const response=await fetch("/api/admin/reviews",{cache:"no-store"});
     const body=await response.json() as {enabled?:boolean;reviews?:Review[];error?:string};
     if(!response.ok)throw new Error(body.error??"Review queue unavailable.");
     setEnabled(Boolean(body.enabled));setItems(body.reviews??[]);
   }catch(e){setError(e instanceof Error?e.message:"Could not load review queue.");}
   finally{setLoading(false);}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function decide(id:string,decision:"approved"|"changes_requested"){
   if(role!=="reviewer"||pending)return;
   setPending(id);setError("");
   try{
     const response=await fetch("/api/admin/reviews",{method:"PATCH",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({id,decision,note:note[id]??""})});
     const body=await response.json() as {error?:string;review?:{id:string;status:Review["status"]}};
     if(!response.ok||!body.review)throw new Error(body.error??"Review was not recorded.");
     setItems(old=>old.map(item=>item.id===id?{...item,status:body.review!.status}:item));
   }catch(e){setError(e instanceof Error?e.message:"Could not record review.");}
   finally{setPending(null);}
 }
 if(!enabled&&!loading&&!error)return null;
 return <section className="sx-admin-review-queue" aria-label="Editorial approvals">
   <div className="sx-admin-review-queue-head"><div><span className="admin-eyebrow">STAGED EDITORIAL WORKFLOW</span>
     <h3>Review queue</h3></div><button type="button" className="btn btn-outline"
     disabled={loading} onClick={()=>void refresh()}>Refresh</button></div>
   {loading?<ActivityIndicator compact label="Loading review decisions…"/>:null}
   {error?<p role="alert">{error}</p>:null}
   {enabled?<div className="sx-admin-review-filter" role="group" aria-label="Filter editorial reviews">
     {(["pending","approved","changes_requested"] as const).map(state=><button type="button"
        key={state} aria-pressed={view===state} onClick={()=>setView(state)}>
        {state==="pending"?"Awaiting review":state==="approved"?"Approved":"Changes requested"}
        <span>{items.filter(item=>item.status===state).length}</span>
     </button>)}
   </div>:null}
   {!loading&&!items.some(row=>row.status===view)?<p role="status">No reviews in this status.</p>:null}
   {items.filter(row=>row.status===view).map(row=><article className="sx-admin-review-row" key={row.id}>
     <div><strong>{row.module} · {row.content_id}</strong>
       <small>Saved revision {row.requested_revision} · Requested {new Date(row.requested_at).toLocaleDateString()}</small></div>
     {role==="reviewer"&&row.status==="pending"?<div className="sx-admin-review-controls">
       <label>Optional decision note<textarea rows={2} maxLength={600} value={note[row.id]??""}
         onChange={event=>setNote(old=>({...old,[row.id]:event.target.value}))}/></label>
       <button type="button" className="btn btn-outline" disabled={pending!==null}
         onClick={()=>void decide(row.id,"changes_requested")}>Request changes</button>
       <button type="button" className="btn btn-primary" disabled={pending!==null}
         onClick={()=>void decide(row.id,"approved")}>Approve revision</button>
     </div>:<span className="sx-admin-review-waiting">Awaiting independent reviewer</span>}
   </article>)}
   <p className="sx-admin-inventory-trust">Only metadata is displayed in this queue. Review the saved content in its editor before approving.</p>
 </section>;
}
