import type { Career, Mission, Skill } from "@skillmetry/shared/types/domain";

export const skills: Skill[] = [
  { id: "python", label: "Python", group: "Foundation", description: "Write maintainable Python programs.", prerequisites: [] },
  { id: "sql", label: "SQL", group: "Foundation", description: "Query, join and aggregate relational data.", prerequisites: [] },
  { id: "math", label: "Math & Statistics", group: "Foundation", description: "Statistics, algebra and basic probability.", prerequisites: [] },
  { id: "data-processing", label: "Data Processing", group: "Core", description: "Clean and transform structured datasets.", prerequisites: ["python"] },
  { id: "ml-foundations", label: "ML Fundamentals", group: "Core", description: "Train supervised machine-learning models.", prerequisites: ["python", "math", "data-processing"] },
  { id: "model-evaluation", label: "Model Evaluation", group: "Applied", description: "Measure model quality and detect leakage.", prerequisites: ["ml-foundations"] },
  { id: "rest-api", label: "REST APIs", group: "Applied", description: "Create and consume API endpoints.", prerequisites: [] },
  { id: "docker", label: "Docker", group: "Applied", description: "Containerize services reproducibly.", prerequisites: [] },
  { id: "deployment", label: "Deployment", group: "Applied", description: "Deploy and monitor an application.", prerequisites: ["rest-api", "docker"] },
  { id: "html", label: "HTML", group: "Foundation", description: "Build semantic page structure.", prerequisites: [] },
  { id: "css", label: "CSS", group: "Foundation", description: "Implement responsive visual layouts.", prerequisites: ["html"] },
  { id: "javascript", label: "JavaScript", group: "Foundation", description: "Use modern language features and async programming.", prerequisites: [] },
  { id: "typescript", label: "TypeScript", group: "Core", description: "Write strongly typed JavaScript.", prerequisites: ["javascript"] },
  { id: "react", label: "React", group: "Core", description: "Build component-driven interfaces.", prerequisites: ["javascript", "html", "css"] },
  { id: "accessibility", label: "Accessibility", group: "Applied", description: "Build inclusive, keyboard-accessible interfaces.", prerequisites: ["html", "css"] },
  { id: "testing", label: "Testing", group: "Applied", description: "Write reliable unit and integration tests.", prerequisites: [] },
  { id: "node", label: "Node.js", group: "Core", description: "Build and debug Node.js services.", prerequisites: ["javascript"] },
  { id: "authentication", label: "Authentication", group: "Applied", description: "Implement secure sessions and authorization.", prerequisites: ["rest-api"] }
];

// All career weights sum to exactly 100. These are illustrative, curated MVP weights.
export const careers: Career[] = [
  { id: "ml-engineer", title: "ML Engineer", subtitle: "From datasets to deployed intelligence", icon: "brain", skills: [
    { skillId: "python", weight: 15 }, { skillId: "sql", weight: 10 }, { skillId: "math", weight: 10 },
    { skillId: "data-processing", weight: 10 }, { skillId: "ml-foundations", weight: 20 },
    { skillId: "model-evaluation", weight: 10 }, { skillId: "rest-api", weight: 5 },
    { skillId: "docker", weight: 10 }, { skillId: "deployment", weight: 10 }
  ] },
  { id: "frontend-developer", title: "Frontend Developer", subtitle: "Interfaces that feel effortless", icon: "layout", skills: [
    { skillId: "html", weight: 12 }, { skillId: "css", weight: 12 }, { skillId: "javascript", weight: 18 },
    { skillId: "typescript", weight: 12 }, { skillId: "react", weight: 18 },
    { skillId: "accessibility", weight: 10 }, { skillId: "testing", weight: 10 },
    { skillId: "deployment", weight: 8 }
  ] },
  { id: "backend-developer", title: "Backend Developer", subtitle: "APIs, systems and trusted infrastructure", icon: "server", skills: [
    { skillId: "javascript", weight: 10 }, { skillId: "typescript", weight: 10 },
    { skillId: "node", weight: 20 }, { skillId: "rest-api", weight: 15 },
    { skillId: "sql", weight: 15 }, { skillId: "authentication", weight: 10 },
    { skillId: "docker", weight: 10 }, { skillId: "testing", weight: 10 }
  ] },
  { id: "full-stack-developer", title: "Full Stack Developer", subtitle: "Build complete, dependable web applications", icon: "layers", skills: [
    { skillId: "html", weight: 7 }, { skillId: "css", weight: 6 }, { skillId: "javascript", weight: 12 },
    { skillId: "typescript", weight: 10 }, { skillId: "react", weight: 12 }, { skillId: "node", weight: 14 },
    { skillId: "rest-api", weight: 12 }, { skillId: "sql", weight: 10 }, { skillId: "authentication", weight: 6 },
    { skillId: "testing", weight: 5 }, { skillId: "docker", weight: 3 }, { skillId: "deployment", weight: 3 }
  ] }
];

