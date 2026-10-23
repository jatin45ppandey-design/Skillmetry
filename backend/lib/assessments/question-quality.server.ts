import "server-only";

import type {GradedQuestion} from "@skillmetry/backend/lib/assessments/grading.server";

export type QuestionQualityIssue={questionId:string;code:"duplicate-id"|"short-prompt"|"choice-count"|"duplicate-choice"|"invalid-key"|"missing-explanation"};

export function validateQuestionQuality(questions:readonly (GradedQuestion&{explanation?:string})[],options:{requireExplanation?:boolean}={}){
  const issues:QuestionQualityIssue[]=[];
  const seen=new Set<string>();
  for(const question of questions){
    if(seen.has(question.id))issues.push({questionId:question.id,code:"duplicate-id"});
    seen.add(question.id);
    if(question.prompt.trim().length<12)issues.push({questionId:question.id,code:"short-prompt"});
    if(question.choices.length!==4)issues.push({questionId:question.id,code:"choice-count"});
    if(new Set(question.choices.map(choice=>choice.trim())).size!==question.choices.length)
      issues.push({questionId:question.id,code:"duplicate-choice"});
    if(!Number.isInteger(question.correctIndex)||question.correctIndex<0||question.correctIndex>=question.choices.length)
      issues.push({questionId:question.id,code:"invalid-key"});
    if(options.requireExplanation&&(!question.explanation||question.explanation.trim().length<20))
      issues.push({questionId:question.id,code:"missing-explanation"});
  }
  return issues;
}
