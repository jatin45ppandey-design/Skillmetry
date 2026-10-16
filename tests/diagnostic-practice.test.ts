import { describe,expect,it } from "vitest";
import { getPracticeQuestions } from "@skillmetry/backend/lib/assessments/practice-bank.server";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";
describe("D2 unscored targeted practice",()=>{
  it("provides separately authored questions for every supported diagnostic topic",()=>{
    const ids=Object.keys(diagnosticTopics) as AssessmentId[];
    const all=[];
    for(const id of ids)for(const topic of diagnosticTopics[id]){
      const questions=getPracticeQuestions(id,topic.id);
      expect(questions).toHaveLength(2);
      expect(questions.every(q=>q.choices.length===4&&q.correctIndex>=0&&q.correctIndex<4)).toBe(true);
      all.push(...questions.map(q=>q.id));
    }
    expect(new Set(all).size).toBe(all.length);
    expect(getPracticeQuestions("javascript-foundations","bogus")).toEqual([]);
  });
});
