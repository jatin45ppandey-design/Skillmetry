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
  ],
  "math-foundations": [{"id":"topic-1","label":"Statistics"},{"id":"topic-2","label":"Probability"},{"id":"topic-3","label":"Algebra"},{"id":"topic-4","label":"Linear algebra"},{"id":"topic-5","label":"Inference"}],
  "css-foundations": [{"id":"topic-1","label":"Selectors"},{"id":"topic-2","label":"Box model"},{"id":"topic-3","label":"Layout"},{"id":"topic-4","label":"Responsive"},{"id":"topic-5","label":"Cascade and motion"}],
  "data-processing-foundations": [{"id":"topic-1","label":"Data quality"},{"id":"topic-2","label":"Transforms"},{"id":"topic-3","label":"Schema"},{"id":"topic-4","label":"Pipelines"},{"id":"topic-5","label":"Evaluation"}],
  "ml-foundations-foundations": [{"id":"topic-1","label":"Setup"},{"id":"topic-2","label":"Training"},{"id":"topic-3","label":"Overfitting"},{"id":"topic-4","label":"Models"},{"id":"topic-5","label":"Integrity"}],
  "typescript-foundations": [{"id":"topic-1","label":"Types"},{"id":"topic-2","label":"Functions"},{"id":"topic-3","label":"Objects"},{"id":"topic-4","label":"Narrowing"},{"id":"topic-5","label":"Generics"}],
  "react-foundations": [{"id":"topic-1","label":"Components"},{"id":"topic-2","label":"State"},{"id":"topic-3","label":"Effects"},{"id":"topic-4","label":"Lists"},{"id":"topic-5","label":"Accessibility"}],
  "node-foundations": [{"id":"topic-1","label":"Runtime"},{"id":"topic-2","label":"Modules"},{"id":"topic-3","label":"Async"},{"id":"topic-4","label":"HTTP"},{"id":"topic-5","label":"Security"}],
  "model-evaluation-foundations": [{"id":"topic-1","label":"Splits"},{"id":"topic-2","label":"Classification"},{"id":"topic-3","label":"Regression"},{"id":"topic-4","label":"Generalization"},{"id":"topic-5","label":"Integrity"}],
  "rest-api-foundations": [{"id":"topic-1","label":"HTTP"},{"id":"topic-2","label":"Resources"},{"id":"topic-3","label":"Payloads"},{"id":"topic-4","label":"Caching"},{"id":"topic-5","label":"Auth"}],
  "docker-foundations": [{"id":"topic-1","label":"Images"},{"id":"topic-2","label":"Containers"},{"id":"topic-3","label":"Networks"},{"id":"topic-4","label":"Volumes"},{"id":"topic-5","label":"Delivery"}],
  "deployment-foundations": [{"id":"topic-1","label":"Environments"},{"id":"topic-2","label":"Release"},{"id":"topic-3","label":"Monitoring"},{"id":"topic-4","label":"Database"},{"id":"topic-5","label":"Reliability"}],
  "accessibility-foundations": [{"id":"topic-1","label":"Semantics"},{"id":"topic-2","label":"Keyboard"},{"id":"topic-3","label":"Forms"},{"id":"topic-4","label":"Contrast"},{"id":"topic-5","label":"Motion and testing"}],
  "testing-foundations": [{"id":"topic-1","label":"Unit"},{"id":"topic-2","label":"Integration"},{"id":"topic-3","label":"Stability"},{"id":"topic-4","label":"Coverage"},{"id":"topic-5","label":"Security"}],
  "authentication-foundations": [{"id":"topic-1","label":"Identity"},{"id":"topic-2","label":"Sessions"},{"id":"topic-3","label":"Credentials"},{"id":"topic-4","label":"OAuth"},{"id":"topic-5","label":"Access control"}]
};
