"use client";

import Link from "next/link";
import { SectionTitle } from "@/components/section-title";
import { useAuth } from "@/components/auth-provider";
import { PassportShareControl } from "@/components/passport-share-control";
import { CareerDirectionRequired } from "@/components/career-direction-required";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { assessmentSnapshot } from "@skillmetry/shared/lib/assessments/grading";
import { selectCareer } from "@skillmetry/shared/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Passport() {
  const { name, careerId, preferences, profileSource } = useSkillmetry();
  const { attempts, illustrative } = useAssessmentProfile();
  const { user } = useAuth();
  const career = selectCareer(careerId);
  const snapshot = assessmentSnapshot(career, attempts);
  if (!preferences.learning.primaryCareerId) return <><SectionTitle eyebrow="Private preview" title="Career Passport" description="A future shareable profile built on selected assessment records. Public sharing is not enabled."/><CareerDirectionRequired feature="Career Passport"/></>;
  return <><SectionTitle eyebrow="Private preview" title="Career Passport" description="A future shareable profile built on selected assessment records. Public sharing is not enabled."/><div className="panel" style={{maxWidth:730}}><div className="eyebrow">Skillmetry · Private preview</div><h2 style={{fontSize:"2rem",margin:"17px 0 5px"}}>{name}</h2><p className="muted">Exploring {career.title}</p><div className="grid-2" style={{margin:"25px 0"}}><div className="panel"><div className="stat-label">Assessment coverage</div><div className="stat-value">{snapshot.coveragePercent}%</div></div><div className="panel"><div className="stat-label">Completed attempts</div><div className="stat-value">{attempts.length}</div></div></div><p className="note">Profile source: {profileSource}. Results shown here are {illustrative ? "illustrative demo records" : "server-graded quiz records"}, not professional certification or placement prediction.</p><div className="row" style={{flexWrap:"wrap",gap:12}}>
      {user ? <a className="btn btn-primary" href="/api/account/learning-export" download="skillmetry-learning-record.json">Download my private learning record</a>
        : <Link className="btn btn-outline" href="/auth/sign-in?next=/passport">Sign in to export real records</Link>}
      <span className="btn btn-outline" aria-disabled="true">Share only selected information</span>
    </div>
    <p className="note">Private JSON export includes your cloud learning profile and trusted quiz attempt history. Self-reported mission evidence is included only when the mission database is available. It is never a verification certificate.</p>
    {user ? <PassportShareControl /> : null}
  </div></>;
}
