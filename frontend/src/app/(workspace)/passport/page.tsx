"use client";

import { SectionTitle } from "@/components/section-title";
import { CareerDirectionRequired } from "@/components/career-direction-required";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { assessmentSnapshot } from "@skillmetry/shared/lib/assessments/grading";
import { selectCareer } from "@skillmetry/shared/lib/readiness";
import { useSkillmetry } from "@/store/use-skillmetry";

export default function Passport() {
  const { name, careerId, preferences, profileSource } = useSkillmetry();
  const { attempts, illustrative } = useAssessmentProfile();
  const career = selectCareer(careerId);
  const snapshot = assessmentSnapshot(career, attempts);
  if (!preferences.learning.primaryCareerId) return <><SectionTitle eyebrow="Private preview" title="Career Passport" description="A future shareable profile built on selected assessment records. Public sharing is not enabled."/><CareerDirectionRequired feature="Career Passport"/></>;
  return <><SectionTitle eyebrow="Private preview" title="Career Passport" description="A future shareable profile built on selected assessment records. Public sharing is not enabled."/><div className="panel" style={{maxWidth:730}}><div className="eyebrow">Skillmetry · Private preview</div><h2 style={{fontSize:"2rem",margin:"17px 0 5px"}}>{name}</h2><p className="muted">Exploring {career.title}</p><div className="grid-2" style={{margin:"25px 0"}}><div className="panel"><div className="stat-label">Assessment coverage</div><div className="stat-value">{snapshot.coveragePercent}%</div></div><div className="panel"><div className="stat-label">Completed attempts</div><div className="stat-value">{attempts.length}</div></div></div><p className="note">Profile source: {profileSource}. Results shown here are {illustrative ? "illustrative demo records" : "server-graded quiz records"}, not professional certification or placement prediction.</p><button className="btn btn-outline" disabled>Public sharing — coming later</button></div></>;
}
