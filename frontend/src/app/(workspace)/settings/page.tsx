"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { LearningGoalEditor } from "@/components/learning-goal-editor";
import { SectionTitle } from "@/components/section-title";
import { useAuth } from "@/components/auth-provider";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Settings() {
  const { name, profileSource, preferences, setPreferences, resetDemo } = useSkillmetry();
  const { configured, user, syncStatus, syncMessage } = useAuth();
  const [draft, setDraft] = useState(preferences.learning);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(preferences.learning), [preferences.learning]);

  function saveLearningGoals() {
    setPreferences({ ...preferences, learning: draft });
    setSaved(true);
  }

  const changed = JSON.stringify(draft) !== JSON.stringify(preferences.learning);
  return <><SectionTitle eyebrow="Account & privacy" title="Control your learning profile" description={user ? "Learning goals sync privately with your profile; quiz history remains immutable and server graded." : "Explore illustrative demo data locally, or sign in to take secure assessments."}/><div className="settings-stack"><section className="panel settings-profile-panel"><h2>{user ? "Cloud-connected profile" : "Local profile"}</h2><p className="small">Student: <strong>{name}</strong></p><p className="small">Data source: <strong>{profileSource === "student" ? "Student career profile" : "Illustrative demo"}</strong></p>{user ? <p className="small">Cloud status: <strong>{syncStatus}</strong></p> : null}<p className="note">{user ? syncMessage ?? "Selections save securely after you apply them." : "Reset restores the sample profile. It does not create, edit, or delete any cloud assessment result."}</p><div className="row" style={{flexWrap:"wrap",marginTop:20}}>{user ? <><Link className="btn btn-outline" href="/account">Manage account</Link><Link className="btn btn-outline" href="/feedback">Share product feedback</Link></> : configured ? <Link className="btn btn-primary" href="/auth/sign-in">Sign in for assessments</Link> : null}{!user ? <button type="button" className="btn btn-outline" onClick={() => { if (window.confirm("Reset Skillmetry's local profile to demo data?")) resetDemo(); }}>Reset local profile</button> : null}</div></section>
    <section className="panel learning-goals-panel"><div className="learning-goals-panel-head"><div><span className="eyebrow">Learning goals</span><h2>Choose what your roadmap should support</h2><p>Combine a career direction with individual skills and tools. These selections do not create assessment scores.</p></div><button type="button" className="btn btn-primary" onClick={saveLearningGoals} disabled={!changed}><Save aria-hidden="true"/>{changed ? "Save learning goals" : "Saved"}</button></div><LearningGoalEditor value={draft} onChange={value => { setDraft(value); setSaved(false); }}/>{saved && !changed ? <p className="goal-saved" role="status"><CheckCircle2 aria-hidden="true"/>Goals updated locally{user ? "; cloud sync will follow automatically." : "."}</p> : null}</section>
  </div></>;
}
