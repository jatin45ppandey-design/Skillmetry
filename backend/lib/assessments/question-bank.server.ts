import "server-only";

import type { AssessmentId, LegacyAssessmentId } from "@skillmetry/shared/types/domain";
import { draftFoundationQuestions } from "@skillmetry/backend/lib/assessments/additional-foundations.server";
import { buildAdditionalDiagnosticQuestions } from "@skillmetry/backend/lib/assessments/additional-diagnostics.server";
import { buildDiagnosticQuestions, DIAGNOSTIC_VERSION, type DiagnosticQuestion } from "@skillmetry/backend/lib/assessments/diagnostic-bank.server";
import type { GradedQuestion } from "@skillmetry/backend/lib/assessments/grading.server";

type AssessmentDefinition = {
  id: AssessmentId;
  version: string;
  skillId: string;
  title: string;
  questions: readonly GradedQuestion[];
};

const questionBank = {
  "python-foundations": {
    id: "python-foundations",
    version: "2026.2",
    skillId: "python",
    title: "Python foundations",
    questions: [
      { id: "py-01", prompt: "Which Python value is mutable?", choices: ["tuple", "string", "list", "integer"], correctIndex: 2 },
      { id: "py-02", prompt: "What does len({1, 1, 2}) return?", choices: ["1", "2", "3", "It raises an error"], correctIndex: 1 },
      { id: "py-03", prompt: "What does values.get('missing', 0) return when the key is absent?", choices: ["None", "0", "KeyError", "False"], correctIndex: 1 },
      { id: "py-04", prompt: "What is printed by: print([n * 2 for n in range(3)])?", choices: ["[0, 1, 2]", "[0, 2, 4]", "[2, 4, 6]", "0 2 4"], correctIndex: 1 },
      { id: "py-05", prompt: "Which keyword creates a function?", choices: ["func", "define", "def", "lambda:"], correctIndex: 2 },
      { id: "py-06", prompt: "What does the finally block do in exception handling?", choices: ["Runs only when no exception occurs", "Runs whether or not an exception occurs", "Catches every exception", "Stops the program"], correctIndex: 1 },
      { id: "py-07", prompt: "What is the output of 'skill'.upper()?", choices: ["Skill", "SKILL", "skill", "['S','K','I','L','L']"], correctIndex: 1 },
      { id: "py-08", prompt: "Which operator checks whether two Python values compare equal?", choices: ["=", "==", "is", ":="], correctIndex: 1 },
      { id: "py-09", prompt: "Why use with open('data.txt') as file?", choices: ["It encrypts the file", "It closes the file automatically", "It makes reads asynchronous", "It prevents all I/O errors"], correctIndex: 1 },
      { id: "py-10", prompt: "What is the result of bool([])?", choices: ["True", "False", "None", "It raises TypeError"], correctIndex: 1 }
    ]
  },
  "sql-foundations": {
    id: "sql-foundations",
    version: "2026.2",
    skillId: "sql",
    title: "SQL foundations",
    questions: [
      { id: "sql-01", prompt: "Which clause filters groups after aggregation?", choices: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], correctIndex: 1 },
      { id: "sql-02", prompt: "Which join preserves every row from the left table?", choices: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"], correctIndex: 1 },
      { id: "sql-03", prompt: "Which expression counts every selected row?", choices: ["COUNT(*)", "SUM(*)", "ROWS(*)", "TOTAL(*)"], correctIndex: 0 },
      { id: "sql-04", prompt: "How should a NULL value be tested?", choices: ["= NULL", "IS NULL", "== NULL", "EQUALS NULL"], correctIndex: 1 },
      { id: "sql-05", prompt: "What does GROUP BY do?", choices: ["Sorts rows only", "Combines rows for aggregate calculations", "Removes a table", "Renames columns"], correctIndex: 1 },
      { id: "sql-06", prompt: "Which statement changes existing rows?", choices: ["ALTER", "UPDATE", "CREATE", "SELECT"], correctIndex: 1 },
      { id: "sql-07", prompt: "Which clause limits an UPDATE to rows matching a condition?", choices: ["A WHERE clause", "A GROUP BY clause", "A DISTINCT keyword", "An alias"], correctIndex: 0 },
      { id: "sql-08", prompt: "What is a primary key intended to provide?", choices: ["Duplicate labels", "A unique non-null row identity", "Automatic encryption", "Sorted output"], correctIndex: 1 },
      { id: "sql-09", prompt: "Which query returns each department value only once?", choices: ["SELECT ONLY department FROM employees", "SELECT DISTINCT department FROM employees", "SELECT UNIQUE ROW department FROM employees", "SELECT department GROUP FROM employees"], correctIndex: 1 },
      { id: "sql-10", prompt: "Why use a parameterized query?", choices: ["To prevent SQL injection and separate values from SQL", "To make every query public", "To avoid indexes", "To skip validation"], correctIndex: 0 }
    ]
  },
  "javascript-foundations": {
    id: "javascript-foundations",
    version: "2026.2",
    skillId: "javascript",
    title: "JavaScript foundations",
    questions: [
      { id: "js-01", prompt: "Which declaration is block-scoped and can be reassigned?", choices: ["var", "let", "const", "static"], correctIndex: 1 },
      { id: "js-02", prompt: "What does Array.prototype.map return?", choices: ["The original array only", "A new transformed array", "A boolean", "A single number"], correctIndex: 1 },
      { id: "js-03", prompt: "What is the result of typeof null in JavaScript?", choices: ["null", "undefined", "object", "number"], correctIndex: 2 },
      { id: "js-04", prompt: "Which operator checks equality without type coercion?", choices: ["==", "===", "=", "!==="], correctIndex: 1 },
      { id: "js-05", prompt: "What does await do inside an async function?", choices: ["Blocks the operating system", "Pauses that function until a promise settles", "Converts every value to a string", "Creates a worker thread"], correctIndex: 1 },
      { id: "js-06", prompt: "What is logged by console.log([1, 2, 3].filter(n => n > 1))?", choices: ["[1]", "[2, 3]", "true", "3"], correctIndex: 1 },
      { id: "js-07", prompt: "Which value is falsy?", choices: ["[]", "{}", "'0'", "0"], correctIndex: 3 },
      { id: "js-08", prompt: "What does event.preventDefault() do?", choices: ["Removes every listener", "Stops the browser's default action", "Deletes the event", "Reloads the page"], correctIndex: 1 },
      { id: "js-09", prompt: "Which method converts JSON text into a JavaScript value?", choices: ["JSON.stringify", "JSON.parse", "JSON.read", "Object.json"], correctIndex: 1 },
      { id: "js-10", prompt: "Why prefer const when a binding is not reassigned?", choices: ["It documents the binding's stability", "It makes objects immutable", "It runs asynchronously", "It makes values global"], correctIndex: 0 }
    ]
  },
  "html-foundations": {
    id: "html-foundations",
    version: "2026.2",
    skillId: "html",
    title: "HTML foundations",
    questions: [
      { id: "html-01", prompt: "Which element represents the primary content of a page?", choices: ["<section>", "<main>", "<body-main>", "<content>"], correctIndex: 1 },
      { id: "html-02", prompt: "What connects a label to a form control?", choices: ["Matching label for and control id", "Matching class names", "A title attribute", "Their visual position"], correctIndex: 0 },
      { id: "html-03", prompt: "Which element is correct for site navigation links?", choices: ["<menuitem>", "<nav>", "<aside-nav>", "<links>"], correctIndex: 1 },
      { id: "html-04", prompt: "What should meaningful images normally include?", choices: ["A CSS background", "Useful alt text", "A tabindex", "A data-image attribute"], correctIndex: 1 },
      { id: "html-05", prompt: "Which button markup submits its form explicitly?", choices: ["<button type='submit'>", "<button role='submit'>", "<submit>", "<button action='submit'>"], correctIndex: 0 },
      { id: "html-06", prompt: "Why set the document language with <html lang='en'>?", choices: ["To choose a font", "To help assistive technology and search engines", "To load translations automatically", "To enable JavaScript"], correctIndex: 1 },
      { id: "html-07", prompt: "Which heading structure is most semantic?", choices: ["Choose levels by visual size", "Use a logical hierarchy beginning with the page heading", "Use only h1 elements", "Skip directly from h1 to h6"], correctIndex: 1 },
      { id: "html-08", prompt: "What does the required attribute do on a supported form input?", choices: ["Makes it read-only", "Adds browser constraint validation", "Encrypts its value", "Hides it"], correctIndex: 1 },
      { id: "html-09", prompt: "Which element marks an independent piece of content such as a post?", choices: ["<article>", "<span>", "<b>", "<template>"], correctIndex: 0 },
      { id: "html-10", prompt: "Where should page metadata such as the title normally appear?", choices: ["Inside <main>", "Inside <head>", "After </body>", "Inside every <section>"], correctIndex: 1 }
    ]
  }
} as const satisfies Record<LegacyAssessmentId, AssessmentDefinition>;

