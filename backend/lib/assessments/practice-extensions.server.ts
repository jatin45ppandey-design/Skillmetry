import "server-only";
import type { AssessmentId } from "@skillmetry/shared/types/domain";
/** Three additional independent practice exercises per topic, with authored feedback. */
export const practiceExtensions:Record<AssessmentId,readonly string[][]> = {
  "python-foundations": [
    [
      "What does float('3.5') return?|3.5|'3.5'|3|Error|0|float parses numeric strings into floating point numbers.",
      "What is type(None).__name__?|'NoneType'|'null'|'undefined'|'str'|0|None is an instance of Python's NoneType.",
      "What is bool('')?|True|False|None|Error|1|The empty string is falsy."
    ],
    [
      "How many items in [1,1,2]?|2|3|1|0|1|Lists retain duplicate elements.",
      "What is 'a' in {'a':1}?|True|False|None|Error|0|Dictionary membership checks keys.",
      "What is [1,2][::-1]?|[1,2]|[2,1]|[1]|[]|1|A slice with step -1 reverses the list."
    ],
    [
      "What is list(range(3))?|[1,2,3]|[0,1,2]|[0,1,2,3]|[3]|1|range starts at zero and stops before three.",
      "What is (lambda x: x*2)(3)?|3|6|2|Error|1|The lambda multiplies its argument by two.",
      "What is f() if defined as def f(x=2): return x?|None|2|0|Error|1|The provided default is used when no argument is passed."
    ],
    [
      "Which exception does 1/0 raise?|KeyError|ZeroDivisionError|ValueError|NameError|1|Division by zero raises ZeroDivisionError.",
      "Which call explicitly raises an exception?|raise ValueError('bad')|return ValueError|except ValueError|try ValueError|0|raise signals an exceptional condition.",
      "Opening a missing path with mode 'r' normally?|Creates file|Raises FileNotFoundError|Returns None|Truncates file|1|Read mode requires an existing path."
    ],
    [
      "What is 5 % 2?|1|2|2.5|0|0|Modulo returns the remainder after division.",
      "What is 'ab' in 'zabc'?|True|False|None|Error|0|in performs a substring membership test on strings.",
      "What is 4 ** 2?|8|16|6|2|1|** exponentiates four to the power of two."
    ]
  ],
  "sql-foundations": [
    [
      "Combine two row filters with?|AND|SORT|GROUP|TOTAL|0|AND requires both predicates to be true.",
      "What does LIKE 'A%' match?|Names beginning A|Names ending A|Names containing any A only|All names|0|Percent matches any following sequence.",
      "OFFSET 2 means?|Skip first two rows|Return exactly two|Delete two|Sort descending|0|OFFSET skips rows of the ordered result."
    ],
    [
      "CROSS JOIN of 2 and 3 rows yields?|2|3|5|6|3|A cross join produces every pair (2 times 3).",
      "Unmatched right columns after LEFT JOIN become?|0|NULL|empty string|false|1|The outer join fills absent right-side values with NULL.",
      "A many-to-many junction table usually stores?|Two foreign keys|Only a description|Only an index|No keys|0|Each association references both related tables."
    ],
    [
      "SUM(amount) calculates?|Row count|Total of non-null amounts|Smallest amount|Average|1|SUM adds numeric values, excluding NULL.",
      "COUNT(*) over three rows with one NULL equals?|2|3|NULL|0|1|COUNT(*) counts rows regardless of column values.",
      "GROUP BY city with COUNT(*) gives?|One count per city|One global count|Sorted city names only|No counts|0|GROUP BY partitions rows into city groups."
    ],
    [
      "DELETE FROM users WHERE id=4 does?|Deletes matching rows|Deletes all tables|Creates a user|Selects id 4|0|WHERE narrows which rows DELETE removes.",
      "A CHECK(age>=0) constraint helps?|Enforce allowed values|Encrypt age|Auto-increment age|Sort results|0|CHECK rejects rows violating its predicate.",
      "COMMIT does what?|Undo changes|Save pending transaction changes|Drop the database|Re-run query|1|COMMIT makes a transaction's changes durable."
    ],
    [
      "What is NULL IS NULL?|TRUE|FALSE|UNKNOWN|error|0|IS NULL explicitly tests whether a value is null.",
      "COALESCE(NULL,5) returns?|NULL|5|0|error|1|COALESCE selects the first non-null expression.",
      "Parameterized SQL prevents untrusted text from?|Being displayed|Changing SQL syntax|Being indexed|Being logged|1|A bound value is data, not executable SQL."
    ]
  ],
  "javascript-foundations": [
    [
      "What is the scope of let declared inside {}?|Block|Global always|Module always|Function only|0|let obeys the enclosing block's lexical scope.",
      "What does const obj={x:1};obj.x=2 do?|Always fails|Can change property|Changes binding|Deletes object|1|const fixes the binding, not the object properties.",
      "What is a function's lexical scope determined by?|Call site|Where it is defined|Timer state|DOM tree|1|Lexical scope follows source nesting."
    ],
    [
      "What does [1,2].filter(x=>x>1) produce?|[2]|[1]|true|2|0|filter returns items satisfying the callback.",
      "What does [1,2].includes(2) return?|true|false|2|undefined|0|includes checks for a contained value.",
      "What does [1,2].slice(1) return?|[1]|[2]|[1,2]|2|1|slice returns elements from the specified index."
    ],
    [
      "What is Number('4')?|4|'4'|NaN|undefined|0|Number converts a numeric string to a number.",
      "What is null ?? 'fallback'?|null|'fallback'|false|undefined|1|Nullish coalescing chooses the right value when the left is null or undefined.",
      "What is 1 === '1'?|true|false|undefined|error|1|Strict equality does not coerce a string into a number."
    ],
    [
      "await Promise.resolve(2) yields?|Promise object|2|undefined|timeout ID|1|await unwraps a fulfilled promise's value.",
      "What does Promise.reject(Error('x')).catch(()=>0) resolve to?|0|Error|undefined|never settles|0|catch can recover a rejected promise with a fallback.",
      "Which schedules a microtask?|queueMicrotask|setTimeout|setInterval|requestAnimationFrame|0|queueMicrotask schedules work in the microtask queue."
    ],
    [
      "What is document.getElementById('missing')?|null|[]|false|undefined|0|A missing DOM element returns null.",
      "How do you avoid executing HTML from user input?|textContent|innerHTML|eval|document.write|0|textContent does not parse tags as markup.",
      "What is JSON.parse('[1,2]')?|[1,2]|'[1,2]'|undefined|false|0|JSON.parse converts JSON text into a JavaScript value."
    ]
  ],
  "html-foundations": [
    [
      "Which tag identifies a page header?|<header>|<top>|<heading>|<titlebar>|0|header identifies introductory or navigational content.",
      "For independent blog entries use?|<article>|<span>|<b>|<small>|0|article represents standalone content.",
      "Where should primary document content live?|<main>|<footer>|<aside>|<style>|0|main provides the document's primary landmark."
    ],
    [
      "Which control is selected from multiple radio choices?|input type=radio|input type=hidden|output|textarea|0|Radio inputs represent one choice from a group.",
      "What makes a text input required?|required attribute|readonly attribute|hidden attribute|async|0|required activates browser required-field validation.",
      "Why supply name on form controls?|Submitted key|Visual style|Screen brightness|Autofocus|0|name becomes the field key on submission."
    ],
    [
      "How should input instructions be associated?|aria-describedby|background color|class only|font-size|0|aria-describedby points to helpful description.",
      "Which attribute gives an image alternative?|alt|width|loading|srcset|0|alt text conveys meaning when the image cannot be perceived.",
      "Accessible name for icon-only button?|aria-label|data-style|class|tabindex=-1|0|An accessible name describes the button action."
    ],
    [
      "What is html lang='en' for?|Document language|Font style|Javascript runtime|Database locale|0|The lang attribute identifies the document's language.",
      "Which element contains CSS style links?|<head>|<main>|<aside>|<figcaption>|0|Stylesheet links are document metadata.",
      "Where must charset declaration appear?|Within head|Inside footer|In every table|After body|0|Encoding metadata belongs near the start of head."
    ],
    [
      "Use <a href='/docs'> for?|Navigation|Form submit only|Toggle state only|Audio playback|0|Anchors with href navigate to destinations.",
      "Table column headings use?|<th scope='col'>|<td class='head'>|<b>|<tr scope='col'>|0|th with scope=col identifies column headers.",
      "An ordered sequence uses?|<ol>|<ul>|<dl>|<div>|0|ol represents ordered list items."
    ]
  ]
};
