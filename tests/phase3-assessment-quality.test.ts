import {describe,expect,it} from "vitest";
import {getAssessmentDefinition,isDiagnosticDefinition,publicQuestions} from "@skillmetry/backend/lib/assessments/question-bank.server";
import {validateQuestionQuality} from "@skillmetry/backend/lib/assessments/question-quality.server";
import {diagnosticTopics} from "@skillmetry/shared/data/diagnostic-taxonomy";
import type {AssessmentId} from "@skillmetry/shared/types/domain";

const allIds:AssessmentId[]=["python-foundations","sql-foundations","javascript-foundations","html-foundations","css-foundations","typescript-foundations","react-foundations","node-foundations","rest-api-foundations"];
describe("Phase 3 assessment quality and truth boundaries",()=>{
  it.each(allIds)("validates the reviewed 2026.2 bank for %s",id=>{
    const definition=getAssessmentDefinition(id,"2026.2");
    expect(validateQuestionQuality(definition.questions)).toEqual([]);
    expect(JSON.stringify(publicQuestions(definition,definition.questions.map(item=>item.id)))).not.toContain("correctIndex");
  });
  it.each(Object.keys(diagnosticTopics) as AssessmentId[])("validates explanations and exact topic-tier coverage for %s",id=>{
    const definition=getAssessmentDefinition(id,"2026.3");
    expect(isDiagnosticDefinition(definition)).toBe(true);
    expect(validateQuestionQuality(definition.questions,{requireExplanation:true})).toEqual([]);
    if(!isDiagnosticDefinition(definition))throw new Error("Expected diagnostic definition");
    for(const topic of diagnosticTopics[id as keyof typeof diagnosticTopics]){
      const items=definition.questions.filter(item=>item.topicId===topic.id);
      expect(items.length).toBeGreaterThanOrEqual(5);
      expect(items.length).toBeLessThanOrEqual(7);
      expect(new Set(items.map(item=>item.difficulty))).toEqual(new Set(["beginner","intermediate","advanced"]));
    }
  });
});
