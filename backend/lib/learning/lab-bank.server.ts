import "server-only";
import type { SkillId } from "@skillmetry/shared/types/domain";
import { getCurriculumForSkill, getCurriculumLessonRoute } from "@skillmetry/shared/data/curriculum";

type Exercise={
  id:string;skillId:SkillId;title:string;kind:"choice"|"fill";prompt:string;snippet:string;
  difficulty:"beginner"|"intermediate"|"advanced";choices?:readonly string[];solution:string;explanation:string;
};
const exercises:readonly Exercise[]=[
  {id:"js-array",skillId:"javascript",title:"Array transformations",kind:"choice",difficulty:"beginner",
    prompt:"Predict the logged output.",snippet:"console.log([1,2,3].filter(n => n > 1).map(n => n * 2));",
    choices:["[2,4,6]","[4,6]","[2,3]","6"],solution:"1",
    explanation:"filter keeps 2 and 3 before map doubles them."},
  {id:"js-await",skillId:"javascript",title:"Async functions",kind:"fill",difficulty:"beginner",
    prompt:"Fill the missing keyword.",snippet:"const result = ____ fetch('/api/data');",solution:"await",
    explanation:"await pauses the async function while the Promise settles."},
  {id:"js-equality",skillId:"javascript",title:"Strict equality",kind:"fill",difficulty:"beginner",
    prompt:"Fill the comparison operator that makes this false.",snippet:"const equal = 3 ____ '3';",solution:"===",
    explanation:"Strict equality does not coerce a number into a string."},
  {id:"py-slicing",skillId:"python",title:"List slices",kind:"choice",difficulty:"beginner",
    prompt:"Predict the printed value.",snippet:"values = [2,4,6,8]\nprint(values[-2:])",
    choices:["[2,4]","[6,8]","[8]","[4,6]"],solution:"1",
    explanation:"A slice from -2 takes the last two elements."},
  {id:"py-get",skillId:"python",title:"Dictionary defaults",kind:"fill",difficulty:"beginner",
    prompt:"Fill the method that returns a default for a missing key.",snippet:"value = mapping.____('missing', 0)",
    solution:"get",explanation:"dict.get(key, default) avoids KeyError for an absent key."},
  {id:"sql-where",skillId:"sql",title:"Filtering rows",kind:"fill",difficulty:"beginner",
    prompt:"Fill the SQL keyword.",snippet:"SELECT name FROM students ____ active = true;",
    solution:"where",explanation:"WHERE filters individual rows."},
  {id:"sql-having",skillId:"sql",title:"Aggregates",kind:"choice",difficulty:"intermediate",
    prompt:"Which clause filters grouped COUNT results?",snippet:"SELECT department,COUNT(*) FROM employees GROUP BY department ...",
    choices:["WHERE COUNT(*) > 1","HAVING COUNT(*) > 1","LIMIT COUNT(*)","ORDER COUNT(*)"],
    solution:"1",explanation:"HAVING filters aggregate groups."},
  {id:"ts-union",skillId:"typescript",title:"Union types",kind:"fill",difficulty:"beginner",
    prompt:"Fill the union type symbol.",snippet:"let id: string ____ number;",solution:"|",
    explanation:"A vertical bar represents a union type."},
  {id:"ts-narrow",skillId:"typescript",title:"Narrowing",kind:"choice",difficulty:"intermediate",
    prompt:"Which check narrows a union to string?",snippet:"function use(value: string | number) { /* check */ }",
    choices:["value === String","typeof value === 'string'","Boolean(value)","value as string"],
    solution:"1",explanation:"typeof is a runtime test; an assertion is not."},
  {id:"react-state",skillId:"react",title:"React state",kind:"choice",difficulty:"intermediate",
    prompt:"Which change correctly appends to state?",snippet:"const [items,setItems] = useState<string[]>([]);",
    choices:["items.push('a')","setItems(items.push('a'))","setItems(prev => [...prev,'a'])","items = ['a']"],
    solution:"2",explanation:"React state updates should create a new array."},
  {id:"api-patch",skillId:"rest-api",title:"HTTP semantics",kind:"choice",difficulty:"beginner",
    prompt:"What method conventionally makes a partial update?",snippet:"PATCH /api/profile HTTP/1.1",
    choices:["GET","HEAD","PATCH","OPTIONS"],solution:"2",
    explanation:"PATCH conventionally applies a partial resource change."},
  {id:"node-env",skillId:"node",title:"Node environment",kind:"fill",difficulty:"beginner",
    prompt:"Fill the server environment property.",snippet:"const key = process.____.APP_SECRET;",
    solution:"env",explanation:"process.env contains server process environment variables."}
  ,{id:"math-median",skillId:"math",title:"Robust summaries",kind:"choice",difficulty:"beginner",
    prompt:"Which summary is less affected by one extreme outlier?",snippet:"values = [4, 5, 5, 6, 80]",
    choices:["Mean","Median","Range","Maximum"],solution:"1",explanation:"The median depends on order, so one extreme value has less influence."}
  ,{id:"data-merge",skillId:"data-processing",title:"Validate a merge",kind:"choice",difficulty:"intermediate",
    prompt:"What should you check before joining customer rows?",snippet:"orders.merge(customers, on='customer_id')",
    choices:["Font size","Key uniqueness and expected row grain","Only column order","Notebook theme"],solution:"1",explanation:"Key uniqueness and row grain reveal accidental row multiplication."}
  ,{id:"ml-split",skillId:"ml-foundations",title:"Prevent data leakage",kind:"choice",difficulty:"intermediate",
    prompt:"Which sequence keeps evaluation data independent?",snippet:"data -> ? -> fit preprocessing -> evaluate",
    choices:["Scale all rows, then split","Split first, fit preprocessing on training rows","Tune on test rows","Duplicate the test set"],solution:"1",explanation:"Split before fitting transformations so evaluation information cannot leak into training."}
  ,{id:"evaluation-imbalance",skillId:"model-evaluation",title:"Evaluate imbalanced outcomes",kind:"choice",difficulty:"advanced",
    prompt:"Which evidence is more useful than accuracy alone for a rare positive class?",snippet:"positives = 2% of examples",
    choices:["Precision and recall","Training file size","Alphabetical labels","One successful prediction"],solution:"0",explanation:"Precision and recall expose false-positive and false-negative tradeoffs hidden by accuracy."}
  ,{id:"docker-cache",skillId:"docker",title:"Container layer reuse",kind:"choice",difficulty:"intermediate",
    prompt:"Which ordering usually improves dependency-layer caching?",snippet:"# Dockerfile build steps",
    choices:["Copy all source before dependency files","Copy dependency manifests, install, then copy source","Run the app before install","Store secrets in the image"],solution:"1",explanation:"Stable dependency manifests can reuse cached install layers when application source changes."}
  ,{id:"deploy-health",skillId:"deployment",title:"Release health checks",kind:"choice",difficulty:"advanced",
    prompt:"What should a deployment health endpoint report?",snippet:"GET /health",
    choices:["A hard-coded success only","A bounded readiness signal without secrets","All environment variables","User access tokens"],solution:"1",explanation:"A health signal should be useful and bounded without exposing credentials or private data."}
  ,{id:"css-overflow",skillId:"css",title:"Responsive media",kind:"fill",difficulty:"beginner",
    prompt:"Fill the property that prevents an image from exceeding its container.",snippet:"img { ____: 100%; height: auto; }",
    solution:"max-width",explanation:"max-width: 100% lets the image shrink within the available inline size."}
  ,{id:"html-button",skillId:"html",title:"Use semantic actions",kind:"choice",difficulty:"beginner",
    prompt:"Which element should trigger an in-page action?",snippet:"<!-- open a settings panel -->",
    choices:["<div>","<a>","<button>","<span>"],solution:"2",explanation:"A button carries action semantics and keyboard behavior without recreating them manually."}
  ,{id:"a11y-focus",skillId:"accessibility",title:"Visible keyboard focus",kind:"choice",difficulty:"intermediate",
    prompt:"Which selector targets keyboard-style focus without suppressing it?",snippet:"button { /* focus rule */ }",
    choices:[":hover",":focus-visible",":empty",":visited"],solution:"1",explanation:":focus-visible supports a clear focus indicator for keyboard navigation."}
  ,{id:"test-boundary",skillId:"testing",title:"Choose a test boundary",kind:"choice",difficulty:"advanced",
    prompt:"Which test best protects an owner-scoped API boundary?",snippet:"GET /api/private-record/:id",
    choices:["A CSS snapshot","A two-user authorization integration test","A font check","A mocked always-success test"],solution:"1",explanation:"A two-user integration test proves one authenticated owner cannot read another owner's row."}
  ,{id:"auth-owner",skillId:"authentication",title:"Owner-scoped authorization",kind:"choice",difficulty:"advanced",
    prompt:"Where should a private resource owner ID come from?",snippet:"request -> authorize -> query",
    choices:["A hidden form field","The verified server session","A query-string nickname","Local storage"],solution:"1",explanation:"The server must derive ownership from a validated identity claim, never client-supplied identity."}
];
export type PublicLabExercise=Omit<Exercise,"solution"> & {
  hint:string;topicId:string|null;lessonHref:string|null;executionMode:"reference-check";
};
export function listLabExercises(skillId?:string):PublicLabExercise[] {
  return exercises.filter(x=>!skillId||x.skillId===skillId).map(({solution:removed,...item})=>{
    void removed;
    const path=getCurriculumForSkill(item.skillId);
    const topic=path?.topics.find(entry=>entry.topic.difficulty===item.difficulty)?.topic??path?.topics[0]?.topic;
    const lesson=path?.topics.find(entry=>entry.topic.id===topic?.id)?.subtopics[0]?.lessons[0];
    return {...item,
      hint:item.kind==="choice"?"Trace the snippet or scenario one step at a time before choosing.":"The blank expects one keyword, operator, or property name.",
      topicId:topic?.id??null,lessonHref:lesson?getCurriculumLessonRoute(lesson.id):null,
      executionMode:"reference-check" as const};
  });
}
export function gradeLabExercise(id:string,answer:{selectedIndex?:number;textAnswer?:string}){
  const exercise=exercises.find(x=>x.id===id);
  if(!exercise)return null;
  const response=exercise.kind==="choice"
    ? Number.isInteger(answer.selectedIndex)&&answer.selectedIndex!==undefined&&answer.selectedIndex>=0&&answer.selectedIndex<4
      ? String(answer.selectedIndex):null
    : typeof answer.textAnswer==="string"&&answer.textAnswer.length<=80
      ? answer.textAnswer.trim().toLowerCase():null;
  if(response===null)return null;
  return {exerciseId:id,skillId:exercise.skillId,correct:response===exercise.solution,
    answer:exercise.kind==="choice"?exercise.choices?.[Number(exercise.solution)]??"":exercise.solution,
    explanation:exercise.explanation,trust:"Guided practice only. Not a trusted assessment score."};
}
