"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Mission } from "@skillmetry/shared/types/domain";
import { isSafeEvidenceUrl, type MissionSubmission } from "@skillmetry/shared/lib/mission-evidence";
import type { MissionStorageStatus } from "@/hooks/use-mission-submissions";
import { StatusPill } from "@/components/workspace-ui";

export function MissionEvidencePanel({ mission, record, status, onSaved }: {
  mission: Mission;
  record: MissionSubmission | null;
  status: MissionStorageStatus;
  onSaved: (record: MissionSubmission) => void;
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [reflection, setReflection] = useState("");
  const [pending, setPending] = useState<"save-draft" | "submit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setChecked(record?.checkedDeliverables ?? []);
    setEvidenceUrl(record?.evidenceUrl ?? "");
    setReflection(record?.reflection ?? "");
    setNotice(null);
    setError(null);
  }, [record?.updatedAt, record?.missionId, mission.id]);

  async function save(action: "save-draft" | "submit") {
    setPending(action);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/missions/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: mission.id, action, checkedDeliverables: checked,
          evidenceUrl: evidenceUrl.trim(), reflection: reflection.trim()
        })
      });
      const body = await response.json() as { record?: MissionSubmission; error?: string };
      if (!response.ok || !body.record) throw new Error(body.error ?? "Project work could not be saved.");
      onSaved(body.record);
      setNotice(action === "submit" ? "Evidence submitted as your own work. It has not been verified." : "Private draft saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Project work could not be saved.");
    } finally {
      setPending(null);
    }
  }

  return <section className="mission-evidence" aria-label={`Evidence for ${mission.title}`}>
    <div className="mission-evidence-heading">
      <h3>My project work</h3>
      <StatusPill tone={record?.status === "submitted" ? "accent" : "neutral"}>
        {record?.status === "submitted" ? "Submitted · unverified" : record?.status === "draft" ? "Private draft" : "Not started"}
      </StatusPill>
    </div>
    {status === "demo" ? <p>Sign in to save private project evidence. <Link href="/auth/sign-in?next=/missions">Sign in →</Link></p> : null}
    {status === "loading" ? <p role="status">Loading private project work…</p> : null}
    {status === "error" ? <p role="alert">Mission evidence is unavailable. Database migration approval may still be pending. No data was changed.</p> : null}
    {status === "ready" && record?.status === "submitted" ? <div className="mission-evidence-submitted">
      <p>This is your own submission, <strong>not an independent skills review or quiz grade.</strong></p>
      {record.evidenceUrl && isSafeEvidenceUrl(record.evidenceUrl) ?
        <a href={record.evidenceUrl} target="_blank" rel="noopener noreferrer">View submitted project ↗</a> : null}
      {record.reflection ? <p>{record.reflection}</p> : null}
      <small>Submitted {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : "previously"}. Submitted work is read-only.</small>
    </div> : null}
    {status === "ready" && record?.status !== "submitted" ? <div className="mission-evidence-editor">
      <fieldset disabled={Boolean(pending)}>
        <legend>Deliverable checklist</legend>
        {mission.deliverables.map((item, index) => <label key={index} className="mission-evidence-check">
          <input type="checkbox" checked={checked.includes(index)}
            onChange={event => setChecked(current => event.target.checked ? [...current, index].sort((a, b) => a - b) : current.filter(i => i !== index))}/>
          <span>{item}</span>
        </label>)}
      </fieldset>
      <label>Project or GitHub link (HTTPS)
        <input className="input" type="url" inputMode="url" maxLength={2048} placeholder="https://github.com/your-project"
          value={evidenceUrl} disabled={Boolean(pending)} onChange={event => setEvidenceUrl(event.target.value)}/>
      </label>
      <label>Implementation notes (optional)
        <textarea className="input" rows={3} maxLength={1600} value={reflection}
          placeholder="What did you build, test or learn?" disabled={Boolean(pending)}
          onChange={event => setReflection(event.target.value)}/>
      </label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      {notice ? <p className="note" role="status">{notice}</p> : null}
      <div className="mission-evidence-actions">
        <button type="button" className="btn btn-outline" disabled={Boolean(pending)}
          onClick={() => void save("save-draft")}>{pending === "save-draft" ? "Saving…" : "Save private draft"}</button>
        <button type="button" className="btn btn-primary"
          disabled={Boolean(pending) || checked.length !== mission.deliverables.length || !isSafeEvidenceUrl(evidenceUrl.trim())}
          onClick={() => void save("submit")}>{pending === "submit" ? "Submitting…" : "Submit my evidence"}</button>
      </div>
      <small>Self-reported only. Submitting locks this record. No assessment scores are created or modified.</small>
    </div> : null}
  </section>;
}
