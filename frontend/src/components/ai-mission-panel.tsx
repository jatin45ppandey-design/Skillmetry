"use client";

import { useState } from "react";
import type { Mission } from "@skillmetry/shared/types/domain";

type Plan = {title:string;objective:string;steps:string[];acceptanceCriteria:string[];caveats:string[]};

export function AIMissionPanel({mission,authenticated}:{mission:Mission;authenticated:boolean}) {
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [plan,setPlan]=useState<Plan|null>(null);
  async function generate() {
    setPending(true);setError(null);setPlan(null);
    try {
      const res=await fetch("/api/ai/missions",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({missionId:mission.id})});
      const json=await res.json() as {error?:string;plan?:Plan};
      if(!res.ok||!json.plan)throw new Error(json.error??"AI guidance unavailable.");
      setPlan(json.plan);
    }catch(e){setError(e instanceof Error?e.message:"AI guidance unavailable.");}
    finally{setPending(false);}
  }
  return <div className="studio-ai-option">
    <strong>Optional AI project breakdown</strong>
    <p>Send only this public curated mission brief to Gemini for a suggested plan. Not a grading or verification service. Limited to 3 requests per day.</p>
    <button className="btn btn-outline" type="button" disabled={!authenticated||pending} onClick={()=>void generate()}>
      {pending?"Generating guidance…":"Generate a suggested plan"}
    </button>
    {!authenticated?<p>Sign in to request AI guidance.</p>:null}
    {error?<p role="alert" className="note">{error}</p>:null}
    {plan?<div className="studio-ai-results" role="status">
      <h4>{plan.title}</h4><p>{plan.objective}</p><strong>Suggested steps</strong>
      <ol>{plan.steps.map((v,i)=><li key={i}>{v}</li>)}</ol>
      <strong>Acceptance criteria</strong><ul>{plan.acceptanceCriteria.map((v,i)=><li key={i}>{v}</li>)}</ul>
      {plan.caveats.length?<p>Consider: {plan.caveats.join(" · ")}</p>:null}
      <small>AI-generated and not educator-reviewed. These suggestions do not update saved missions, skills or grades.</small>
    </div>:null}
  </div>;
}
