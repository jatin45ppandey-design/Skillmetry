import { describe, expect, it } from "vitest";
import { skills } from "@skillmetry/shared/data/catalog";
import { getAssessmentDefinition, isDiagnosticDefinition } from "@skillmetry/backend/lib/assessments/question-bank.server";
import { selectDiagnosticQuestionIds } from "@skillmetry/backend/lib/assessments/diagnostic-selection.server";
import { getPracticeQuestions } from "@skillmetry/backend/lib/assessments/practice-bank.server";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import { gradeAnswers } from "@skillmetry/backend/lib/assessments/grading.server";
import type { AssessmentId } from "@skillmetry/shared/types/domain";

const expanded=skills.filter(s=>!["python","sql","javascript","html"].includes(s.id));
describe("All 14 new skill question and unscored practice banks (editorial rollout gate)",()=>{
  it.each(expanded)("$label: 10 foundation + 20 diagnostic = 30; 15 secure sample questions",{timeout:10000},skill=>{
    const id=(skill.id+"-foundations") as AssessmentId;
    const legacy=getAssessmentDefinition(id,"2026.2");
    const diagnostic=getAssessmentDefinition(id,"2026.3");
    expect(legacy.questions).toHaveLength(10);
    expect(diagnostic.questions).toHaveLength(30);
    expect(isDiagnosticDefinition(diagnostic)).toBe(true);
    if (!isDiagnosticDefinition(diagnostic)) return;
    const order=selectDiagnosticQuestionIds(id,diagnostic.questions,()=>0);
    expect(order).toHaveLength(15);
    expect(new Set(order).size).toBe(15);
    expect(new Set(diagnostic.questions.map(q=>q.prompt)).size).toBe(30);
    for(const q of diagnostic.questions) {
      expect(q.choices).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(12);
    }
    const selected=order.map(key=>diagnostic.questions.find(q=>q.id===key)!);
    const result=gradeAnswers(selected,Object.fromEntries(selected.map(q=>[q.id,q.correctIndex])));
    expect(result.score).toBe(100);
  });
  it.each(expanded)("$label: 25 independent topic practice items",skill=>{
    const id=(skill.id+"-foundations") as AssessmentId;
    const graded=getAssessmentDefinition(id,"2026.3");
    const gradedIds=new Set(graded.questions.map(q=>q.id));
    for(const topic of diagnosticTopics[id]){
      const practice=getPracticeQuestions(id,topic.id);
      expect(practice).toHaveLength(5);
      expect(practice.every(q=>!gradedIds.has(q.id))).toBe(true);
      expect(new Set(practice.map(q=>q.id)).size).toBe(5);
      for(const q of practice) {
        expect(q.choices).toHaveLength(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
        expect(q.explanation.length).toBeGreaterThan(8);
      }
    }
  });
});
