"use client";
import {useCallback,useEffect,useState} from "react";
import {AdminReviewQueue} from "@/components/admin-editorial-reviews";
import {ActivityIndicator} from "@/components/motion-ui";
import {ArrowRight,RefreshCw,ShieldCheck} from "lucide-react";
import {AdminCurriculumCoverage} from "@/components/admin-curriculum-coverage";

export type ContentModule="guides"|"roadmaps"|"courses"|"missions"|"assessments";
type Snapshot={key:ContentModule;total:number;published:number;drafts:number;lastUpdated:string|null;truncated:boolean};
const labels:Record<ContentModule,string>={
 guides:"Learning guides",roadmaps:"Career roadmaps",courses:"Courses & lessons",
 missions:"Missions & projects",assessments:"Assessment banks"
};
export function AdminContentInventory({onManage,role}:{onManage:(key:ContentModule)=>void;role:"owner"|"editor"|"reviewer"}){
 const [data,setData]=useState<Snapshot[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const refresh=useCallback(async(signal?:AbortSignal)=>{
   setLoading(true);setError("");
   try{
     const response=await fetch("/api/admin/inventory",{cache:"no-store",signal});
     const body=await response.json() as {inventory?:Snapshot[];error?:string};
     if(!response.ok||!body.inventory)throw new Error(body.error??"Inventory temporarily unavailable.");
     if(!signal?.aborted)setData(body.inventory);
   }catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:"Could not load inventory.");}
   finally{if(!signal?.aborted)setLoading(false);}
 },[]);
 useEffect(()=>{
   const controller=new AbortController();
   void refresh(controller.signal);
   return()=>controller.abort();
 },[refresh]);
 return <section className="sx-admin-inventory" aria-labelledby="admin-inventory-heading">
   <header className="sx-admin-inventory-heading">
     <div><span className="admin-eyebrow">CONTENT OPERATIONS / READ-ONLY INVENTORY</span>
       <h2 id="admin-inventory-heading">Your learning content, in one place</h2>
       <p>Draft and published content across all five workspaces. Counts are private to permitted editors.</p>
     </div>
     <button className="btn btn-outline" type="button" disabled={loading} onClick={()=>void refresh()}>
       <RefreshCw size={17} aria-hidden="true"/> Refresh</button>
   </header>
   {loading?<ActivityIndicator compact label="Checking editorial content inventory…"/>:null}
   {error?<div className="sx-admin-inventory-error" role="alert"><span>{error}</span>
     <button type="button" className="btn btn-outline" onClick={()=>void refresh()}>Retry</button></div>:null}
   {!loading&&!error?<div className="sx-admin-inventory-grid">
     {data.map(row=><article key={row.key} className="sx-admin-inventory-card">
       <h3>{labels[row.key]}</h3>
       <div className="sx-admin-inventory-metrics">
         <span><strong>{row.total}</strong> {row.truncated?"shown":"total"}</span><span><strong>{row.published}</strong> published{row.truncated?" shown":""}</span>
         <span><strong>{row.drafts}</strong> to review{row.truncated?" shown":""}</span>
       </div>
       <small>{row.truncated?"Showing newest 250 items; counts exclude older content":
         row.lastUpdated?"Last edited "+new Date(row.lastUpdated).toLocaleDateString():"No saved content yet"}</small>
       <button className="btn btn-outline" type="button" onClick={()=>onManage(row.key)}>
         Open editor <ArrowRight size={16} aria-hidden="true"/></button>
     </article>)}
   </div>:null}
   <AdminCurriculumCoverage/>
   <AdminReviewQueue role={role}/>
   <p className="sx-admin-inventory-trust"><ShieldCheck size={16} aria-hidden="true"/>
     Inventory reports editorial metadata only. It does not display learner profiles or assessment answer keys.</p>
 </section>;
}
