"use client";
import { useEffect, useState } from "react";

export function PassportShareControl() {
  const [includeName,setIncludeName]=useState(false);
  const [includeScores,setIncludeScores]=useState(false);
  const [active,setActive]=useState(false);
  const [url,setUrl]=useState<string|null>(null);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    void fetch("/api/passport/share",{cache:"no-store",signal:controller.signal})
      .then(async r=>{const v=await r.json() as {active?:boolean};if(r.ok&&!controller.signal.aborted)setActive(Boolean(v.active));})
      .catch(()=>{});
    return ()=>controller.abort();
  },[]);
  async function request(method:"POST"|"DELETE") {
    if(method==="POST"&&!window.confirm("Create a public link with your selected information for 30 days? Previous links will stop working."))return;
    setError(null);setPending(true);
    try {
      const response=await fetch("/api/passport/share",{method,headers:{"Content-Type":"application/json"},
        body: method==="POST"?JSON.stringify({includeName,includeScores}):undefined});
      const result=await response.json() as {error?:string;shareUrl?:string};
      if(!response.ok)throw new Error(result.error??"Sharing is unavailable.");
      setActive(method==="POST");
      setUrl(method==="POST"?result.shareUrl??null:null);
    }catch(cause){setError(cause instanceof Error?cause.message:"Sharing is unavailable.");}
    finally{setPending(false);}
  }
  return <section className="studio-ai-option">
    <h3>Privacy-controlled public snapshot</h3>
    <p>Choose only what to publish. No email, project submission, private notes or raw assessment attempts will be shared. Links expire in 30 days and can be revoked at any time.</p>
    <label><input type="checkbox" checked={includeName} onChange={e=>setIncludeName(e.target.checked)}/> Include my display name</label>
    <label><input type="checkbox" checked={includeScores} onChange={e=>setIncludeScores(e.target.checked)}/> Include my latest server-graded quiz scores</label>
    {active?<p role="status">A public snapshot link is currently active. Creating another will invalidate it.</p>:null}
    <div className="mission-evidence-actions">
      <button className="btn btn-primary" disabled={pending} type="button" onClick={()=>void request("POST")}>
        {pending?"Processing…":"Generate share link"}
      </button>
      <button className="btn btn-outline" disabled={pending||!active} type="button" onClick={()=>void request("DELETE")}>
        Revoke public link
      </button>
    </div>
    {url?<label>Copy this link now (not stored in your browser):
      <input className="input" type="text" value={url} readOnly onFocus={e=>e.currentTarget.select()}/>
    </label>:null}
    {error?<p role="alert">{error}</p>:null}
    <small>Self-reported evidence stays private. Shared quiz percentages are educational diagnostics, not mastery certification.</small>
  </section>;
}
