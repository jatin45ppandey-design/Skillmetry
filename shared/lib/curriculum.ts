import { z } from "zod";
import type {
  CurriculumCatalog,
  CurriculumValidationIssue,
  CurriculumValidationResult
} from "@skillmetry/shared/types/curriculum";

const canonicalIdSchema = z.string().regex(/^[a-z][a-z0-9-]{1,63}$/);
const relationshipIdSchema = z.string().regex(/^[a-z][a-z0-9-]*:(topic|subtopic|lesson):[a-z][a-z0-9-]*$/);
const versionSchema = z.string().regex(/^\d{4}\.\d+$/);
const nonEmptyText = z.string().trim().min(2).max(500);
const sourceSchema = z.object({
  kind: z.enum(["internal-catalog", "curated-resource", "publisher"]),
  label: z.string().trim().min(2).max(160),
  url: z.string().url().refine(value => value.startsWith("https://"), "Source URLs must use HTTPS").optional()
}).strict();
const commonNodeFields = {
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  order: z.number().int().nonnegative(),
  learningObjectives: z.array(nonEmptyText).min(1),
  version: versionSchema,
  sources: z.array(sourceSchema).min(1)
};

export const curriculumCatalogSchema = z.object({
  version: versionSchema,
  careers: z.array(z.object({
    careerId: canonicalIdSchema,
    skillIds: z.array(canonicalIdSchema).min(1)
  }).strict()).min(1),
  skills: z.array(z.object({
    skillId: canonicalIdSchema,
    prerequisiteSkillIds: z.array(canonicalIdSchema),
    topicIds: z.array(relationshipIdSchema).min(1)
  }).strict()).min(1),
  topics: z.array(z.object({
    id: relationshipIdSchema,
    skillIds: z.array(canonicalIdSchema).min(1),
    title: z.string().trim().min(2).max(120),
    description: nonEmptyText,
    prerequisiteTopicIds: z.array(relationshipIdSchema),
    ...commonNodeFields
  }).strict()).min(1),
  subtopics: z.array(z.object({
    id: relationshipIdSchema,
    topicId: relationshipIdSchema,
    title: z.string().trim().min(2).max(120),
    description: nonEmptyText,
    ...commonNodeFields
  }).strict()).min(1),
  lessons: z.array(z.object({
    id: relationshipIdSchema,
    subtopicId: relationshipIdSchema,
    title: z.string().trim().min(2).max(140),
    summary: nonEmptyText,
    resourceIds: z.array(canonicalIdSchema),
    practiceIds: z.array(z.string().regex(/^assessment:[a-z][a-z0-9-]{2,63}$/)),
    ...commonNodeFields
  }).strict().superRefine((lesson, context) => {
    if (!lesson.resourceIds.length && !lesson.practiceIds.length) {
      context.addIssue({ code: "custom", path: ["resourceIds"], message: "A lesson needs at least one resource or practice relationship" });
    }
  })).min(1),
  practices: z.array(z.object({
    id: z.string().regex(/^assessment:[a-z][a-z0-9-]{2,63}$/),
    assessmentId: canonicalIdSchema,
    skillId: canonicalIdSchema,
    title: z.string().trim().min(2).max(140),
    href: z.string().regex(/^\/assessments(?:\?.*)?$/),
    kind: z.literal("assessment"),
    availability: z.literal("available")
  }).strict())
}).strict();

function addDuplicateIssues<T>(
  entries: readonly T[],
  idFor: (entry: T) => string,
  path: string,
  issues: CurriculumValidationIssue[]
) {
  const seen = new Set<string>();
  for (const [index, entry] of entries.entries()) {
    const id = idFor(entry);
    if (seen.has(id)) issues.push({ code: "duplicate-id", path: `${path}.${index}`, message: `Duplicate ID: ${id}` });
    seen.add(id);
  }
}

