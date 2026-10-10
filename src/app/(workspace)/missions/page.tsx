"use client";
import Link from "next/link";
import { Target } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { missions, skillById } from "@/data/catalog";
import { useSkillmetry } from "@/store/use-skillmetry";
export default function Missions(){const {careerId}=useSkillmetry();return <><SectionTitle eyebrow="Mission control" title="Build what matters" description="Curated starter projects with concrete deliverables. Evidence review is a future integration."/><div className="grid-2">{missions.filter(m=>m.roleId===careerId).map(m=><section key={m.id} className="panel mission-card"><div className="row between"><Target color="#22D3EE" size={23}/><span className="tag">{m.estimatedHours} hours</span></div><h2 style={{fontSize:"1.25rem"}}>{m.title}</h2><p className="muted small">{m.description}</p><div className="tag" style={{alignSelf:"start"}}>Focus: {skillById[m.skillId].label}</div><h3 className="small">Acceptance checklist</h3><ul className="mission-list">{m.deliverables.map(d=><li key={d}>{d}</li>)}</ul><div className="note">Submit/review flow is planned. No auto-verification or mastery claims.</div><Link href="/assessments" className="btn btn-outline">Explore available skill checks →</Link></section>)}</div></>}
