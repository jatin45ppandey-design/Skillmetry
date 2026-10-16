import type { AssessmentSummary } from "@skillmetry/shared/types/domain";
const questionCount = process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED === "true" ? 15 : 10;

// Browser-safe metadata only. Questions and answer keys live in a server-only module.
export const assessmentCatalog = [
  {
    id: "python-foundations",
    skillId: "python",
    title: "Python foundations",
    description: "Core syntax, data structures, functions, exceptions, and program behavior.",
    questionCount,
    estimatedMinutes: questionCount === 15 ? 18 : 12
  },
  {
    id: "sql-foundations",
    skillId: "sql",
    title: "SQL foundations",
    description: "Filtering, joins, grouping, null semantics, and safe data modification.",
    questionCount,
    estimatedMinutes: questionCount === 15 ? 18 : 12
  },
  {
    id: "javascript-foundations",
    skillId: "javascript",
    title: "JavaScript foundations",
    description: "Language behavior, scope, arrays, promises, and browser-safe patterns.",
    questionCount,
    estimatedMinutes: questionCount === 15 ? 18 : 12
  },
  {
    id: "html-foundations",
    skillId: "html",
    title: "HTML foundations",
    description: "Semantic structure, forms, accessibility, metadata, and resilient markup.",
    questionCount,
    estimatedMinutes: questionCount === 15 ? 18 : 10
  }
] as const satisfies readonly AssessmentSummary[];

export const assessmentById = Object.fromEntries(
  assessmentCatalog.map(assessment => [assessment.id, assessment])
) as Record<AssessmentSummary["id"], AssessmentSummary>;
