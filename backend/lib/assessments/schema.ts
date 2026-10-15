import { z } from "zod";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";

const assessmentIds = assessmentCatalog.map(item => item.id) as [string, ...string[]];

export const assessmentIdSchema = z.enum(assessmentIds);

export const startAssessmentSchema = z.object({
  assessmentId: assessmentIdSchema
}).strict();

export const submitAssessmentSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.record(z.string().min(1).max(64), z.number().int().min(0).max(3))
    .refine(value => Object.keys(value).length > 0 && Object.keys(value).length <= 20, "Invalid answer count")
}).strict();
