import {curriculumCatalog} from "../shared/data/curriculum";
import {missions,careers} from "../shared/data/catalog";
import {missionSpecificationById} from "../shared/data/mission-specs";

const topicPractices=curriculumCatalog.practices.filter(item=>item.kind==="topic-practice");
const assessmentPractices=curriculumCatalog.practices.filter(item=>item.kind==="assessment");
const report={
  curriculum:{skills:curriculumCatalog.skills.length,topics:curriculumCatalog.topics.length,lessons:curriculumCatalog.lessons.length,
    topicPracticeSets:topicPractices.length,topicPracticeQuestions:topicPractices.length*3},
  guidedLab:{exercises:23,skills:curriculumCatalog.skills.length,runtime:"reference-check-only"},
  projects:{careers:careers.length,projects:missions.length,specified:missions.filter(item=>missionSpecificationById[item.id]).length,
    levels:[...new Set(missions.map(item=>missionSpecificationById[item.id].difficulty))]},
  assessments:{activeByDefault:4,activeInCurrentEnvironment:assessmentPractices.length,stagedExpanded:9,baseQuestions:90,
    diagnosticSkills:4,diagnosticBankQuestions:120,questionsPerDiagnosticAttempt:15}
};
console.log(JSON.stringify(report,null,2));
