import type { AssessmentSummary } from "@skillmetry/shared/types/domain";
const questionCount = process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED === "true" ? 15 : 10;

// Browser-safe metadata only. Questions and answer keys live in a server-only module.
const originalAssessmentCatalog = [
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


const expandedAssessmentCatalog = [
  { id: "css-foundations", skillId: "css", title: "CSS foundations", description: "Selectors, responsive layout and visual accessibility.", questionCount: 10, estimatedMinutes: 12 },
  { id: "typescript-foundations", skillId: "typescript", title: "TypeScript foundations", description: "Type narrowing, object types and generics.", questionCount: 10, estimatedMinutes: 12 },
  { id: "react-foundations", skillId: "react", title: "React foundations", description: "Components, state, effects and UI interaction.", questionCount: 10, estimatedMinutes: 12 },
  { id: "node-foundations", skillId: "node", title: "Node.js foundations", description: "Asynchronous services, modules and configuration.", questionCount: 10, estimatedMinutes: 12 },
  { id: "rest-api-foundations", skillId: "rest-api", title: "REST API foundations", description: "HTTP methods, responses and endpoint security.", questionCount: 10, estimatedMinutes: 12 }
] as const satisfies readonly AssessmentSummary[];

/** Off by default: the hosted RPCs do not recognize new IDs until approved migration. */
export const assessmentCatalog: readonly AssessmentSummary[] =
  process.env.NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED === "true"
    ? [...originalAssessmentCatalog, ...expandedAssessmentCatalog]
    : originalAssessmentCatalog;

export const assessmentById = Object.fromEntries(
  assessmentCatalog.map(assessment => [assessment.id, assessment])
) as Record<AssessmentSummary["id"], AssessmentSummary>;
