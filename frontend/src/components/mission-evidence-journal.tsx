"use client";

import Link from "next/link";
import { missions } from "@skillmetry/shared/data/catalog";
import { isSafeEvidenceUrl } from "@skillmetry/shared/lib/mission-evidence";
import { useMissionSubmissions } from "@/hooks/use-mission-submissions";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function MissionEvidenceJournal() {
  const { records, status } = useMissionSubmissions();
  const submitted = records.filter(item => item.status === "submitted");
  return <section className="mission-evidence-journal" aria-labelledby="mission-evidence-journal-title">
    <div className="resource-section-head">
      <div><span className="eyebrow">Chapter 05 / Project work</span>
        <h2 id="mission-evidence-journal-title">Your submitted projects</h2></div>
      <Link href="/missions" className="text-link">Open missions →</Link>
    </div>
    <p className="note">Project evidence is student-submitted and unverified. It is kept separate from server-graded quiz results and never produces a numerical skill score.</p>
    {status === "loading" ? <p role="status">Loading your private submissions…</p> : null}
    {status === "error" ? <p role="alert">Project records are temporarily unavailable. Your quiz results are unaffected.</p> : null}
    {status === "demo" ? <p>Sign in to keep a private project journal. Demo data is illustrative only.</p> : null}
    {status === "ready" && !submitted.length ? <p>No project evidence submitted yet. Start with a curated mission and save your first draft.</p> : null}
    {status === "ready" && submitted.length ? <div className="mission-journal-list">
      {submitted.map(record => {
        const mission = missions.find(item => item.id === record.missionId);
        return <article key={record.missionId}>
          <div><strong>{mission?.title ?? "Archived project"}</strong>
            <p>Self-reported · unverified · {record.submittedAt ? dateFormatter.format(new Date(record.submittedAt)) : "date unknown"}</p>
            {record.reflection ? <small>{record.reflection}</small> : null}
          </div>
          {record.evidenceUrl && isSafeEvidenceUrl(record.evidenceUrl) ?
            <a href={record.evidenceUrl} target="_blank" rel="noopener noreferrer">View evidence ↗</a> : null}
        </article>;
      })}
    </div> : null}
  </section>;
}
