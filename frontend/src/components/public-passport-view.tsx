"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Snapshot = {
  schema: string; title: string; career: string; disclaimer: string; name?: string;
  measuredSkills?: {name:string;score:number;completedAt:string}[];
};
export function PublicPassportView({token}:{token:string}) {
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    void fetch("/api/passport/public/"+encodeURIComponent(token),{signal:controller.signal,cache:"no-store"})
      .then(async response=>{
        const data=await response.json() as {passport?:Snapshot;error?:string};
        if(!response.ok||data.passport?.schema!=="skillmetry-passport-v1")throw new Error(data.error??"Invalid learning snapshot");
        return data.passport;
      }).then(value=>{if(!controller.signal.aborted){setSnapshot(value);setLoading(false);}})
      .catch(()=>{if(!controller.signal.aborted){setError("This share link is unavailable, revoked or expired.");setLoading(false);}});
    return ()=>controller.abort();
  },[token]);
  return <div className="auth-form">
    <span className="eyebrow">Skillmetry · Student-consented snapshot</span>
    <h1>Learning Passport</h1>
    {loading?<p role="status">Loading shared learning snapshot…</p>:null}
    {error?<p role="alert">{error}</p>:null}
    {snapshot?<div className="studio-ai-results">
      {snapshot.name?<h2>{snapshot.name}</h2>:null}
      <p>Learning direction: <strong>{snapshot.career}</strong></p>
      {snapshot.measuredSkills?.length?<div><h3>Shared quiz evidence</h3>
        {snapshot.measuredSkills.map((item,i)=><p key={i}><strong>{item.name}</strong> · {item.score}% · {new Date(item.completedAt).toLocaleDateString()}</p>)}
      </div>:<p>No quiz scores shared in this snapshot.</p>}
      <p>{snapshot.disclaimer}</p>
      <small>Privacy note: The student selected these fields. This page is not independently verified project evidence or an employment certificate.</small>
    </div>:null}
    <Link href="/" className="btn btn-outline">Explore Skillmetry</Link>
  </div>;
}
