import {describe,expect,it} from "vitest";
import {gradeLabExercise,listLabExercises} from "@skillmetry/backend/lib/learning/lab-bank.server";
describe("P5 guided coding lab",()=>{
  it("keeps the answer key outside public exercise metadata",()=>{
    const items=listLabExercises();
    expect(items.length).toBeGreaterThanOrEqual(12);
    expect(new Set(items.map(x=>x.id)).size).toBe(items.length);
    for(const item of items)expect(Object.keys(item)).not.toContain("solution");
  });
  it("checks guided coding answers without executing submitted code",()=>{
    expect(gradeLabExercise("js-await",{textAnswer:" await "})?.correct).toBe(true);
    expect(gradeLabExercise("sql-where",{textAnswer:"WHERE"})?.correct).toBe(true);
    expect(gradeLabExercise("js-array",{selectedIndex:1})?.correct).toBe(true);
    expect(gradeLabExercise("react-state",{selectedIndex:0})?.correct).toBe(false);
  });
  it("rejects incorrect response modes and unrecognized IDs",()=>{
    expect(gradeLabExercise("not-a-real-exercise",{selectedIndex:0})).toBeNull();
    expect(gradeLabExercise("js-await",{selectedIndex:0})).toBeNull();
    expect(gradeLabExercise("react-state",{textAnswer:"just a string"})).toBeNull();
  });
});
