import { missions, skillById } from "@skillmetry/shared/data/catalog";
import { getCurriculumForSkill, getCurriculumLessonRoute } from "@skillmetry/shared/data/curriculum";
import type { CurriculumDifficulty } from "@skillmetry/shared/types/curriculum";

export type MissionRubricItem = { criterion:string; evidence:string };
export type MissionSpecification = {
  missionId:string;
  difficulty:CurriculumDifficulty;
  objectives:string[];
  prerequisiteSkillIds:string[];
  rubric:MissionRubricItem[];
  lessonHref:string|null;
  practiceHref:string|null;
  referenceResourceIds:string[];
};

const editorial:Record<string,{difficulty:CurriculumDifficulty;objectives:string[];qualityEvidence:string}>={
  "ml-deploy":{difficulty:"advanced",objectives:["Expose a deterministic prediction contract","Document deployment, input validation and failure behavior"],qualityEvidence:"A reviewer can reproduce one valid and one rejected request from the README."},
  "dockerize":{difficulty:"intermediate",objectives:["Build the same service image repeatably","Separate build inputs from runtime configuration"],qualityEvidence:"The documented build and run commands work without putting secrets in the image."},
  "sql-analysis":{difficulty:"beginner",objectives:["Answer a concrete data question with readable SQL","Validate join grain and summarize findings honestly"],qualityEvidence:"Queries are reproducible and the findings cite row counts or result evidence."},
  "react-dashboard":{difficulty:"intermediate",objectives:["Build responsive information hierarchy","Support keyboard focus and non-hover interaction"],qualityEvidence:"All controls work by keyboard at desktop and narrow-mobile widths."},
  "typescript-refactor":{difficulty:"beginner",objectives:["Replace unsafe assumptions with explicit types","Keep runtime behavior stable while typechecking cleanly"],qualityEvidence:"The project typechecks without any added any casts or suppressed errors."},
  "frontend-component-library":{difficulty:"advanced",objectives:["Define reusable component contracts and states","Prove keyboard, responsive and error-state behavior"],qualityEvidence:"Examples and interaction tests cover focus, disabled, error and narrow-layout states."},
  "node-api":{difficulty:"beginner",objectives:["Create a small validated HTTP resource","Separate request handling from testable domain logic"],qualityEvidence:"Integration tests cover a valid request and at least two invalid inputs."},
  "auth-service":{difficulty:"advanced",objectives:["Derive identity from a verified server session","Enforce owner checks with two-user denial tests"],qualityEvidence:"A cross-account request fails at the server and data boundaries."},
  "backend-service-observability":{difficulty:"intermediate",objectives:["Return bounded operational errors","Trace failure paths without logging secrets"],qualityEvidence:"Failure tests assert safe responses, correlation identifiers and useful health states."},
  "fullstack-task-hub":{difficulty:"beginner",objectives:["Connect an accessible task UI to validated CRUD operations","Preserve data across refresh and report failures clearly"],qualityEvidence:"A user can create, update and recover tasks across refresh at 320px and desktop widths."},
  "fullstack-auth-portal":{difficulty:"intermediate",objectives:["Build a complete sign-in and sign-out lifecycle","Restrict private profile data to its authenticated owner"],qualityEvidence:"Independent-user tests prove that profile reads and writes stay owner-scoped."},
  "fullstack-release":{difficulty:"advanced",objectives:["Produce one traceable release artifact","Document health, rollback and reproducible setup"],qualityEvidence:"The runbook connects a source revision to a verified build, deployment and rollback path."}
};

export const missionSpecifications:readonly MissionSpecification[]=missions.map(mission=>{
  const content=editorial[mission.id];
  if(!content)throw new Error(`Missing project specification for ${mission.id}`);
  const path=getCurriculumForSkill(mission.skillId);
  const stage=path?.topics.find(entry=>entry.topic.difficulty===content.difficulty)??path?.topics[0];
  const lesson=stage?.subtopics[0]?.lessons[0];
  return {
    missionId:mission.id,
    difficulty:content.difficulty,
    objectives:content.objectives,
    prerequisiteSkillIds:[...(skillById[mission.skillId]?.prerequisites??[])],
    rubric:[
      {criterion:"Functional evidence",evidence:content.qualityEvidence},
      {criterion:"Reproducibility",evidence:"Setup and verification steps let another learner inspect the result without hidden configuration."},
      {criterion:"Reflection",evidence:"Private notes identify one tradeoff, one failure encountered and the next improvement."}
    ],
    lessonHref:lesson?getCurriculumLessonRoute(lesson.id):null,
    practiceHref:stage?`/practice?topic=${encodeURIComponent(stage.topic.id)}`:null,
    referenceResourceIds:stage?[...new Set([...stage.topic.primaryResourceIds,...stage.topic.recommendedResourceIds])].slice(0,3):[]
  };
});

export const missionSpecificationById=Object.fromEntries(missionSpecifications.map(item=>[item.missionId,item])) as Record<string,MissionSpecification>;
