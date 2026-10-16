"use client";
import {useState, type FormEvent} from "react";
import Link from "next/link";
import {SectionTitle} from "@/components/section-title";
import {useAuth} from "@/components/auth-provider";
import type {PilotFeedbackInput} from "@skillmetry/shared/lib/pilot-feedback";

export default function FeedbackPage(){
  const {user}=useAuth();
  const [area,setArea]=useState<PilotFeedbackInput["area"]>("projects");
  const [rating,setRating]=useState(4);
  const [comment,setComment]=useState("");
  const [error,setError]=useState<string|null>(null);
  const [success,setSuccess]=useState(false);
  const [pending,setPending]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError(null);setPending(true);
    try{
      const r=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({area,rating,comment})});
      const json=await r.json() as {error?:string};
      if(!r.ok)throw new Error(json.error??"Feedback could not be saved.");
      setSuccess(true);
    }catch(cause){setError(cause instanceof Error?cause.message:"Feedback could not be saved.");}
    finally{setPending(false);}
  }
  return <><SectionTitle eyebrow="Student pilot / Feedback" title="Help improve the next chapter"
    description="Share voluntary product feedback. Your feedback does not affect skill scores, career recommendations or assessments."/>
    <section className="panel" style={{maxWidth:720}}>
      {!user?<p>Sign in to submit private feedback. <Link className="text-link" href="/auth/sign-in?next=/feedback">Sign in →</Link></p>:
      success?<div role="status"><h2>Thanks for helping us improve.</h2><p>You can send a new response on another day.</p></div>:
      <form onSubmit={e=>void submit(e)} className="auth-form">
        <p className="note">One response per day. Do not include contact information, secrets or personal details. This is a feedback intake, not a verified user-study result.</p>
        <label className="field">Which area?
          <select className="input" value={area} onChange={e=>setArea(e.target.value as PilotFeedbackInput["area"])}>
            <option value="onboarding">Onboarding</option><option value="assessment">Assessments</option>
            <option value="roadmap">Roadmap</option><option value="projects">Projects</option>
            <option value="accessibility">Accessibility</option><option value="other">Other</option>
          </select>
        </label>
        <label className="field">Overall experience (1–5)
          <select className="input" value={rating} onChange={e=>setRating(Number(e.target.value))}>
            {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} / 5</option>)}
          </select>
        </label>
        <label className="field">Suggestions (optional)
          <textarea className="input" rows={5} maxLength={1200} value={comment}
            onChange={e=>setComment(e.target.value)} placeholder="What worked well? What confused you?"/>
        </label>
        {error?<p className="auth-error" role="alert">{error}</p>:null}
        <button className="btn btn-primary" disabled={pending} type="submit">{pending?"Submitting…":"Send feedback"}</button>
      </form>}
    </section>
  </>;
}
