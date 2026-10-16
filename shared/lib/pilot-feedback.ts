import { z } from "zod";

/** Voluntary product feedback is never an assessment signal. */
export const pilotFeedbackSchema = z.object({
  area: z.enum(["onboarding","assessment","roadmap","projects","accessibility","other"]),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1200)
}).strict();
export type PilotFeedbackInput = z.infer<typeof pilotFeedbackSchema>;
