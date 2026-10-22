import type { LearningResource } from "@skillmetry/shared/types/domain";

/**
 * Human-curated additions discovered through liuchong/awesome-roadmaps.
 * The original authors and providers own their learning material. These are
 * external links, not Skillmetry-generated learning paths or quiz evidence.
 * Candidates were selected for existing Skillmetry careers and skill/tool IDs.
 */
const discoveryUrl = "https://github.com/liuchong/awesome-roadmaps";
const verifiedOn = "2026-10-22";

function discovered(entry: Omit<LearningResource, "lastVerified" | "verificationStatus" | "discoverySource"> & { verificationStatus?: LearningResource["verificationStatus"] }): LearningResource {
  const { verificationStatus = "verified", ...resource } = entry;
  return {
    ...resource,
    lastVerified: verifiedOn,
    verificationStatus,
    discoverySource: { label: "awesome-roadmaps", url: discoveryUrl }
  };
}

export const curatedRoadmaps: readonly LearningResource[] = [
  discovered({
    id: "roadmap-frontend-yousha", target: { kind: "skill", skillId: "html" },
    relatedSkillIds: ["css", "javascript", "typescript", "react", "accessibility"],
    careerIds: ["frontend-developer", "full-stack-developer"],
    topic: "Frontend career learning path", subtopics: ["HTML", "CSS", "JavaScript", "frameworks"],
    title: "Frontend Developer Roadmap", description: "A structured frontend path across web foundations, frameworks, and tooling.",
    provider: "Yousha", url: "https://github.com/Yousha/Frontend-Developer-Roadmap",
    type: "roadmap", difficulty: "beginner", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-frontend-learning-kit", target: { kind: "skill", skillId: "javascript" },
    relatedSkillIds: ["html", "css", "typescript", "react", "testing"],
    careerIds: ["frontend-developer", "full-stack-developer"],
    topic: "Frontend study sequence", subtopics: ["web fundamentals", "interview preparation", "React"],
    title: "Frontend Learning Kit — 2024 Roadmap", description: "A visual frontend learning roadmap maintained in a wider collection of frontend study guides.",
    provider: "Sadanand Pai", url: "https://github.com/sadanandpai/frontend-learning-kit/blob/main/public/2024_FE_roadmap.pdf",
    type: "roadmap", difficulty: "intermediate", cost: "free", language: "English",
    verificationStatus: "unverified"
  }),
  discovered({
    id: "roadmap-backend-gfg", target: { kind: "skill", skillId: "node" },
    relatedSkillIds: ["rest-api", "sql", "authentication", "testing"],
    careerIds: ["backend-developer", "full-stack-developer"],
    topic: "Backend career learning path", subtopics: ["server programming", "databases", "APIs"],
    title: "Backend Developer Roadmap", description: "Step-by-step guide to backend languages, services, APIs, databases, and security.",
    provider: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/websites-apps/backend-developer-roadmap/",
    type: "roadmap", difficulty: "beginner", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-fullstack-gfg", target: { kind: "skill", skillId: "typescript" },
    relatedSkillIds: ["html", "css", "javascript", "react", "node", "rest-api", "sql"],
    careerIds: ["full-stack-developer"],
    topic: "Full-stack career learning path", subtopics: ["frontend", "backend", "databases", "projects"],
    title: "Full Stack Developer Roadmap", description: "A stepwise guide connecting frontend, backend, databases, version control and project building.",
    provider: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/blogs/full-stack-developer-roadmap/",
    type: "roadmap", difficulty: "beginner", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-ai-microsoft-beginners", target: { kind: "skill", skillId: "ml-foundations" },
    relatedSkillIds: ["python", "math", "data-processing", "model-evaluation"],
    careerIds: ["ml-engineer"],
    topic: "AI foundations curriculum", subtopics: ["AI fundamentals", "hands-on labs", "model concepts"],
    title: "AI for Beginners — 24 Lessons", description: "Microsoft's structured twelve-week introductory AI curriculum with lessons, quizzes and labs.",
    provider: "Microsoft", url: "https://github.com/microsoft/AI-For-Beginners",
    type: "course", difficulty: "beginner", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-data-scientist-mrmimic", target: { kind: "skill", skillId: "data-processing" },
    relatedSkillIds: ["python", "sql", "math", "ml-foundations", "model-evaluation"],
    careerIds: ["ml-engineer"],
    topic: "Data science learning path", subtopics: ["data analysis", "statistics", "machine learning"],
    title: "Data Scientist Roadmap", description: "A visual data-science learning path with supporting tutorials and notes.",
    provider: "MrMimic", url: "https://github.com/MrMimic/data-scientist-roadmap",
    type: "roadmap", difficulty: "intermediate", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-devops-milanm", target: { kind: "skill", skillId: "docker" },
    relatedSkillIds: ["deployment", "rest-api", "testing"], relatedToolIds: ["git", "github"],
    careerIds: ["backend-developer", "full-stack-developer", "ml-engineer"],
    topic: "DevOps and deployment path", subtopics: ["Git", "containers", "CI/CD", "cloud"],
    title: "DevOps Roadmap 2026", description: "A practical step-by-step path through version control, Docker, automation, infrastructure and deployment.",
    provider: "Milan Milanović", url: "https://github.com/milanm/DevOps-Roadmap",
    type: "roadmap", difficulty: "intermediate", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-mathematics-talal", target: { kind: "skill", skillId: "math" },
    relatedSkillIds: ["ml-foundations"], careerIds: ["ml-engineer"],
    topic: "Mathematics prerequisites", subtopics: ["algebra", "probability", "statistics"],
    title: "Mathematics Roadmap", description: "A broad route through mathematics foundations and progressively advanced subjects.",
    provider: "Talal Alrawajfeh", url: "https://github.com/TalalAlrawajfeh/mathematics-roadmap",
    type: "roadmap", difficulty: "beginner", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-devroadmaps-rudra", target: { kind: "skill", skillId: "javascript" },
    relatedSkillIds: ["react", "node", "rest-api", "sql", "python", "data-processing"],
    careerIds: ["frontend-developer", "backend-developer", "full-stack-developer", "ml-engineer"],
    topic: "Developer career roadmaps", subtopics: ["career tracks", "technology sequencing", "learning resources"],
    title: "DevRoadmaps — Developer Career Paths", description: "A free collection of role-specific interactive developer paths and linked educational resources.",
    provider: "DevRoadmaps contributors", url: "https://github.com/rudra496/devroadmaps",
    type: "roadmap", difficulty: "intermediate", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-data-analyst-mtahiraslan", target: { kind: "skill", skillId: "sql" },
    relatedSkillIds: ["python", "math", "data-processing"], careerIds: ["ml-engineer"],
    topic: "Data analysis foundations", subtopics: ["SQL", "statistics", "data workflows"],
    title: "Data Analyst Roadmap", description: "A foundation path through SQL, statistics, data tools and analytical communication.",
    provider: "M. Tahir Aslan", url: "https://github.com/mtahiraslan/data-analyst-roadmap",
    type: "roadmap", difficulty: "beginner", cost: "free", language: "English"
  }),
  discovered({
    id: "roadmap-sql-gfg", target: { kind: "skill", skillId: "sql" },
    careerIds: ["backend-developer", "full-stack-developer", "ml-engineer"],
    topic: "SQL learning sequence", subtopics: ["queries", "joins", "aggregation"],
    title: "SQL Roadmap — Complete Guide", description: "An ordered SQL study path from basic querying to relational data concepts.",
    provider: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/blogs/sql-roadmap/",
    type: "roadmap", difficulty: "beginner", cost: "free", language: "English"
  })
];
