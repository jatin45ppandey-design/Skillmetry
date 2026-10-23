"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, Layers3 } from "lucide-react";
import { getCurriculumCoverageReport } from "@skillmetry/shared/lib/curriculum-coverage";

/** Read-only source coverage keeps editorial publishing separate from catalog integrity. */
export function AdminCurriculumCoverage() {
  const report = getCurriculumCoverageReport();
  const unresolved = report.unresolved;
  const unassessed = report.skills.filter(skill => !skill.assessmentAvailable);
  const duplicateCount = report.totals.resourceDuplicateIds + report.totals.resourceDuplicateUrls;
  return <section className="sx-admin-curriculum-coverage" aria-labelledby="admin-curriculum-coverage-title">
    <header><div><span className="admin-eyebrow">PUBLISHED CATALOG / COVERAGE CHECK</span>
      <h2 id="admin-curriculum-coverage-title">Curriculum coverage</h2>
      <p>Static curriculum coverage is validated before it is presented to students. Draft content remains governed by the existing review and publish workflows.</p>
    </div><Layers3 aria-hidden="true"/></header>
    <div className="sx-admin-curriculum-metrics">
      <span><strong>{report.totals.careers}</strong> careers</span><span><strong>{report.totals.skills}</strong> skills</span>
      <span><strong>{report.totals.lessons}</strong> lessons</span><span><strong>{report.totals.resourcesAccepted}</strong> accepted resources</span>
    </div>
    {unresolved.length ? <div className="sx-admin-coverage-problems" role="alert"><AlertTriangle aria-hidden="true"/><div><strong>{unresolved.length} topic-resource relationships need editorial attention</strong>
      <ul>{unresolved.slice(0,8).map(item=><li key={`${item.scope}:${item.id}:${item.kind}`}>{item.id}: {item.kind}</li>)}</ul></div></div>:
      <p className="sx-admin-coverage-good"><CheckCircle2 aria-hidden="true"/>Every published topic has a lesson, primary reference, documentation path, and practice relationship; every published career has a curated video option.</p>}
    <div className="sx-admin-coverage-details">
      <p><strong>{unassessed.length}</strong> skills have no reviewed assessment. They remain <em>Not Assessed</em>; curriculum, projects, and resource activity cannot create a numerical score.</p>
      <p><strong>{duplicateCount}</strong> duplicate catalog identifiers or canonical URLs detected. URL reachability remains an editorial check, not a learner-session claim.</p>
    </div>
    <p className="note">{report.totals.resourcesUnverified} resource remains editorially unverified. Link reachability is checked outside the learner session; this view does not claim a URL is live merely because it is listed.</p>
    <Link href="/learn" className="btn btn-outline">Preview student explorer <ExternalLink size={16} aria-hidden="true"/></Link>
  </section>;
}
