import {z} from "zod";
export const adminGuidePayloadSchema=z.object({
 documentation:z.object({title:z.string().trim().min(5).max(150),
   url:z.string().url().max(700).refine(v=>v.startsWith("https://"),"HTTPS required")}).strict(),
 lecture:z.object({title:z.string().trim().min(5).max(150),
   url:z.string().url().max(700).refine(v=>v.startsWith("https://"),"HTTPS required"),
   format:z.enum(["video","course-with-video","interactive-course","reference"])}).strict(),
 notes:z.array(z.string().trim().min(10).max(600)).min(3).max(12),
 challenge:z.string().trim().min(15).max(700)
}).strict();
export const saveAdminGuideSchema=z.object({
 skillId:z.string().regex(/^[a-z][a-z0-9-]{1,48}$/),
 expectedRevision:z.number().int().min(0),
 publish:z.boolean().default(false),
 draft:adminGuidePayloadSchema
}).strict();
export const adminGuideRowSchema=z.object({
 skill_id:z.string(),
 draft:adminGuidePayloadSchema.nullable(),
 published:adminGuidePayloadSchema.nullable(),
 revision:z.number().int().nonnegative(),
 published_revision:z.number().int().nonnegative(),
 updated_at:z.string().nullable().optional(),
 published_at:z.string().nullable().optional()
});
export type AdminGuidePayload=z.infer<typeof adminGuidePayloadSchema>;
export type AdminGuideRow=z.infer<typeof adminGuideRowSchema>;
