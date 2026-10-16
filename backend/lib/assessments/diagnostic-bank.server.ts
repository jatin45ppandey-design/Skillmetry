import "server-only";
import { isDiagnosticAssessmentId, diagnosticTopics,DIAGNOSTIC_VERSION,type DiagnosticDifficulty } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId, DiagnosticAssessmentId } from "@skillmetry/shared/types/domain";
import type { GradedQuestion } from "@skillmetry/backend/lib/assessments/grading.server";
export type DiagnosticQuestion = GradedQuestion & {topicId:string;difficulty:DiagnosticDifficulty;explanation:string};
const authored: Record<DiagnosticAssessmentId,{map:number[];qs:string[][]}> = {
  "python-foundations": {
    "map": [
      0,
      1,
      1,
      2,
      2,
      3,
      4,
      4,
      3,
      0
    ],
    "qs": [
      [
        "Which literal is Boolean true?|True|'True'|1.0|None|0",
        "What is int('12')?|'12'|12|12.0|ValueError|1",
        "What is bool('0')?|False|True|0|Error|1",
        "What is 7 // 2?|3.5|3|4|1|1"
      ],
      [
        "First item of items?|items[1]|items[0]|items.first|items[-1]|1",
        "What is {1,2,2}?|list|set with 2 values|dict|tuple|1",
        "What is [n for n in range(5) if n%2==0]?|[0,2,4]|[2,4]|[1,3]|[0,1,2,3,4]|0",
        "What is sorted({'b':2,'a':1})?|['a','b']|[1,2]|['b','a']|error|0"
      ],
      [
        "Purpose of return?|print|end function with result|import|loop|1",
        "What is list(range(1,6,2))?|[1,2,3,4,5]|[1,3,5]|[2,4,6]|[1,3]|1",
        "When is default argument evaluated?|every call|function definition|after return|module exit|1",
        "What does a closure retain?|globals only|outer lexical variables|copied locals|attributes only|1"
      ],
      [
        "Exception handler keyword?|catch|except|finally|handle|1",
        "Which try clause runs only if no error?|except|finally|else|raise|2",
        "Opening existing file in 'w' mode does what?|appends|truncates|reads|always fails|1",
        "Why use raise ... from err?|hides errors|chains exceptions|retries|ignores traceback|1"
      ],
      [
        "Concatenate strings with?|*|+|&|.|1",
        "What is 'ab'*2?|'abab'|'ab2'|'aabb'|error|0",
        "What is 2**3**2?|64|512|256|36|1",
        "Object identity operator?|==|in|is|!=|2"
      ]
    ]
  },
  "sql-foundations": {
    "map": [
      2,
      1,
      2,
      4,
      2,
      3,
      3,
      3,
      0,
      4
    ],
    "qs": [
      [
        "Sort rows with?|WHERE|ORDER BY|HAVING|SET|1",
        "Inclusive ages 18..25 filter?|BETWEEN 18 AND 25|LIKE 18-25|IS 18..25|RANGE(18,25)|0",
        "LIMIT without ORDER BY guarantees?|newest rows|smallest rows|at most N arbitrary rows|exactly N rows|2",
        "DISTINCT on two columns?|per column|whole projected row|first column|only nulls|1"
      ],
      [
        "A foreign key references?|any query|unique identifying key|filename|index name|1",
        "INNER JOIN returns?|all left|matching pairs|all right|cartesian product|1",
        "Why may a one-to-many JOIN multiply rows?|index duplicates|multiple matching partners|distinct|WHERE expands|1",
        "LEFT JOIN right-table predicate to retain unmatched left?|ON|WHERE|GROUP BY|ORDER BY|0"
      ],
      [
        "Largest-value aggregate?|TOP|MAX|LARGEST|HIGH|1",
        "COUNT(column) ignores?|zero|NULL|negative|duplicate|1",
        "Filter aggregated groups with?|WHERE|HAVING|LIMIT|SET|1",
        "AVG ignores?|zero|NULL|negative|duplicate|1"
      ],
      [
        "Add new rows with?|INSERT|ALTER|SELECT|DROP|0",
        "UNIQUE rejects?|null always|duplicate key values|updates|sorting|1",
        "ROLLBACK does?|commit|undo uncommitted work|drop constraints|refresh indexes|1",
        "Non-repeatable read means?|second read sees changed row|syntax error|missing key|invalid index|0"
      ],
      [
        "Test non-null with?|!=NULL|IS NOT NULL|NOT =NULL|IS TRUE NULL|1",
        "COALESCE(NULL,0) equals?|NULL|0|false|error|1",
        "Why use bound SQL parameters?|disable cache|prevent injection|hide results|disable indexes|1",
        "NULL = NULL is?|true|false|unknown|1|2"
      ]
    ]
  },
  "javascript-foundations": {
    "map": [
      0,
      1,
      2,
      2,
      3,
      1,
      2,
      4,
      4,
      0
    ],
    "qs": [
      [
        "Binding cannot be reassigned with?|var|let|const|function|2",
        "Temporal dead zone?|timer queue|access before let/const initialization|garbage collection|promise state|1",
        "Closure retains?|globals only|outer lexical bindings|copied primitive values|prototype only|1",
        "Strict-mode undeclared assignment?|global created|ReferenceError|undefined|const|1"
      ],
      [
        "Array length represents?|largest value|number of slots|functions|bytes|1",
        "[1,2,3].reduce((a,b)=>a+b,0)?|6|3|[1,2,3]|undefined|0",
        "First matching element method?|filter|find|map|forEach|1",
        "[...new Set([1,1,2])]?|[1,1,2]|[1,2]|[2]|set|1"
      ],
      [
        "typeof '42'?|number|string|object|undefined|1",
        "Boolean([])?|false|true|undefined|error|1",
        "NaN===NaN?|true|false|undefined|error|1",
        "Object.is(0,-0)?|true|false|undefined|error|1"
      ],
      [
        "An async function always returns?|callback|Promise|timer|generator|1",
        "Rejects if one input promise rejects?|Promise.any|Promise.all|Promise.allSettled|map|1",
        "Which is first: Promise.then or setTimeout(fn,0)?|timeout|Promise.then|same|neither|1",
        "Promise.allSettled on rejected promise?|throws synchronously|rejected status record|retry|empty array|1"
      ],
      [
        "querySelector missing match?|undefined|null|false|[]|1",
        "JSON.stringify({x:1}) returns?|JSON string|same object|Promise|bytes|0",
        "Event listener {once:true}?|runs once|runs forever|stops bubbling|runs immediately|0",
        "textContent for untrusted text avoids?|async code|HTML parsing|encryption|focus|1"
      ]
    ]
  },
  "html-foundations": {
    "map": [
      0,
      1,
      0,
      2,
      1,
      3,
      2,
      1,
      4,
      3
    ],
    "qs": [
      [
        "Footer element?|<footer>|<bottom>|<end>|<last>|0",
        "Use <article> for?|visual box|independent content|only links|only icons|1",
        "Exposed main landmarks should normally total?|zero|one|one per paragraph|unlimited|1",
        "Section becomes a region landmark when?|always|accessible name supplied|empty|footer|1"
      ],
      [
        "input type=email offers?|send email|email validation|encryption|hidden value|1",
        "Default button type in form?|reset|submit|button|menu|1",
        "Group form controls accessibly with?|fieldset+legend|span|class|br|0",
        "Disabled control in FormData?|empty field|omitted|required|duplicate|1"
      ],
      [
        "Decorative image alt?|broken message|empty string|URL|caption only|1",
        "Icon-only button needs?|color|accessible name|visibility hidden|empty title|1",
        "aria-describedby points to?|CSS class|descriptive element ID|URL|function|1",
        "Positive tabindex is discouraged because?|disables keys|disrupts tab order|hides headings|disables links|1"
      ],
      [
        "Document title element?|<title>|<h1>|<meta>|<header>|0",
        "Where place charset metadata?|footer|head|form|after html|1",
        "Viewport meta relates to?|database|mobile viewport|auth|alt text|1",
        "rel=canonical identifies?|encryption|preferred URL|font|download|1"
      ],
      [
        "Navigation landmark?|<nav>|<navigate>|<menuitem>|<route>|0",
        "figure with figcaption means?|invalid markup|content with caption|table|form|1",
        "Use anchor instead of button to?|open modal|navigate to URL|submit|toggle|1",
        "Header cell element?|<td>|<th>|<header>|<cell>|1"
      ]
    ]
  }
};
/** 10 immutable foundation items + 20 reviewed additions per track. */
export function buildDiagnosticQuestions(id:AssessmentId,originals:readonly GradedQuestion[]):DiagnosticQuestion[]{
  if (!isDiagnosticAssessmentId(id)) throw new Error("Diagnostic bank not available for this assessment");
  const d=authored[id];
  if(originals.length!==10)throw new Error("Expected 10 foundational questions");
  const base=originals.map((q,i)=>{
    const topicIndex=d.map[i];const previous=d.map.slice(0,i).filter(n=>n===topicIndex).length;
    return {...q,topicId:diagnosticTopics[id][topicIndex].id,difficulty:(previous===0?"beginner":"intermediate") as DiagnosticDifficulty,explanation:"Correct answer: "+q.choices[q.correctIndex]+". Review this foundation concept before reassessing."};
  });
  const extra=d.qs.flatMap((topicQuestions,topicIndex)=>topicQuestions.map((row,n)=>{
    const fields=row.split("|");if(fields.length!==6)throw new Error("Invalid authored question");
    const answer=Number(fields[5]);if(!Number.isInteger(answer)||answer<0||answer>3)throw new Error("Invalid authored answer");
    return {id:id.split("-")[0]+"-d3-"+String(topicIndex*4+n+1).padStart(2,"0"),topicId:diagnosticTopics[id][topicIndex].id,
      difficulty:(["beginner","intermediate","advanced","advanced"] as const)[n],prompt:fields[0],
      choices:fields.slice(1,5),correctIndex:answer,explanation:"Correct answer: "+fields[1+answer]+". This question checks "+diagnosticTopics[id][topicIndex].label.toLowerCase()+"."};
  }));
  const out=[...base,...extra];validateDiagnosticBank(id,out);return out;
}
export function validateDiagnosticBank(id:AssessmentId,qs:readonly DiagnosticQuestion[]){
  if (!isDiagnosticAssessmentId(id)) throw new Error("Diagnostic bank not available for this assessment");
  if(qs.length!==30||new Set(qs.map(q=>q.id)).size!==30)throw new Error("Bad question bank "+id);
  for(const topic of diagnosticTopics[id]){
    const subset=qs.filter(q=>q.topicId===topic.id);
    if(subset.length<5||subset.length>7)throw new Error("Bad topic coverage "+id+":"+topic.id);
    for(const difficulty of ["beginner","intermediate","advanced"] as const){
      if(!subset.some(q=>q.difficulty===difficulty))throw new Error("Missing tier "+id+":"+topic.id);
    }
  }
  return true;
}
export {DIAGNOSTIC_VERSION};
