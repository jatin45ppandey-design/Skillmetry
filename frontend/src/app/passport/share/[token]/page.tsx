import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {createHash} from "node:crypto";
import {createAdminClient} from "@skillmetry/backend/lib/supabase/admin";
import {hasSupabaseServerCredentials} from "@skillmetry/backend/lib/supabase/config.server";
import type {SharedPassportSnapshot} from "@skillmetry/shared/lib/passport-sharing";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Shared learning passport",robots:{index:false,follow:false}};
export default async function SharePage({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 if(!/^[A-Za-z0-9_-]{43}$/.test(token)||process.env.SKILLMETRY_PASSPORT_SHARING_ENABLED!=="true"||
   !hasSupabaseServerCredentials())notFound();
 const hash=createHash("sha256").update(token).digest("hex");
 const {data,error}=await createAdminClient().from("passport_share_links")
  .select("snapshot,expires_at,revoked_at").eq("token_hash",hash).maybeSingle();
 if(error||!data||data.revoked_at||Date.parse(data.expires_at)<=Date.now())notFound();
 const info=data.snapshot as SharedPassportSnapshot;
 if(!info||!Array.isArray(info.skills)||info.skills.length>8)notFound();
 return <main className="auth-shell"><section className="auth-card">
  <span className="eyebrow">Skillmetry / consent-based shared preview</span>
  <h1>{info.name}</h1><p>{info.career}</p>
  <p className="note">Shared quiz outcomes · created {new Date(info.issuedAt).toLocaleDateString("en-IN")}</p>
  {info.skills.map(skill=><div className="workflow-result" key={skill.id}>
    <strong>{skill.label}</strong>
    <span>{skill.score}/100</span>
    <small>Assessment {skill.assessmentVersion} · {new Date(skill.completedAt).toLocaleDateString("en-IN")}</small>
  </div>)}
  <p className="note">{info.notice}</p>
  <p className="note">This page will stop working after expiry or when the owner revokes the link.</p>
 </section></main>;
}
