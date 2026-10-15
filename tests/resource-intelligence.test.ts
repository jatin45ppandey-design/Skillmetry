import { describe, expect, it } from "vitest";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { skills } from "@skillmetry/shared/data/catalog";
import {
  filterLearningResources,
  getPersonalizedResources,
  getResourcesForPhaseARecommendation,
  getResourcesForSkill,
  getResourcesForTool,
  isSafeResourceUrl
} from "@skillmetry/shared/lib/resource-intelligence";
import type { LearningPreferences } from "@skillmetry/shared/types/domain";

const noGoals: LearningPreferences = { primaryCareerId: null, selectedSkillIds: [], selectedToolIds: [] };

describe("learning resource catalog", () => {
  it("covers all canonical skills plus Git, GitHub, and Postman with stable unique HTTPS resources", () => {
    expect(learningResources).toHaveLength(61);
    expect(learningResources.filter(resource => resource.type === "roadmap")).toHaveLength(10);
    expect(learningResources.filter(resource => resource.discoverySource?.label === "awesome-roadmaps")).toHaveLength(11);
    expect(new Set(learningResources.map(resource => resource.id)).size).toBe(learningResources.length);
    expect(new Set(learningResources.map(resource => resource.url)).size).toBe(learningResources.length);
    for (const skill of skills) expect(getResourcesForSkill(skill.id).length).toBeGreaterThanOrEqual(2);
    for (const tool of ["git", "github", "postman"] as const) expect(getResourcesForTool(tool).length).toBeGreaterThanOrEqual(2);
    expect(getResourcesForTool("docker")).toEqual(getResourcesForSkill("docker"));
    expect(learningResources.every(resource => isSafeResourceUrl(resource.url))).toBe(true);
  });

  it("filters by target, resource metadata, and rejects unapproved external URLs", () => {
    const pythonBeginners = filterLearningResources({ target: { kind: "skill", skillId: "python" }, difficulties: ["beginner"] });
    expect(pythonBeginners.length).toBeGreaterThanOrEqual(2);
    expect(pythonBeginners.every(resource => (resource.target.kind === "skill" && resource.target.skillId === "python") || resource.relatedSkillIds?.includes("python"))).toBe(true);
    expect(filterLearningResources({ types: ["practice"], costs: ["free"] }).every(resource => resource.type === "practice" && resource.cost === "free")).toBe(true);
    expect(isSafeResourceUrl("http://docs.python.org/3/tutorial/introduction.html")).toBe(false);
    expect(isSafeResourceUrl("https://example.com/learning")).toBe(false);
    expect(isSafeResourceUrl("https://github.com/unrelated/non-curated")).toBe(false);
    expect(filterLearningResources({ types: ["roadmap"], careerId: "frontend-developer" }).length).toBeGreaterThanOrEqual(2);
    // Older documentation has no explicit careerIds; filtering must not hide it.
    const frontendDocs = filterLearningResources({ careerId: "frontend-developer", types: ["documentation"] });
    expect(frontendDocs.some(item => item.target.kind === "skill" && item.target.skillId === "html")).toBe(true);
    const mlDocs = filterLearningResources({ careerId: "ml-engineer", types: ["documentation"] });
    expect(mlDocs.some(item => item.target.kind === "skill" && item.target.skillId === "python")).toBe(true);
    // Curator-provided career assignments remain authoritative for imported paths.
    expect(filterLearningResources({ careerId: "frontend-developer", types: ["roadmap"] }).some(item => item.id === "roadmap-mathematics-talal")).toBe(false);
    expect(getResourcesForSkill("react").some(resource => resource.type === "roadmap")).toBe(true);
    expect(getResourcesForTool("git").some(resource => resource.type === "roadmap")).toBe(true);
    expect(filterLearningResources({ target: { kind: "skill", skillId: "react" }, types: ["roadmap"] }).length).toBeGreaterThanOrEqual(1);
  });
});

describe("resource intelligence", () => {
  it("returns no recommendations when there are no selected learning goals", () => {
    expect(getPersonalizedResources({ learning: noGoals, trustedScores: {} })).toEqual([]);
  });

  it("uses trusted score bands without treating missing assessment data as zero", () => {
    const notAssessed = getPersonalizedResources({ learning: { ...noGoals, selectedSkillIds: ["python"] }, trustedScores: {}, maxResults: 2 });
    const needsImprovement = getPersonalizedResources({ learning: { ...noGoals, selectedSkillIds: ["python"] }, trustedScores: { python: 40 }, maxResults: 2 });
    const developing = getPersonalizedResources({ learning: { ...noGoals, selectedSkillIds: ["python"] }, trustedScores: { python: 60 }, maxResults: 2 });
    const strong = getPersonalizedResources({ learning: { ...noGoals, selectedSkillIds: ["python"] }, trustedScores: { python: 85 }, maxResults: 2 });
    expect(notAssessed[0]?.reason).toContain("no trusted quiz result");
    expect(needsImprovement[0]?.reason).toContain("40%");
    expect(developing[0]?.reason).toContain("60%");
    expect(strong[0]?.reason).toContain("without claiming mastery");
    expect(notAssessed.every(result => result.resource.difficulty === "beginner")).toBe(true);
    expect(developing[0]?.resource.difficulty).toBe("intermediate");
    expect(strong[0]?.resource.difficulty).toBe("intermediate");
  });

  it("keeps standalone tools scoreless and reuses canonical Docker resources", () => {
    const git = getPersonalizedResources({ learning: { ...noGoals, selectedToolIds: ["git"] }, trustedScores: {}, maxResults: 2 });
    expect(git).toHaveLength(2);
    expect(git.every(result => result.relatedToolId === "git" && result.assessment.available === false && result.reason.includes("no score is inferred"))).toBe(true);
    const docker = getPersonalizedResources({ learning: { ...noGoals, selectedToolIds: ["docker"] }, trustedScores: {}, maxResults: 2 });
    expect(docker.every(result => result.relatedSkillId === "docker")).toBe(true);
  });

  it("deduplicates combined goals and respects Phase A priority deterministically", () => {
    const learning: LearningPreferences = { primaryCareerId: "backend-developer", selectedSkillIds: ["javascript"], selectedToolIds: ["docker"] };
    const first = getPersonalizedResources({ learning, trustedScores: { javascript: 40 }, maxResults: 6 });
    const second = getPersonalizedResources({ learning, trustedScores: { javascript: 40 }, maxResults: 6 });
    expect(first).toEqual(second);
    expect(new Set(first.map(result => result.resource.id)).size).toBe(first.length);
    expect(first.some(result => result.relatedSkillId === "javascript")).toBe(true);
    expect(getResourcesForPhaseARecommendation({ id: "skill:python", kind: "skill", skillId: "python", slot: "now", action: "take-assessment", priority: 1, explanation: "", evidence: [], assessment: { available: true, assessmentId: "python-foundations", href: "/assessments" } })).toEqual(getResourcesForSkill("python"));
    const frontend = getPersonalizedResources({ learning: { ...noGoals, primaryCareerId: "frontend-developer" }, trustedScores: { javascript: 40 }, maxResults: 12 });
    expect(frontend.some(result => result.resource.type === "roadmap" && result.resource.careerIds?.includes("frontend-developer"))).toBe(true);
  });
});