/** Version-aware sessions preserve 2026.2 grading even after 2026.3 launches. */
export function getAssessmentDefinition(id: AssessmentId, version?: string): AssessmentDefinition {
  const extraSkill = id.endsWith("-foundations") ? id.slice(0, -"-foundations".length) : "";
  const base = Object.prototype.hasOwnProperty.call(questionBank,id)
    ? questionBank[id as LegacyAssessmentId]
    : (() => {
      const questions = draftFoundationQuestions(extraSkill);
      if (questions.length !== 10) throw new Error("Unknown assessment definition");
      return {id, version:"2026.2", skillId:extraSkill, title:extraSkill+" foundations", questions};
    })();
  if (version === "2026.2" || (!version && process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED !== "true")) return base;
  if (version && version !== DIAGNOSTIC_VERSION) throw new Error("Unknown assessment version");
  return { id: base.id, skillId: base.skillId, title: base.title, version: DIAGNOSTIC_VERSION,
    questions: Object.prototype.hasOwnProperty.call(questionBank,id)
      ? buildDiagnosticQuestions(id as LegacyAssessmentId, base.questions)
      : buildAdditionalDiagnosticQuestions(id, base.questions) };
}
export function isDiagnosticDefinition(definition: AssessmentDefinition): definition is AssessmentDefinition & {questions: readonly DiagnosticQuestion[]} {
  return definition.version === DIAGNOSTIC_VERSION;
}

export function publicQuestions(definition: AssessmentDefinition, order: readonly string[]) {
  const byId = new Map(definition.questions.map(question => [question.id, question]));
  return order.map(id => {
    const question = byId.get(id);
    if (!question) throw new Error("Assessment session references an unknown question.");
    return { id: question.id, prompt: question.prompt, choices: question.choices };
  });
}

export function orderedGradedQuestions(definition: AssessmentDefinition, order: readonly string[]) {
  const byId = new Map(definition.questions.map(question => [question.id, question]));
  return order.map(id => {
    const question = byId.get(id);
    if (!question) throw new Error("Assessment session references an unknown question.");
    return question;
  });
}
