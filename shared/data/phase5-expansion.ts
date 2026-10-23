import type { Career, Mission, Skill } from "@skillmetry/shared/types/domain";

/**
 * Phase 5 additions are deliberately catalog-only. They have learning paths
 * but no assessment metadata, so they remain Not Assessed until a reviewed
 * server-graded bank is introduced in a later, separate assessment release.
 */
export const phase5Skills: readonly Skill[] = [
  { id: "data-structures-algorithms", label: "Data Structures & Algorithms", group: "Foundation", description: "Choose data structures and reason about algorithmic trade-offs.", prerequisites: [] },
  { id: "object-oriented-programming", label: "Object-Oriented Programming", group: "Foundation", description: "Model behavior with cohesive objects and explicit contracts.", prerequisites: [] },
  { id: "database-systems", label: "Database Systems", group: "Core", description: "Design reliable relational data models and transactions.", prerequisites: ["sql"] },
  { id: "operating-systems", label: "Operating Systems", group: "Foundation", description: "Understand processes, memory, files, and resource isolation.", prerequisites: [] },
  { id: "computer-networks", label: "Computer Networks", group: "Foundation", description: "Trace how data travels across dependable network layers.", prerequisites: [] },
  { id: "data-analytics", label: "Data Analytics", group: "Core", description: "Turn a defined question into a reproducible data analysis.", prerequisites: ["sql", "data-processing"] },
  { id: "business-intelligence", label: "Business Intelligence", group: "Applied", description: "Build decision-ready metrics, reports, and dashboards.", prerequisites: ["data-analytics"] },
  { id: "data-science", label: "Data Science", group: "Core", description: "Frame evidence-based questions and validate statistical models.", prerequisites: ["python", "math", "data-processing"] },
  { id: "data-engineering", label: "Data Engineering", group: "Core", description: "Build dependable data pipelines with observable contracts.", prerequisites: ["python", "sql", "database-systems"] },
  { id: "ai-engineering", label: "AI Engineering", group: "Applied", description: "Integrate AI capabilities with clear product and safety boundaries.", prerequisites: ["python", "rest-api", "testing"] },
  { id: "llm-applications", label: "LLM Applications", group: "Applied", description: "Design bounded language-model features with reliable inputs and outputs.", prerequisites: ["ai-engineering"] },
  { id: "retrieval-augmented-generation", label: "Retrieval-Augmented Generation", group: "Applied", description: "Ground AI responses in retrieved, traceable information.", prerequisites: ["llm-applications", "database-systems"] },
  { id: "cloud-infrastructure", label: "Cloud Infrastructure", group: "Core", description: "Select and operate cloud services with explicit reliability boundaries.", prerequisites: ["computer-networks"] },
  { id: "devops", label: "DevOps Practices", group: "Applied", description: "Improve delivery flow through shared operational practices.", prerequisites: ["git-workflows", "testing"] },
  { id: "continuous-delivery", label: "Continuous Delivery", group: "Applied", description: "Automate safe build, test, and release feedback loops.", prerequisites: ["devops", "testing"] },
  { id: "infrastructure-automation", label: "Infrastructure Automation", group: "Applied", description: "Define reproducible infrastructure as reviewed code.", prerequisites: ["cloud-infrastructure", "git-workflows"] },
  { id: "cybersecurity", label: "Cybersecurity Fundamentals", group: "Foundation", description: "Recognize common threats and reduce avoidable security risk.", prerequisites: ["computer-networks", "operating-systems"] },
  { id: "application-security", label: "Application Security", group: "Applied", description: "Build application controls around realistic attack paths.", prerequisites: ["cybersecurity", "authentication", "testing"] },
  { id: "android-development", label: "Android Development", group: "Core", description: "Build accessible Android interfaces and lifecycle-aware features.", prerequisites: ["object-oriented-programming"] },
  { id: "qa-automation", label: "QA Automation", group: "Applied", description: "Automate high-value quality checks across user workflows.", prerequisites: ["testing", "javascript"] },
  { id: "ui-ux-design", label: "UI/UX Design", group: "Foundation", description: "Design understandable interfaces around user goals and constraints.", prerequisites: [] },
  { id: "ux-research", label: "UX Research", group: "Core", description: "Plan ethical research that informs product decisions.", prerequisites: ["ui-ux-design"] },
  { id: "git-workflows", label: "Git Workflows", group: "Foundation", description: "Track changes, review work, and recover safely with Git.", prerequisites: [] },
  { id: "system-design", label: "System Design", group: "Applied", description: "Reason about service boundaries, reliability, and trade-offs.", prerequisites: ["rest-api", "database-systems", "computer-networks"] }
];

