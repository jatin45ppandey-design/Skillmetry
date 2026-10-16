import "server-only";

import type { AssessmentId } from "@skillmetry/shared/types/domain";
import { buildDiagnosticQuestions, DIAGNOSTIC_VERSION, type DiagnosticQuestion } from "@skillmetry/backend/lib/assessments/diagnostic-bank.server";
import { isDiagnosticAssessmentId } from "@skillmetry/shared/data/diagnostic-taxonomy";
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
  },
  "css-foundations": {
    id: "css-foundations", version: "2026.2", skillId: "css", title: "CSS foundations",
    questions: [
      { id: "css-01", prompt: "Which CSS layout model supports rows and columns?", choices: ["Grid","Block","Inline","Float"], correctIndex: 0 },
      { id: "css-02", prompt: "What includes padding within the declared width?", choices: ["content-box","border-box","inline-block","overflow"], correctIndex: 1 },
      { id: "css-03", prompt: "What does rem reference?", choices: ["Viewport","Parent width","Root font size","Element height"], correctIndex: 2 },
      { id: "css-04", prompt: "Which selector is most specific without important?", choices: ["p",".item","article p","#item"], correctIndex: 3 },
      { id: "css-05", prompt: "What does gap set in flex and grid?", choices: ["Space between items","Font spacing","Page margin","Border thickness"], correctIndex: 0 },
      { id: "css-06", prompt: "What does a media query do?", choices: ["Encrypt styles","Apply styles under matching conditions","Create DOM nodes","Load fonts only"], correctIndex: 1 },
      { id: "css-07", prompt: "Which pseudo-class commonly highlights keyboard focus?", choices: [":visited",":empty",":focus-visible",":last-child"], correctIndex: 2 },
      { id: "css-08", prompt: "Which property sets text color?", choices: ["background","border","opacity","color"], correctIndex: 3 },
      { id: "css-09", prompt: "Which image rule helps prevent horizontal overflow?", choices: ["max-width: 100%","min-width: 100vw","width: 2000px","position: fixed"], correctIndex: 0 },
      { id: "css-10", prompt: "What does display: none generally do?", choices: ["Hide text only","Remove the element from layout and the accessibility tree","Set opacity to zero","Fix position"], correctIndex: 1 }
    ]
  },
  "typescript-foundations": {
    id: "typescript-foundations", version: "2026.2", skillId: "typescript", title: "TypeScript foundations",
    questions: [
      { id: "ts-01", prompt: "Which represents a string or a number type?", choices: ["string & number","string or number union","string,number","any[]"], correctIndex: 1 },
      { id: "ts-02", prompt: "Why use unknown instead of any for untrusted data?", choices: ["It casts to text","It validates at runtime","It requires narrowing before use","It prevents assignment"], correctIndex: 2 },
      { id: "ts-03", prompt: "What does a TypeScript interface describe?", choices: ["An object shape","A CSS selector","A database trigger","A bundler"], correctIndex: 0 },
      { id: "ts-04", prompt: "What does ? mean after an object property name?", choices: ["Encrypted","Always null","Readonly","Optional"], correctIndex: 3 },
      { id: "ts-05", prompt: "What does readonly prevent in TypeScript?", choices: ["Every runtime mutation","Assignment through the checked type","Network requests","Rendering"], correctIndex: 1 },
      { id: "ts-06", prompt: "Which narrows a union to string?", choices: ["typeof value === 'string'","value === String","Boolean(value)","value instanceof Number"], correctIndex: 0 },
      { id: "ts-07", prompt: "What does as const do with a literal?", choices: ["Runs on server","Creates a setter","Narrows literal values and infers readonly","Checks at runtime"], correctIndex: 2 },
      { id: "ts-08", prompt: "Why use generic type parameters?", choices: ["Disable checking","Load a module","Set a default CSS value","Model reusable type relationships"], correctIndex: 3 },
      { id: "ts-09", prompt: "Can null be assigned to string with strictNullChecks?", choices: ["Always","Only when the type includes null","Only in arrays","Only in async functions"], correctIndex: 1 },
      { id: "ts-10", prompt: "What is Promise<number>?", choices: ["A promise resolving to a number","An array of numbers","A synchronous number","A runtime validator"], correctIndex: 0 }
    ]
  },
  "react-foundations": {
    id: "react-foundations", version: "2026.2", skillId: "react", title: "React foundations",
    questions: [
      { id: "react-01", prompt: "What usually triggers a local-state React re-render?", choices: ["Mutating a plain variable","Calling a state setter","Direct DOM editing","Changing CSS in DevTools"], correctIndex: 1 },
      { id: "react-02", prompt: "Why must list items have stable keys?", choices: ["For encryption","For fonts","To preserve identity during updates","To force remounts"], correctIndex: 2 },
      { id: "react-03", prompt: "What are props for?", choices: ["Passing data into components","Loading CSS files","Running SQL","Replacing the DOM"], correctIndex: 0 },
      { id: "react-04", prompt: "What is useEffect commonly used for?", choices: ["Static HTML checks","CSS styling","Compiling TypeScript","Synchronizing external side effects"], correctIndex: 3 },
      { id: "react-05", prompt: "What can an effect return for cleanup?", choices: ["An array of props","A cleanup function","A new component","A key"], correctIndex: 1 },
      { id: "react-06", prompt: "How is a controlled text input implemented?", choices: ["value with onChange","ref only","placeholder only","CSS custom property"], correctIndex: 0 },
      { id: "react-07", prompt: "How do you pass a click callback without invoking it during render?", choices: ["onClick={save()}","onClick='save'","onClick={save}","onClick={true}"], correctIndex: 2 },
      { id: "react-08", prompt: "How should a state array usually be updated?", choices: ["Mutate existing array","Assign to props","Edit DOM manually","Create a new array"], correctIndex: 3 },
      { id: "react-09", prompt: "Where should React Hooks be called?", choices: ["Inside conditionals","At top level of components or custom Hooks","After return","Inside loops"], correctIndex: 1 },
      { id: "react-10", prompt: "What should you do when a value can be derived from props?", choices: ["Calculate it during render","Always duplicate it in state","Read document.body","Always copy it with useEffect"], correctIndex: 0 }
    ]
  },
  "node-foundations": {
    id: "node-foundations", version: "2026.2", skillId: "node", title: "Node.js foundations",
    questions: [
      { id: "node-01", prompt: "Where can Node.js execute JavaScript?", choices: ["Only inside browsers","Outside the browser","Only in SQL","Only in CSS"], correctIndex: 1 },
      { id: "node-02", prompt: "Where are npm scripts defined?", choices: ["tsconfig.json","index.html","package.json","manifest.webmanifest"], correctIndex: 2 },
      { id: "node-03", prompt: "Where does Node expose process environment variables?", choices: ["process.env","window.env","document.env","style.env"], correctIndex: 0 },
      { id: "node-04", prompt: "Which built-in module creates an HTTP server?", choices: ["node:path","node:os","node:crypto","node:http"], correctIndex: 3 },
      { id: "node-05", prompt: "What does an async function return?", choices: ["Always a string","A Promise","Always a number","A worker thread"], correctIndex: 1 },
      { id: "node-06", prompt: "Which module offers promise-based file-system functions?", choices: ["node:fs/promises","node:buffer","node:os","node:events"], correctIndex: 0 },
      { id: "node-07", prompt: "Where should server API credentials be stored?", choices: ["Client source","Public build flags","Server-only secret configuration","Browser cache"], correctIndex: 2 },
      { id: "node-08", prompt: "How can you catch a rejected awaited Promise?", choices: ["for loop","JSON stringify","Object freeze","try/catch"], correctIndex: 3 },
      { id: "node-09", prompt: "What does the event loop coordinate?", choices: ["CSS rules","Asynchronous callbacks and work","All JS in parallel","TypeScript type checking"], correctIndex: 1 },
      { id: "node-10", prompt: "Why must a Node HTTP API validate inputs?", choices: ["Clients may bypass browser validation","Browsers guarantee valid requests","CSS depends on it","It enables all caching"], correctIndex: 0 }
    ]
  },
  "rest-api-foundations": {
    id: "rest-api-foundations", version: "2026.2", skillId: "rest-api", title: "REST API foundations",
    questions: [
      { id: "api-01", prompt: "Which HTTP method retrieves a resource?", choices: ["POST","GET","PATCH","DELETE"], correctIndex: 1 },
      { id: "api-02", prompt: "Which method is conventionally used to create a resource?", choices: ["POST","HEAD","OPTIONS","TRACE"], correctIndex: 0 },
      { id: "api-03", prompt: "Which HTTP method updates part of a resource?", choices: ["GET","HEAD","PATCH","CONNECT"], correctIndex: 2 },
      { id: "api-04", prompt: "What does HTTP 401 indicate?", choices: ["Success","A created resource","A server crash","Missing or invalid authentication"], correctIndex: 3 },
      { id: "api-05", prompt: "What does HTTP 403 mean?", choices: ["Access is refused","A resource was created","Cache miss","Request timeout"], correctIndex: 0 },
      { id: "api-06", prompt: "Which status is typically returned after resource creation?", choices: ["204","201","304","429"], correctIndex: 1 },
      { id: "api-07", prompt: "What does Content-Type: application/json describe?", choices: ["Authentication method","User's role","Body media type","Rate limit"], correctIndex: 2 },
      { id: "api-08", prompt: "Which HTTP status commonly signals rate limiting?", choices: ["200","301","404","429"], correctIndex: 3 },
      { id: "api-09", prompt: "Why validate all server API requests?", choices: ["Client validation can be bypassed","All clients are trusted","It removes network errors","It improves fonts"], correctIndex: 0 },
      { id: "api-10", prompt: "Why use cursor-based pagination?", choices: ["Encrypt tables","Retrieve bounded pages of a large collection","Set passwords","Choose status codes"], correctIndex: 1 }
    ]
  }
} as const satisfies Record<AssessmentId, AssessmentDefinition>;

/** Version-aware sessions preserve 2026.2 grading even after 2026.3 launches. */
export function getAssessmentDefinition(id: AssessmentId, version?: string): AssessmentDefinition {
  const base = questionBank[id];
  if (!isDiagnosticAssessmentId(id)) {
    if (version && version !== "2026.2") throw new Error("Unknown assessment version");
    return base;
  }
  if (version === "2026.2" || (!version && process.env.NEXT_PUBLIC_DIAGNOSTIC_ASSESSMENTS_ENABLED !== "true")) return base;
  if (version && version !== DIAGNOSTIC_VERSION) throw new Error("Unknown assessment version");
  return { id: base.id, skillId: base.skillId, title: base.title, version: DIAGNOSTIC_VERSION,
    questions: buildDiagnosticQuestions(id, base.questions) };
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