function addCycleIssues(
  nodes: readonly { id: string; prerequisites: readonly string[] }[],
  path: string,
  issues: CurriculumValidationIssue[]
) {
  const graph = new Map(nodes.map(node => [node.id, node.prerequisites]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const walk = (id: string, trail: string[]) => {
    if (visiting.has(id)) {
      const cycleStart = trail.indexOf(id);
      const cycle = [...trail.slice(Math.max(0, cycleStart)), id];
      issues.push({ code: "circular-prerequisite", path, message: `Circular prerequisite: ${cycle.join(" -> ")}` });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const prerequisite of graph.get(id) ?? []) walk(prerequisite, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const node of nodes) walk(node.id, []);
}

export function validateCurriculumCatalog(
  input: unknown,
  knownResourceIds: ReadonlySet<string>
): CurriculumValidationResult {
  const parsed = curriculumCatalogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map(issue => ({
        code: "schema" as const,
        path: issue.path.join("."),
        message: issue.message
      }))
    };
  }

  const catalog = parsed.data as CurriculumCatalog;
  const issues: CurriculumValidationIssue[] = [];
  addDuplicateIssues(catalog.careers, entry => entry.careerId, "careers", issues);
  addDuplicateIssues(catalog.skills, entry => entry.skillId, "skills", issues);
  addDuplicateIssues(catalog.topics, entry => entry.id, "topics", issues);
  addDuplicateIssues(catalog.subtopics, entry => entry.id, "subtopics", issues);
  addDuplicateIssues(catalog.lessons, entry => entry.id, "lessons", issues);
  addDuplicateIssues(catalog.practices, entry => entry.id, "practices", issues);

  const skillIds = new Set(catalog.skills.map(entry => entry.skillId));
  const topicIds = new Set(catalog.topics.map(entry => entry.id));
  const subtopicIds = new Set(catalog.subtopics.map(entry => entry.id));
  const practiceIds = new Set(catalog.practices.map(entry => entry.id));
  const addInvalid = (path: string, id: string, kind: string) => issues.push({
    code: "invalid-reference",
    path,
    message: `Unknown ${kind} reference: ${id}`
  });

  for (const [index, career] of catalog.careers.entries()) {
    for (const skillId of career.skillIds) if (!skillIds.has(skillId)) addInvalid(`careers.${index}.skillIds`, skillId, "skill");
  }
  for (const [index, skill] of catalog.skills.entries()) {
    for (const prerequisite of skill.prerequisiteSkillIds) if (!skillIds.has(prerequisite)) addInvalid(`skills.${index}.prerequisiteSkillIds`, prerequisite, "skill");
    for (const topicId of skill.topicIds) if (!topicIds.has(topicId)) addInvalid(`skills.${index}.topicIds`, topicId, "topic");
  }
  for (const [index, topic] of catalog.topics.entries()) {
    for (const skillId of topic.skillIds) if (!skillIds.has(skillId)) addInvalid(`topics.${index}.skillIds`, skillId, "skill");
    for (const prerequisite of topic.prerequisiteTopicIds) if (!topicIds.has(prerequisite)) addInvalid(`topics.${index}.prerequisiteTopicIds`, prerequisite, "topic");
    if (!catalog.subtopics.some(subtopic => subtopic.topicId === topic.id)) issues.push({ code: "missing-relationship", path: `topics.${index}`, message: `Topic ${topic.id} has no subtopic` });
  }
  for (const [index, subtopic] of catalog.subtopics.entries()) {
    if (!topicIds.has(subtopic.topicId)) addInvalid(`subtopics.${index}.topicId`, subtopic.topicId, "topic");
    if (!catalog.lessons.some(lesson => lesson.subtopicId === subtopic.id)) issues.push({ code: "missing-relationship", path: `subtopics.${index}`, message: `Subtopic ${subtopic.id} has no lesson` });
  }
  for (const [index, lesson] of catalog.lessons.entries()) {
    if (!subtopicIds.has(lesson.subtopicId)) addInvalid(`lessons.${index}.subtopicId`, lesson.subtopicId, "subtopic");
    for (const resourceId of lesson.resourceIds) if (!knownResourceIds.has(resourceId)) addInvalid(`lessons.${index}.resourceIds`, resourceId, "resource");
    for (const practiceId of lesson.practiceIds) if (!practiceIds.has(practiceId)) addInvalid(`lessons.${index}.practiceIds`, practiceId, "practice");
  }
  for (const [index, practice] of catalog.practices.entries()) {
    if (!skillIds.has(practice.skillId)) addInvalid(`practices.${index}.skillId`, practice.skillId, "skill");
  }

  addCycleIssues(catalog.skills.map(entry => ({ id: entry.skillId, prerequisites: entry.prerequisiteSkillIds })), "skills", issues);
  addCycleIssues(catalog.topics.map(entry => ({ id: entry.id, prerequisites: entry.prerequisiteTopicIds })), "topics", issues);
  return issues.length ? { success: false, issues } : { success: true, data: catalog, issues: [] };
}

export function assertValidCurriculumCatalog(input: unknown, knownResourceIds: ReadonlySet<string>): CurriculumCatalog {
  const result = validateCurriculumCatalog(input, knownResourceIds);
  if (!result.success) throw new Error(result.issues.map(issue => `${issue.path}: ${issue.message}`).join("\n"));
  return result.data;
}
