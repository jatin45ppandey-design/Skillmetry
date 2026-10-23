import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, missions, skills } from "@skillmetry/shared/data/catalog";
import { curriculumCatalog, getCurriculumForCareer } from "@skillmetry/shared/data/curriculum";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { phase5Careers, phase5Skills } from "@skillmetry/shared/data/phase5-expansion";
import { getCurriculumCoverageReport } from "@skillmetry/shared/lib/curriculum-coverage";
import { buildRecommendations } from "@skillmetry/shared/lib/recommendations";

const source = (path:string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("Phase 5 career and curriculum expansion", () => {
  it("keeps all fourteen weighted career pathways and three catalog projects per new career", () => {
    expect(careers).toHaveLength(14);
    for (const career of careers) {
      expect(career.skills.reduce((total, item) => total + item.weight, 0)).toBe(100);
      expect(new Set(career.skills.map(item => item.skillId)).size).toBe(career.skills.length);
    }
    for (const career of phase5Careers) {
      expect(getCurriculumForCareer(career.id)?.topics.length).toBeGreaterThanOrEqual(career.skills.length * 3);
      expect(missions.filter(mission => mission.roleId === career.id)).toHaveLength(3);
    }
  });

  it("publishes meaningful curriculum coverage for every new canonical skill without manufacturing assessment availability", () => {
    expect(skills).toHaveLength(42);
    for (const skill of phase5Skills) {
      const curriculum = curriculumCatalog.skills.find(entry => entry.skillId === skill.id);
      expect(curriculum?.topicIds).toHaveLength(3);
      expect(curriculumCatalog.lessons.filter(lesson => lesson.id.startsWith(`${skill.id}:lesson:`))).toHaveLength(3);
      expect(curriculumCatalog.topics.filter(topic => topic.skillIds.includes(skill.id)).every(topic => topic.primaryResourceIds.length >= 1)).toBe(true);
      expect(assessmentCatalog.some(assessment => assessment.skillId === skill.id)).toBe(false);
    }
  });

  it("retains deduplicated reviewed resources and routes new career recommendations through learning, not scores", () => {
    expect(new Set(learningResources.map(resource => resource.id)).size).toBe(learningResources.length);
    expect(new Set(learningResources.map(resource => resource.url)).size).toBe(learningResources.length);
    const plan = buildRecommendations({ learning: { primaryCareerId: "data-engineer", selectedSkillIds: [], selectedToolIds: [] }, trustedScores: {} });
    expect(plan.now?.skillId).toBeDefined();
    expect(plan.now?.evidence.some(evidence => evidence.type === "not-assessed")).toBe(true);
    const coverage = getCurriculumCoverageReport();
    expect(coverage.unresolved).toEqual([]);
    expect(coverage.totals.resourceDuplicateIds).toBe(0);
    expect(coverage.totals.resourceDuplicateUrls).toBe(0);
    expect(coverage.totals.careersWithoutVideo).toBe(0);
    expect(coverage.skills.filter(skill => !skill.assessmentAvailable)).toHaveLength(38);
  });

  it("extends the existing Admin Studio inventory rather than creating an unguarded editor", () => {
    const inventory = source("frontend/src/components/admin-content-inventory.tsx");
    const coverage = source("frontend/src/components/admin-curriculum-coverage.tsx");
    expect(inventory).toContain("AdminCurriculumCoverage");
    expect(coverage).toContain("getCurriculumCoverageReport");
    expect(coverage).toContain("editorially unverified");
  });

  it("does not present zero-gain Phase 5 projects as a proficiency simulation", () => {
    const simulator = source("frontend/src/app/(workspace)/simulator/page.tsx");
    expect(simulator).toContain("scoreBearingMissions");
    expect(simulator).toContain("Plan projects without invented score changes");
    expect(simulator).not.toContain("roleMissions.map(mission");
  });
});
