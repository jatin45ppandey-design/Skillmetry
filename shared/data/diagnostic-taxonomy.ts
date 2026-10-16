import type { AssessmentId } from "@skillmetry/shared/types/domain";
export type DiagnosticDifficulty = "beginner" | "intermediate" | "advanced";
export const DIAGNOSTIC_VERSION = "2026.3";
export const DIAGNOSTIC_QUESTIONS_PER_ATTEMPT = 15;
export const diagnosticTopics: Record<AssessmentId, readonly {id:string;label:string}[]> = {
  "python-foundations": [
    {
      "id": "types",
      "label": "Types and truthiness"
    },
    {
      "id": "collections",
      "label": "Collections"
    },
    {
      "id": "functions",
      "label": "Functions and control flow"
    },
    {
      "id": "exceptions",
      "label": "Exceptions and I/O"
    },
    {
      "id": "operators",
      "label": "Operators and strings"
    }
  ],
  "sql-foundations": [
    {
      "id": "queries",
      "label": "Filtering and selection"
    },
    {
      "id": "joins",
      "label": "Joins and relationships"
    },
    {
      "id": "grouping",
      "label": "Grouping and aggregation"
    },
    {
      "id": "changes",
      "label": "Modifications and constraints"
    },
    {
      "id": "nulls",
      "label": "NULL and query security"
    }
  ],
  "javascript-foundations": [
    {
      "id": "scope",
      "label": "Declarations and scope"
    },
    {
      "id": "arrays",
      "label": "Arrays and transformations"
    },
    {
      "id": "types",
      "label": "Types and equality"
    },
    {
      "id": "async",
      "label": "Promises and async"
    },
    {
      "id": "browser",
      "label": "Browser APIs and JSON"
    }
  ],
  "html-foundations": [
    {
      "id": "semantics",
      "label": "Semantic landmarks"
    },
    {
      "id": "forms",
      "label": "Forms and controls"
    },
    {
      "id": "a11y",
      "label": "Accessible interface"
    },
    {
      "id": "document",
      "label": "Document structure"
    },
    {
      "id": "content",
      "label": "Content and navigation"
    }
  ]
};