export const phase5Careers: readonly Career[] = [
  { id: "data-analyst", title: "Data Analyst", subtitle: "From questions to trustworthy decisions", icon: "chart", skills: [
    { skillId: "sql", weight: 20 }, { skillId: "data-analytics", weight: 20 }, { skillId: "business-intelligence", weight: 18 }, { skillId: "data-processing", weight: 15 }, { skillId: "math", weight: 12 }, { skillId: "database-systems", weight: 8 }, { skillId: "git-workflows", weight: 7 }
  ] },
  { id: "data-scientist", title: "Data Scientist", subtitle: "Evidence, experiments, and responsible models", icon: "flask", skills: [
    { skillId: "python", weight: 15 }, { skillId: "math", weight: 15 }, { skillId: "data-science", weight: 18 }, { skillId: "data-processing", weight: 12 }, { skillId: "ml-foundations", weight: 15 }, { skillId: "model-evaluation", weight: 12 }, { skillId: "sql", weight: 8 }, { skillId: "data-analytics", weight: 5 }
  ] },
  { id: "ai-llm-application-engineer", title: "AI / LLM Application Engineer", subtitle: "Useful AI features with grounded, testable behavior", icon: "sparkles", skills: [
    { skillId: "python", weight: 12 }, { skillId: "ai-engineering", weight: 18 }, { skillId: "llm-applications", weight: 18 }, { skillId: "retrieval-augmented-generation", weight: 16 }, { skillId: "model-evaluation", weight: 12 }, { skillId: "rest-api", weight: 10 }, { skillId: "testing", weight: 8 }, { skillId: "application-security", weight: 6 }
  ] },
  { id: "devops-engineer", title: "DevOps Engineer", subtitle: "Reliable delivery and operable infrastructure", icon: "workflow", skills: [
    { skillId: "git-workflows", weight: 12 }, { skillId: "devops", weight: 18 }, { skillId: "continuous-delivery", weight: 16 }, { skillId: "infrastructure-automation", weight: 16 }, { skillId: "cloud-infrastructure", weight: 14 }, { skillId: "docker", weight: 10 }, { skillId: "deployment", weight: 8 }, { skillId: "testing", weight: 6 }
  ] },
  { id: "qa-automation-engineer", title: "QA / Automation Engineer", subtitle: "Confidence through deliberate quality signals", icon: "check-circle", skills: [
    { skillId: "testing", weight: 20 }, { skillId: "qa-automation", weight: 20 }, { skillId: "javascript", weight: 12 }, { skillId: "rest-api", weight: 12 }, { skillId: "continuous-delivery", weight: 10 }, { skillId: "application-security", weight: 8 }, { skillId: "accessibility", weight: 8 }, { skillId: "git-workflows", weight: 10 }
  ] },
  { id: "cybersecurity-analyst", title: "Cybersecurity Analyst", subtitle: "Defensible systems and practical threat awareness", icon: "shield", skills: [
    { skillId: "cybersecurity", weight: 22 }, { skillId: "application-security", weight: 18 }, { skillId: "computer-networks", weight: 15 }, { skillId: "operating-systems", weight: 15 }, { skillId: "authentication", weight: 12 }, { skillId: "testing", weight: 8 }, { skillId: "git-workflows", weight: 10 }
  ] },
  { id: "android-developer", title: "Android Developer", subtitle: "Mobile experiences that respect users and devices", icon: "smartphone", skills: [
    { skillId: "android-development", weight: 25 }, { skillId: "object-oriented-programming", weight: 18 }, { skillId: "rest-api", weight: 14 }, { skillId: "testing", weight: 12 }, { skillId: "accessibility", weight: 10 }, { skillId: "authentication", weight: 9 }, { skillId: "git-workflows", weight: 6 }, { skillId: "deployment", weight: 6 }
  ] },
  { id: "cloud-engineer", title: "Cloud Engineer", subtitle: "Cloud services with clear operational trade-offs", icon: "cloud", skills: [
    { skillId: "cloud-infrastructure", weight: 22 }, { skillId: "infrastructure-automation", weight: 18 }, { skillId: "computer-networks", weight: 14 }, { skillId: "docker", weight: 12 }, { skillId: "deployment", weight: 12 }, { skillId: "continuous-delivery", weight: 10 }, { skillId: "system-design", weight: 7 }, { skillId: "application-security", weight: 5 }
  ] },
  { id: "data-engineer", title: "Data Engineer", subtitle: "Dependable pipelines for usable data", icon: "database", skills: [
    { skillId: "data-engineering", weight: 22 }, { skillId: "sql", weight: 18 }, { skillId: "python", weight: 14 }, { skillId: "database-systems", weight: 13 }, { skillId: "data-processing", weight: 12 }, { skillId: "cloud-infrastructure", weight: 9 }, { skillId: "testing", weight: 6 }, { skillId: "git-workflows", weight: 6 }
  ] },
  { id: "ui-ux-designer", title: "UI/UX Designer", subtitle: "Research-led interfaces that people can use", icon: "palette", skills: [
    { skillId: "ui-ux-design", weight: 25 }, { skillId: "ux-research", weight: 22 }, { skillId: "accessibility", weight: 16 }, { skillId: "html", weight: 10 }, { skillId: "css", weight: 10 }, { skillId: "data-analytics", weight: 7 }, { skillId: "testing", weight: 5 }, { skillId: "git-workflows", weight: 5 }
  ] }
];

