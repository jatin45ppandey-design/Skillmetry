import "server-only";
import { isDiagnosticAssessmentId, diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId, DiagnosticAssessmentId } from "@skillmetry/shared/types/domain";
import { practiceExtensions } from "@skillmetry/backend/lib/assessments/practice-extensions.server";
type PracticeQuestion = {id:string;assessmentId:AssessmentId;topicId:string;prompt:string;choices:readonly string[];correctIndex:number;explanation:string};
const cases:Record<DiagnosticAssessmentId,readonly string[][]> = {
  "python-foundations": [
    [
      "Trace: what is type(5).__name__?|int|str|float|bool|0",
      "What does bool(0) evaluate to?|True|False|None|Error|1"
    ],
    [
      "After x=[1,2];x.append(3), x equals?|[1,2]|[1,2,3]|[3]|None|1",
      "Access the last element of a Python list via?|items[0]|items[-1]|items.last|items[end]|1"
    ],
    [
      "What is sum(range(4))?|4|6|10|3|1",
      "Calling a function without explicit return yields?|False|None|0|empty string|1"
    ],
    [
      "Which clause handles KeyError?|except KeyError:|catch KeyError|on error|finally KeyError|0",
      "What does with open(...) provide?|guaranteed file exists|resource cleanup|automatic encryption|async I/O|1"
    ],
    [
      "What is 'Py'.lower()?|'py'|'PY'|'Py'|'pY'|0",
      "What is 3 in [1,2,3]?|True|False|3|None|0"
    ]
  ],
  "sql-foundations": [
    [
      "Get only three records?|LIMIT 3|TOP ALL|GROUP 3|ONLY ROWS 3|0",
      "Filter records by price above 100?|WHERE price > 100|HAVING price > 100 only|ORDER BY price > 100|LIMIT price > 100|0"
    ],
    [
      "Join on shared id?|ON a.id = b.a_id|ORDER BY id|SELECT id|LIMIT id|0",
      "Why use a junction table?|store many-to-many relationships|sort faster|encrypt rows|remove keys|0"
    ],
    [
      "Count rows per department?|GROUP BY department|ORDER BY department only|DISTINCT count(*)|LIMIT group|0",
      "Where can COUNT(*) be filtered after grouping?|HAVING|WHERE only|SET|UPDATE|0"
    ],
    [
      "Change salary for one id?|UPDATE ... WHERE id = ...|ALTER TABLE salary|CREATE INDEX|SELECT salary|0",
      "A primary key permits duplicate IDs?|Yes|No|Only on weekends|Always NULL|1"
    ],
    [
      "Which is safe for missing value?|IS NULL|= NULL|<> NULL|LIKE NULL|0",
      "Bound parameters separate SQL from?|values|indexes|transactions|columns always|0"
    ]
  ],
  "javascript-foundations": [
    [
      "Block-scoped reassignable declaration?|let|var|const|global|0",
      "What is typeof (()=>{})?|function|object|arrow|undefined|0"
    ],
    [
      "What does [2,4].map(n=>n/2) produce?|[1,2]|[2,4]|3|true|0",
      "Which array method mutates by adding an item to the end?|push|map|filter|slice|0"
    ],
    [
      "What does typeof undefined return?|undefined|string|object|null|1",
      "What is [] === []?|true|false|undefined|error|1"
    ],
    [
      "What does Promise.resolve(3) represent?|fulfilled Promise|Timer|Event|Function|0",
      "Where does catch handle a rejected async awaited promise?|try/catch|switch/case|for loop|setTimeout|0"
    ],
    [
      "Which DOM API creates an element?|document.createElement|JSON.parse|Array.from|Promise.resolve|0",
      "Where should user-generated text be inserted safely?|textContent|innerHTML|eval|document.write|0"
    ]
  ],
  "html-foundations": [
    [
      "Semantic navigation container?|<nav>|<div role=style>|<span>|<em>|0",
      "Main page landmark?|<main>|<bottom>|<b>|<small>|0"
    ],
    [
      "Which attribute connects a label to an input?|for matching id|class matching name|style|href|0",
      "Best button for reset form?|<button type='reset'>|<button reset>|<reset>|<input type='text'>|0"
    ],
    [
      "Keyboard access is important for?|all interactive controls|mouse-only users|only images|only tables|0",
      "What helps screen readers interpret meaningful images?|alt text|style width|background-color|class|0"
    ],
    [
      "Which tag contains document metadata?|<head>|<body>|<main>|<footer>|0",
      "What is UTF-8 charset metadata for?|text encoding|media duration|account identity|button styling|0"
    ],
    [
      "A user-triggered action should use?|button|span with click|heading|paragraph|0",
      "Table header cells use?|<th>|<td>|<header>|<b>|0"
    ]
  ]
};
/** Independently authored practice exercises. Never reuse scored diagnostic questions. */
export function getPracticeQuestions(assessmentId:AssessmentId,topicId:string):PracticeQuestion[] {
  if (!isDiagnosticAssessmentId(assessmentId)) return [];
  const index=diagnosticTopics[assessmentId].findIndex(t=>t.id===topicId);
  if(index<0)return [];
  return [...cases[assessmentId][index], ...practiceExtensions[assessmentId][index]].map((line,n)=>{
    const parts=line.split("|");
    if(parts.length!==6&&parts.length!==7)throw new Error("Invalid practice exercise");
    const correctIndex=Number(parts[5]);
    if(!Number.isInteger(correctIndex)||correctIndex<0||correctIndex>3)throw new Error("Invalid practice key");
    const label=diagnosticTopics[assessmentId][index].label;
    return {id:assessmentId+"-"+topicId+"-p"+(n+1),assessmentId,topicId,prompt:parts[0],choices:parts.slice(1,5),correctIndex,
      explanation:parts[6] ?? ("Correct answer: "+parts[1+correctIndex]+". This checks "+label.toLowerCase()+".")};
  });
}
