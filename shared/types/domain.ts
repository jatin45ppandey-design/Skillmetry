export type CareerId = "ml-engineer" | "frontend-developer" | "backend-developer" | "full-stack-developer";
export type SkillId = string;
export type ToolId = "git" | "github" | "docker" | "postman";
export type Skill = {
  id: SkillId;
  label: string;
  group: "Foundation" | "Core" | "Applied";
  description: string;
  prerequisites: SkillId[];
};
export type WeightedSkill = { skillId: SkillId; weight: number };
export type Career = { id: CareerId; title: string; subtitle: string; icon: string; skills: WeightedSkill[] };
export type SkillMap = Record<SkillId, number>;
export type Mission = {
  id: string;
  roleId: CareerId;
  title: string;
  description: string;
  skillId: SkillId;
  estimatedHours: number;
  simulatedGain: number;
  deliverables: string[];
};
export type DiagnosticAssessmentId = "python-foundations" | "sql-foundations" | "javascript-foundations" | "html-foundations";
export type AssessmentId = DiagnosticAssessmentId | "css-foundations" | "typescript-foundations" | "react-foundations" | "node-foundations" | "rest-api-foundations";
export type PublicQuizQuestion = { id: string; prompt: string; choices: readonly string[] };
export type AssessmentSummary = {
  id: AssessmentId;
  skillId: SkillId;
  title: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
};
export type AssessmentSession = {
  sessionId: string;
  assessmentId: AssessmentId;
  assessmentVersion: string;
  title: string;
  skillId: SkillId;
  expiresAt: string;
  questions: PublicQuizQuestion[];
};
export type AssessmentAttempt = {
  id: string;
  assessmentId: AssessmentId;
  assessmentVersion: string;
  skillId: SkillId;
  score: number;
  passed: boolean;
  passThreshold: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
};

/**
 * Learner-selected context, deliberately separate from trusted assessment
 * outcomes. It is persisted as profile preference data and is ready for A2
 * selection surfaces without changing the current workspace flow.
 */
export type LearningPreferences = {
  primaryCareerId: CareerId | null;
  selectedSkillIds: SkillId[];
  selectedToolIds: ToolId[];
};

export type RecommendationSlot = "now" | "next" | "later";
export type RecommendationAction = "take-assessment" | "strengthen-skill" | "review-prerequisite" | "reassess" | "explore-skill" | "explore-tool";
export type RecommendationEvidence =
  | { type: "career-goal"; careerId: CareerId; weight: number }
  | { type: "selected-skill" }
  | { type: "selected-tool"; toolId: ToolId }
  | { type: "prerequisite"; forSkillId: SkillId }
  | { type: "trusted-assessment"; score: number }
  | { type: "not-assessed" };
export type AssessmentRoute = { available: true; assessmentId: AssessmentId; href: "/assessments" } | { available: false };
export type LearningRecommendation = {
  id: string;
  slot: RecommendationSlot;
  kind: "skill" | "tool";
  skillId?: SkillId;
  toolId?: ToolId;
  action: RecommendationAction;
  priority: number;
  explanation: string;
  evidence: RecommendationEvidence[];
  assessment: AssessmentRoute;
};
export type LearningRecommendationPlan = {
  now: LearningRecommendation | null;
  next: LearningRecommendation | null;
  later: LearningRecommendation | null;
  recommendations: LearningRecommendation[];
};

export type ResourceType = "documentation" | "tutorial" | "video" | "course" | "practice" | "roadmap";
export type ResourceDifficulty = "beginner" | "intermediate" | "advanced";
export type ResourceCost = "free" | "freemium" | "paid";
export type ResourceVerificationStatus = "verified" | "unverified" | "unavailable";
export type LearningResourceTarget =
  | { kind: "skill"; skillId: SkillId }
  | { kind: "tool"; toolId: Exclude<ToolId, "docker"> };
export type LearningResource = {
  id: string;
  target: LearningResourceTarget;
  topic: string;
  subtopics?: readonly string[];
  title: string;
  description: string;
  provider: string;
  url: string;
  /** Additional relevance tags: the original primary target remains stable. */
  relatedSkillIds?: readonly SkillId[];
  relatedToolIds?: readonly ToolId[];
  careerIds?: readonly CareerId[];
  /** Original creator is provider; discovery attribution is not ownership. */
  discoverySource?: { label: string; url: string };
  type: ResourceType;
  difficulty: ResourceDifficulty;
  cost: ResourceCost;
  language?: string;
  estimatedMinutes?: number;
  lastVerified: string;
  verificationStatus: ResourceVerificationStatus;
};
export type ResourceFilter = {
  target?: LearningResourceTarget;
  careerId?: CareerId;
  difficulties?: readonly ResourceDifficulty[];
  types?: readonly ResourceType[];
  costs?: readonly ResourceCost[];
};
export type ResourceAvailability = { available: true } | { available: false; fallbackMessage: string };
export type ResourceRecommendation = {
  resource: LearningResource;
  relatedSkillId?: SkillId;
  relatedToolId?: Exclude<ToolId, "docker">;
  assessment: AssessmentRoute;
  availability: ResourceAvailability;
  reason: string;
};
