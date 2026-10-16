import { z } from "zod";
import { skills } from "@skillmetry/shared/data/catalog";

const skillIds = skills.map(skill => skill.id);
export const missionAIOutputSchema = z.object({
  title: z.string().trim().min(5).max(100),
  objective: z.string().trim().min(15).max(500),
  steps: z.array(z.string().trim().min(8).max(260)).min(3).max(7),
  acceptanceCriteria: z.array(z.string().trim().min(8).max(230)).min(2).max(6),
  caveats: z.array(z.string().trim().min(8).max(180)).max(4)
}).strict();

export const jobAIOutputSchema = z.object({
  mentions: z.array(z.object({
    skillId: z.string().refine(id => skillIds.includes(id), "Unknown skill"),
    evidenceQuote: z.string().trim().min(2).max(120)
  }).strict()).max(18)
}).strict();

/** Exact evidence quotes are necessary; model-suggested skill matches are not scores. */
export function groundedJobMentions(
  text: string,
  response: z.infer<typeof jobAIOutputSchema>
) {
  const source = text.toLowerCase().replace(/\s+/g, " ");
  const seen = new Set<string>();
  return response.mentions.filter(item => {
    const found = source.includes(item.evidenceQuote.toLowerCase().replace(/\s+/g, " "));
    if (!found || seen.has(item.skillId)) return false;
    seen.add(item.skillId);
    return true;
  }).map(item => ({
    ...item,
    skillLabel: skills.find(skill => skill.id === item.skillId)?.label ?? item.skillId
  }));
}
