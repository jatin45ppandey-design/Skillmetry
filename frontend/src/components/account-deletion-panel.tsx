"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSkillmetry } from "@/store/use-skillmetry";

export function AccountDeletionPanel() {
  const [enabled,setEnabled]=useState(false);
  const [password,setPassword]=useState("");
  const [confirmation,setConfirmation]=useState("");
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const resetDemo=useSkillmetry(state=>state.resetDemo);

  useEffect(()=>{
    const controller=new AbortController();
    void fetch("/api/account/deletion",{cache:"no-store",signal:controller.signal})
      .then(async r=>{const body=await r.json() as {enabled?:boolean};if(r.ok&&!controller.signal.aborted)setEnabled(Boolean(body.enabled));})
      .catch(()=>{});
    return ()=>controller.abort();
  },[]);
  async function remove(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(!window.confirm("Permanently delete your Skillmetry account and its saved learning records? This cannot be undone."))return;
    setPending(true);setError(null);
    try {
      const response=await fetch("/api/account/deletion",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({confirmation,password})});
      const json=await response.json() as {deleted?:boolean;error?:string};
      if(!response.ok||!json.deleted)throw new Error(json.error??"Account deletion failed.");
      resetDemo();
      window.location.assign("/");
    }catch(cause){setError(cause instanceof Error?cause.message:"Account deletion failed.");}
    finally{setPending(false);}
  }
  if(!enabled)return null;
  return <section className="panel">
    <h2>Delete account permanently</h2>
    <p className="note">This permanently removes your Supabase account and associated Skillmetry records. Download your private learning record first. Supported only for password-authenticated accounts; OAuth-only and Storage-backed accounts may require assisted deletion.</p>
    <form className="auth-form" onSubmit={e=>void remove(e)}>
      <label className="field">Current account password
        <input className="input" type="password" autoComplete="current-password" minLength={8} required
          value={password} onChange={e=>setPassword(e.target.value)} disabled={pending}/>
      </label>
      <label className="field">Type DELETE MY ACCOUNT
        <input className="input" type="text" autoComplete="off" required value={confirmation}
          onChange={e=>setConfirmation(e.target.value)} disabled={pending}/>
      </label>
      {error?<p className="auth-error" role="alert">{error}</p>:null}
      <button type="submit" className="btn btn-outline" disabled={pending||confirmation!=="DELETE MY ACCOUNT"||password.length<8}>
        {pending?"Deleting account…":"Permanently delete my account"}
      </button>
    </form>
  </section>;
}
