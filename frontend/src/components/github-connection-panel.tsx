"use client";

import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {useAuth} from "@/components/auth-provider";

export function GitHubConnectionPanel() {
  const {user}=useAuth();
  const [connected,setConnected]=useState(false);
  const [account,setAccount]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    if(!user){setLoading(false);setConnected(false);return;}
    const controller=new AbortController();
    void fetch("/api/github/connection",{signal:controller.signal,cache:"no-store"})
      .then(async response=>{const body=await response.json() as {connected?:boolean;account?:string};
        if(!response.ok)throw new Error("Unable to check GitHub link");
        if(!controller.signal.aborted){setConnected(Boolean(body.connected));setAccount(body.account??null);setLoading(false);}
      }).catch(()=>{if(!controller.signal.aborted){setLoading(false);setError("GitHub connection status is unavailable.");}});
    return ()=>controller.abort();
  },[user?.id]);
  async function connect() {
    if(!user)return; setBusy(true);setError(null);
    try{
      const {data,error:authError}=await createClient().auth.linkIdentity({
        provider:"github",options:{redirectTo:window.location.origin+"/auth/callback?next=/settings"}
      });
      if(authError||!data.url)throw new Error(authError?.message??"GitHub linking is unavailable.");
      window.location.assign(data.url);
    }catch(cause){setError(cause instanceof Error?cause.message:"GitHub linking failed.");setBusy(false);}
  }
  async function disconnect() {
    if(!window.confirm("Disconnect your linked GitHub identity? Repository submissions remain unverified."))return;
    setBusy(true);setError(null);
    try{
      const r=await fetch("/api/github/connection",{method:"DELETE"});
      const data=await r.json() as {error?:string};
      if(!r.ok)throw new Error(data.error??"Could not disconnect.");
      setConnected(false);setAccount(null);
    }catch(cause){setError(cause instanceof Error?cause.message:"Disconnect failed.");}
    finally{setBusy(false);}
  }
  if(!user)return null;
  return <section className="panel">
    <h2>GitHub identity connection</h2>
    <p className="note">Optional: connect your GitHub identity to compare public repository owner IDs. This checks account ownership only—not code authorship, project review or skill mastery. Private repositories are not requested.</p>
    {loading?<p role="status">Checking GitHub identity…</p>:
      <><p role="status">{connected?"Connected GitHub identity"+(account?" · "+account:""):"No GitHub identity linked"}</p>
      <button className="btn btn-outline" disabled={busy}
        type="button" onClick={()=>void (connected?disconnect():connect())}>
        {busy?"Processing…":connected?"Disconnect GitHub":"Connect GitHub identity"}
      </button></>}
    {error?<p role="alert">{error}</p>:null}
    <p className="note">GitHub OAuth account linking must be enabled in Supabase Auth. You can revoke access separately in GitHub account settings.</p>
  </section>;
}