type MissionSeed = { id:string; roleId:Career["id"]; title:string; description:string; skillId:string; estimatedHours:number; deliverables:string[] };
const seed = (entry: MissionSeed): Mission => ({ ...entry, simulatedGain: 0 });

/** Project suggestions are self-reported learning activity, never evidence or score inputs. */
export const phase5Missions: readonly Mission[] = [
  seed({ id:"analyst-metric-brief",roleId:"data-analyst",title:"Build a decision metric brief",description:"Define a question, produce a reproducible query, and explain the limits of its result.",skillId:"data-analytics",estimatedHours:5,deliverables:["Question and metric definition","Reproducible query or notebook","Limitations note"] }),
  seed({ id:"analyst-dashboard",roleId:"data-analyst",title:"Create an accessible KPI dashboard",description:"Design a dashboard that exposes definitions, filters, and data freshness.",skillId:"business-intelligence",estimatedHours:7,deliverables:["Dashboard prototype","Metric glossary","Keyboard review notes"] }),
  seed({ id:"analyst-data-quality",roleId:"data-analyst",title:"Audit a messy dataset",description:"Document cleaning decisions, missing values, and a repeatable transformation.",skillId:"data-processing",estimatedHours:5,deliverables:["Cleaning script","Data-quality report","Reproducible input sample"] }),
  seed({ id:"scientist-experiment",roleId:"data-scientist",title:"Design a small model experiment",description:"Frame a measurable question, split data safely, and record baseline evidence.",skillId:"data-science",estimatedHours:7,deliverables:["Experiment plan","Baseline notebook","Data-split rationale"] }),
  seed({ id:"scientist-evaluation",roleId:"data-scientist",title:"Evaluate a classifier honestly",description:"Compare metrics and explain errors without overstating performance.",skillId:"model-evaluation",estimatedHours:6,deliverables:["Metric report","Error analysis","Limitations note"] }),
  seed({ id:"scientist-feature-pipeline",roleId:"data-scientist",title:"Prepare a feature pipeline",description:"Create repeatable transformations with checks for leakage and schema drift.",skillId:"data-processing",estimatedHours:6,deliverables:["Transformation pipeline","Validation checks","README"] }),
  seed({ id:"ai-engineer-tool",roleId:"ai-llm-application-engineer",title:"Build a bounded AI helper",description:"Create an AI-assisted workflow with explicit inputs, outputs, and fallbacks.",skillId:"llm-applications",estimatedHours:8,deliverables:["Input/output contract","Fallback behavior","Evaluation cases"] }),
  seed({ id:"ai-engineer-rag",roleId:"ai-llm-application-engineer",title:"Prototype a cited retrieval flow",description:"Retrieve a small approved corpus and show which source supports each response.",skillId:"retrieval-augmented-generation",estimatedHours:9,deliverables:["Indexed sample corpus","Retrieval trace","Unsupported-answer state"] }),
  seed({ id:"ai-engineer-api",roleId:"ai-llm-application-engineer",title:"Expose a safe AI feature API",description:"Validate requests, bound provider calls, and test error responses.",skillId:"ai-engineering",estimatedHours:7,deliverables:["Validated endpoint","Timeout/error policy","Integration tests"] }),
  seed({ id:"devops-pipeline",roleId:"devops-engineer",title:"Create a guarded CI pipeline",description:"Run checks automatically and make failures actionable to contributors.",skillId:"continuous-delivery",estimatedHours:6,deliverables:["Workflow file","Failure documentation","Build artifact policy"] }),
  seed({ id:"devops-infra",roleId:"devops-engineer",title:"Model a small service environment",description:"Describe reproducible infrastructure variables and safe review steps.",skillId:"infrastructure-automation",estimatedHours:8,deliverables:["Infrastructure definition","Variable documentation","Plan review evidence"] }),
  seed({ id:"devops-runbook",roleId:"devops-engineer",title:"Write an incident-ready runbook",description:"Document health checks, escalation, rollback, and communication decisions.",skillId:"devops",estimatedHours:5,deliverables:["Runbook","Health checklist","Rollback exercise"] }),
  seed({ id:"qa-risk-matrix",roleId:"qa-automation-engineer",title:"Map workflow risks to tests",description:"Prioritize quality checks by user impact and failure likelihood.",skillId:"testing",estimatedHours:4,deliverables:["Risk matrix","Test plan","Known-limitations note"] }),
  seed({ id:"qa-browser-flow",roleId:"qa-automation-engineer",title:"Automate a critical browser flow",description:"Cover an accessible user journey with deterministic setup and clear assertions.",skillId:"qa-automation",estimatedHours:7,deliverables:["Browser test","Stable fixtures","Failure screenshot policy"] }),
  seed({ id:"qa-api-contract",roleId:"qa-automation-engineer",title:"Verify an API boundary",description:"Test valid, invalid, and unauthorized requests against a documented contract.",skillId:"rest-api",estimatedHours:5,deliverables:["API tests","Contract notes","Negative cases"] }),
  seed({ id:"security-threat-model",roleId:"cybersecurity-analyst",title:"Threat-model a student workflow",description:"Identify assets, attackers, abuse paths, and prioritized mitigations.",skillId:"cybersecurity",estimatedHours:6,deliverables:["Threat model","Mitigation list","Residual-risk note"] }),
  seed({ id:"security-access-review",roleId:"cybersecurity-analyst",title:"Review access boundaries",description:"Trace owner authorization and prove a cross-account request is denied.",skillId:"application-security",estimatedHours:7,deliverables:["Authorization map","Two-user test","Fix proposal"] }),
  seed({ id:"security-network-notes",roleId:"cybersecurity-analyst",title:"Document a network exposure review",description:"Describe reachable services, expected protocols, and least-access assumptions.",skillId:"computer-networks",estimatedHours:4,deliverables:["Exposure diagram","Protocol inventory","Review checklist"] }),
  seed({ id:"android-task-flow",roleId:"android-developer",title:"Build a lifecycle-aware task flow",description:"Create an Android screen that handles loading, errors, and state restoration.",skillId:"android-development",estimatedHours:8,deliverables:["Android screen","State-handling notes","Accessibility check"] }),
  seed({ id:"android-api-client",roleId:"android-developer",title:"Connect a mobile API client",description:"Call a documented API with safe loading, retry, and failure states.",skillId:"rest-api",estimatedHours:6,deliverables:["Client layer","Error UI","Request tests"] }),
  seed({ id:"android-test",roleId:"android-developer",title:"Test an Android interaction",description:"Automate one meaningful mobile workflow and its error state.",skillId:"testing",estimatedHours:5,deliverables:["Interaction test","Test data plan","Observed limitations"] }),
  seed({ id:"cloud-architecture",roleId:"cloud-engineer",title:"Diagram a resilient cloud service",description:"Choose managed boundaries and explain availability, cost, and recovery trade-offs.",skillId:"cloud-infrastructure",estimatedHours:6,deliverables:["Architecture diagram","Trade-off record","Recovery plan"] }),
  seed({ id:"cloud-iac",roleId:"cloud-engineer",title:"Review infrastructure as code",description:"Create a small reviewed plan with variables and no embedded secrets.",skillId:"infrastructure-automation",estimatedHours:7,deliverables:["Infrastructure code","Plan output","Secret-handling note"] }),
  seed({ id:"cloud-release",roleId:"cloud-engineer",title:"Automate a safe service release",description:"Connect tests, deployment checks, and a rollback condition.",skillId:"continuous-delivery",estimatedHours:6,deliverables:["Release workflow","Verification step","Rollback condition"] }),
  seed({ id:"data-engineer-pipeline",roleId:"data-engineer",title:"Build a scheduled data pipeline",description:"Move a small dataset through explicit stages with observable failures.",skillId:"data-engineering",estimatedHours:8,deliverables:["Pipeline DAG","Schema contract","Failure alert notes"] }),
  seed({ id:"data-engineer-model",roleId:"data-engineer",title:"Model an analytics dataset",description:"Design tables around a stated grain and documented consumer question.",skillId:"database-systems",estimatedHours:6,deliverables:["Schema diagram","DDL","Grain explanation"] }),
  seed({ id:"data-engineer-tests",roleId:"data-engineer",title:"Add pipeline quality checks",description:"Detect missing, duplicated, or unexpected records before publishing outputs.",skillId:"testing",estimatedHours:5,deliverables:["Quality checks","Sample failures","Runbook"] }),
  seed({ id:"designer-research",roleId:"ui-ux-designer",title:"Plan a focused usability study",description:"Write research questions, recruit criteria, and an ethical interview guide.",skillId:"ux-research",estimatedHours:5,deliverables:["Research plan","Interview guide","Consent note"] }),
  seed({ id:"designer-prototype",roleId:"ui-ux-designer",title:"Prototype an accessible learning flow",description:"Turn a user goal into a mobile and desktop interaction with clear states.",skillId:"ui-ux-design",estimatedHours:7,deliverables:["Prototype","State inventory","Accessibility review"] }),
  seed({ id:"designer-handoff",roleId:"ui-ux-designer",title:"Prepare an implementation handoff",description:"Communicate behavior, content hierarchy, and responsive constraints to engineering.",skillId:"accessibility",estimatedHours:5,deliverables:["Annotated screens","Interaction notes","Responsive acceptance checks"] })
];
