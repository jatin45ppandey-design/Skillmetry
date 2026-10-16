import "server-only";
import type { SkillId } from "@skillmetry/shared/types/domain";

type Exercise={
  id:string;skillId:SkillId;title:string;kind:"choice"|"fill";prompt:string;snippet:string;
  difficulty:"beginner"|"intermediate";choices?:readonly string[];solution:string;explanation:string;
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
];
export type PublicLabExercise=Omit<Exercise,"solution">;
export function listLabExercises(skillId?:string):PublicLabExercise[] {
  return exercises.filter(x=>!skillId||x.skillId===skillId).map(({solution:removed,...item})=>item);
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