export const missions: Mission[] = [
  { id: "ml-deploy", roleId: "ml-engineer", title: "Deploy an ML inference API", description: "Wrap a trained model in an API and document its deployment.", skillId: "deployment", estimatedHours: 8, simulatedGain: 30, deliverables: ["API endpoint", "README with example requests", "Deployment notes"] },
  { id: "dockerize", roleId: "ml-engineer", title: "Dockerize a Python service", description: "Make your Python app run reproducibly in a container.", skillId: "docker", estimatedHours: 4, simulatedGain: 40, deliverables: ["Dockerfile", "Build/run instructions", "Screenshot or run log"] },
  { id: "sql-analysis", roleId: "ml-engineer", title: "SQL data exploration", description: "Explore a dataset using joins, group-by and windows.", skillId: "sql", estimatedHours: 4, simulatedGain: 25, deliverables: ["SQL query file", "Findings summary"] },
  { id: "react-dashboard", roleId: "frontend-developer", title: "Build an accessible dashboard", description: "Create a keyboard-friendly responsive React dashboard.", skillId: "react", estimatedHours: 7, simulatedGain: 30, deliverables: ["Responsive dashboard", "Accessibility checklist"] },
  { id: "typescript-refactor", roleId: "frontend-developer", title: "Refactor a JavaScript app", description: "Introduce TypeScript types and remove unsafe assumptions.", skillId: "typescript", estimatedHours: 4, simulatedGain: 30, deliverables: ["Typed components", "Typecheck success"] },
  { id: "frontend-component-library", roleId: "frontend-developer", title: "Ship an accessible component library", description: "Design, document and test a small reusable component set across keyboard and responsive states.", skillId: "accessibility", estimatedHours: 9, simulatedGain: 20, deliverables: ["Four reusable components", "Keyboard and screen-reader notes", "Responsive examples", "Automated interaction tests"] },
  { id: "node-api", roleId: "backend-developer", title: "Build a tested Node API", description: "Create routes, validation and an integration test.", skillId: "node", estimatedHours: 6, simulatedGain: 30, deliverables: ["CRUD routes", "Input validation", "Automated tests"] },
  { id: "auth-service", roleId: "backend-developer", title: "Secure an authenticated endpoint", description: "Implement user ownership and access checks.", skillId: "authentication", estimatedHours: 6, simulatedGain: 30, deliverables: ["Protected endpoint", "Authorization tests"] },
  { id: "backend-service-observability", roleId: "backend-developer", title: "Harden an observable API service", description: "Add bounded errors, health reporting and operational signals to a small backend service.", skillId: "testing", estimatedHours: 7, simulatedGain: 20, deliverables: ["Structured error responses", "Health endpoint", "Request correlation logs", "Failure-path integration tests"] },
  { id: "fullstack-task-hub", roleId: "full-stack-developer", title: "Build a full-stack task hub", description: "Ship an end-to-end task manager with persistent data and accessible controls.", skillId: "react", estimatedHours: 8, simulatedGain: 25, deliverables: ["Responsive task interface", "Validated CRUD API", "Persistent task data", "Integration test"] },
  { id: "fullstack-auth-portal", roleId: "full-stack-developer", title: "Implement a private account portal", description: "Build login and owner-scoped profile access with defensive error handling.", skillId: "authentication", estimatedHours: 8, simulatedGain: 25, deliverables: ["Sign-in and sign-out", "Owner access checks", "Network error states", "Authorization tests"] },
  { id: "fullstack-release", roleId: "full-stack-developer", title: "Prepare a safe full-stack release", description: "Configure deployment, health reporting and a reproducible setup guide.", skillId: "deployment", estimatedHours: 6, simulatedGain: 20, deliverables: ["Repeatable production build", "Working deployment URL", "Health endpoint", "Deployment runbook"] }
];

export const skillById = Object.fromEntries(skills.map(s => [s.id, s])) as Record<string, Skill>;
