import "server-only";
import { diagnosticTopics } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";
import { practiceDraftMathCss } from "@skillmetry/backend/lib/assessments/additional-practice-math-css.server";
import { practiceDraftDataMLTS } from "@skillmetry/backend/lib/assessments/additional-practice-data-ml-ts.server";
import { practiceMoreReactNodeEval } from "@skillmetry/backend/lib/assessments/additional-practice-react-node-eval.server";
import { practiceMoreRestDockerDeployment } from "@skillmetry/backend/lib/assessments/additional-practice-rest-docker-deploy.server";
import { practiceMoreAccessibilityTestingAuth } from "@skillmetry/backend/lib/assessments/additional-practice-a11y-testing-auth.server";

const cases:Record<string,string[][]> = {
  ...practiceDraftMathCss, ...practiceDraftDataMLTS, ...practiceMoreReactNodeEval,
  ...practiceMoreRestDockerDeployment, ...practiceMoreAccessibilityTestingAuth
};

export function getAdditionalPracticeQuestions(assessmentId:AssessmentId,topicId:string) {
  const skill = assessmentId.slice(0,-"-foundations".length);
  const index=diagnosticTopics[assessmentId]?.findIndex(t=>t.id===topicId)??-1;
  const topic=cases[skill]?.[index];
  if (index<0 || !topic) return [];
  if (topic.length!==5) throw new Error("Five separate practice items required per topic");
  return topic.map((row,n)=>{
    const parts=row.split("~");
    if (parts.length!==6 || parts.some(part=>!part.trim())) throw new Error("Invalid practice authoring");
    const correctIndex=(index*5+n+1)%4;
    const original=parts.slice(1,5);
    const choices=[...original.slice(4-correctIndex),...original.slice(0,4-correctIndex)];
    if (new Set(choices).size!==4) throw new Error("Duplicate practice options");
    return {
      id:assessmentId+"-"+topicId+"-p"+(n+1), assessmentId, topicId,
      prompt:parts[0], choices, correctIndex, explanation:parts[5]
    };
  });
}
