import { z } from "zod";
import { missions } from "@skillmetry/shared/data/catalog";

/** User-reported project work. Never a verified skill or assessment score. */
export type MissionSubmission = {
  missionId: string;
  status: "draft" | "submitted";
  checkedDeliverables: number[];
  reflection: string;
  evidenceUrl: string | null;
  updatedAt: string;
  submittedAt: string | null;
};

export function isSafeEvidenceUrl(value: string): boolean {
  if (!value || value.length > 2048) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:"
      && !url.username && !url.password
      && !["localhost", "0.0.0.0", "::1", "[::1]"].includes(host)
      && !/^(?:127|10|192\.168|169\.254)\./.test(host)
      && !/^172\.(?:1[6-9]|2\d|3[01])\./.test(host)
      && !host.endsWith(".localhost") && !host.endsWith(".local");
  } catch {
    return false;
  }
}

export const missionSubmissionInputSchema = z.object({
  missionId: z.string().regex(/^[a-z0-9-]{1,64}$/),
  action: z.enum(["save-draft", "submit"]),
  checkedDeliverables: z.array(z.number().int().min(0).max(20)).max(20),
  reflection: z.string().trim().max(1600),
  evidenceUrl: z.string().trim().max(2048)
}).strict().superRefine((value, ctx) => {
  const mission = missions.find(item => item.id === value.missionId);
  if (!mission) {
    ctx.addIssue({ code: "custom", path: ["missionId"], message: "Unknown curated mission" });
    return;
  }
  if (new Set(value.checkedDeliverables).size !== value.checkedDeliverables.length
      || value.checkedDeliverables.some(index => index >= mission.deliverables.length)) {
    ctx.addIssue({ code: "custom", path: ["checkedDeliverables"], message: "Invalid deliverable selection" });
  }
  if (value.evidenceUrl && !isSafeEvidenceUrl(value.evidenceUrl)) {
    ctx.addIssue({ code: "custom", path: ["evidenceUrl"], message: "Use a public HTTPS project or repository link" });
  }
  if (value.action === "submit") {
    if (!value.evidenceUrl || !isSafeEvidenceUrl(value.evidenceUrl)) {
      ctx.addIssue({ code: "custom", path: ["evidenceUrl"], message: "An HTTPS evidence link is required to submit" });
    }
    if (value.checkedDeliverables.length !== mission.deliverables.length) {
      ctx.addIssue({ code: "custom", path: ["checkedDeliverables"], message: "Check every deliverable before submitting" });
    }
  }
});
