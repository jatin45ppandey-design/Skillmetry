import "server-only";
import { diagnosticMoreMathCss } from "@skillmetry/backend/lib/assessments/additional-diagnostic-math-css.server";
import { diagnosticDraftDataMLTS } from "@skillmetry/backend/lib/assessments/additional-diagnostic-data-ml-ts.server";
import { diagnosticDraftReactNodeEvalApi } from "@skillmetry/backend/lib/assessments/additional-diagnostic-react-node-eval-api.server";
import { diagnosticDraftDockerDeployAccessibility } from "@skillmetry/backend/lib/assessments/additional-diagnostic-docker-deploy-accessibility.server";
import { diagnosticDraftTestingAuth } from "@skillmetry/backend/lib/assessments/additional-diagnostic-testing-auth.server";
import { diagnosticTopics, type DiagnosticDifficulty } from "@skillmetry/shared/data/diagnostic-taxonomy";
import type { AssessmentId } from "@skillmetry/shared/types/domain";
import type { GradedQuestion } from "@skillmetry/backend/lib/assessments/grading.server";
import type { DiagnosticQuestion } from "@skillmetry/backend/lib/assessments/diagnostic-bank.server";
import { draftFoundationExplanations } from "@skillmetry/backend/lib/assessments/additional-foundations.server";

const additional: Record<string,string[][]> = {
  ...diagnosticMoreMathCss, ...diagnosticDraftDataMLTS, ...diagnosticDraftReactNodeEvalApi,
  ...diagnosticDraftDockerDeployAccessibility, ...diagnosticDraftTestingAuth
};
function rotateChoices(row: string, seed: number) {
  const fields = row.split("~");
  if (fields.length !== 6) throw new Error("Malformed extra diagnostic question");
  const index = seed % 4;
  const original = fields.slice(1,5);
  const choices = [...original.slice(4-index), ...original.slice(0,4-index)];
  if (new Set(choices).size !== 4 || !fields[5]?.trim()) throw new Error("Unreviewed/invalid diagnostic item");
  return { prompt:fields[0], choices, correctIndex:index, explanation:fields[5] };
}

/** New skills reuse the audited 15-item selector, never legacy graded answer keys on client. */
export function buildAdditionalDiagnosticQuestions(id: AssessmentId, foundations: readonly GradedQuestion[]): DiagnosticQuestion[] {
  const skillId = id.slice(0,-"-foundations".length);
  const groups=additional[skillId], topics=diagnosticTopics[id];
  if (!groups || groups.length!==5 || foundations.length!==10 || topics?.length!==5)
    throw new Error("Incomplete 18-skill diagnostic bank");
  const explanations=draftFoundationExplanations(skillId);
  const existing:DiagnosticQuestion[]=foundations.map((q,i)=>({
    ...q, topicId:topics[Math.floor(i/2)].id,
    difficulty:(i%2===0?"beginner":"intermediate") as DiagnosticDifficulty,
    explanation:explanations[i]
  }));
  const more:DiagnosticQuestion[]=groups.flatMap((group,t)=>{
    if (group.length!==4) throw new Error("Unbalanced diagnostic questions");
    return group.map((row,n)=>({
      ...rotateChoices(row,t*4+n+1),
      id:skillId+"-diagnostic-"+String(t*4+n+1).padStart(2,"0"),
      topicId:topics[t].id,
      difficulty:(["beginner","intermediate","advanced","advanced"] as const)[n]
    }));
  });
  const merged=[...existing,...more];
  if (merged.length!==30 || new Set(merged.map(q=>q.id)).size!==30)
    throw new Error("Duplicate or incomplete question catalog");
  for (const topic of topics) {
    const questions=merged.filter(q=>q.topicId===topic.id);
    if (questions.length!==6 ||
       !["beginner","intermediate","advanced"].every(tier=>questions.some(q=>q.difficulty===tier)))
      throw new Error("Incomplete topic tier coverage");
  }
  return merged;
}
