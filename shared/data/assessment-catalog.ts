import type { AssessmentSummary } from "@skillmetry/shared/types/domain";
const questionCount = process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED === "true" ? 15 : 10;

// Browser-safe metadata only. Questions and answer keys live in a server-only module.
const expandedAssessmentsEnabled = process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED === "true"
  && process.env.NEXT_PUBLIC_EXPANDED_ASSESSMENTS_ENABLED === "true";
const additionalCatalog = [
  { id: "math-foundations", skillId: "math", title: "Math & Statistics foundations", description: "Topic-based, server-graded Math & Statistics diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "css-foundations", skillId: "css", title: "CSS foundations", description: "Topic-based, server-graded CSS diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "data-processing-foundations", skillId: "data-processing", title: "Data Processing foundations", description: "Topic-based, server-graded Data Processing diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "ml-foundations-foundations", skillId: "ml-foundations", title: "ML Fundamentals foundations", description: "Topic-based, server-graded ML Fundamentals diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "typescript-foundations", skillId: "typescript", title: "TypeScript foundations", description: "Topic-based, server-graded TypeScript diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "react-foundations", skillId: "react", title: "React foundations", description: "Topic-based, server-graded React diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "node-foundations", skillId: "node", title: "Node.js foundations", description: "Topic-based, server-graded Node.js diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "model-evaluation-foundations", skillId: "model-evaluation", title: "Model Evaluation foundations", description: "Topic-based, server-graded Model Evaluation diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "rest-api-foundations", skillId: "rest-api", title: "REST APIs foundations", description: "Topic-based, server-graded REST APIs diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "docker-foundations", skillId: "docker", title: "Docker foundations", description: "Topic-based, server-graded Docker diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "deployment-foundations", skillId: "deployment", title: "Deployment foundations", description: "Topic-based, server-graded Deployment diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "accessibility-foundations", skillId: "accessibility", title: "Accessibility foundations", description: "Topic-based, server-graded Accessibility diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "testing-foundations", skillId: "testing", title: "Testing foundations", description: "Topic-based, server-graded Testing diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 },
  { id: "authentication-foundations", skillId: "authentication", title: "Authentication foundations", description: "Topic-based, server-graded Authentication diagnostic learning assessment.", questionCount: 15, estimatedMinutes: 18 }
] as const satisfies readonly AssessmentSummary[];
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
  },
  ...(expandedAssessmentsEnabled ? additionalCatalog : [])
] as const satisfies readonly AssessmentSummary[];

export const assessmentById = Object.fromEntries(
  assessmentCatalog.map(assessment => [assessment.id, assessment])
) as Record<AssessmentSummary["id"], AssessmentSummary>;
