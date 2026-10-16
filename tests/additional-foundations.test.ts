import { describe, expect, it } from "vitest";
import { skills } from "@skillmetry/shared/data/catalog";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { foundationDraftSkillIds, draftFoundationQuestions, draftFoundationTopicNames, draftFoundationExplanations } from "@skillmetry/backend/lib/assessments/additional-foundations.server";
describe("Unpublished C02 content review queue", () => {
  it("contains 14 canonical missing skills without advertising them as active", () => {
    const missing=skills.filter(s=>!assessmentCatalog.some(a=>a.skillId===s.id)).map(s=>s.id).sort();
    expect(missing).toHaveLength(14);
    expect(foundationDraftSkillIds.slice().sort()).toEqual(missing);
  });
  it.each(foundationDraftSkillIds)("%s has ten unique valid foundation items and five topics", id=>{
    const q=draftFoundationQuestions(id);
    expect(q).toHaveLength(10);
    expect(draftFoundationTopicNames(id)).toHaveLength(5);
    expect(draftFoundationExplanations(id)).toHaveLength(10);
    expect(new Set(q.map(x=>x.id)).size).toBe(10);
    expect(new Set(q.map(x=>x.prompt)).size).toBe(10);
    for(const item of q){expect(item.choices).toHaveLength(4);
      expect(new Set(item.choices).size).toBe(4);
      expect(item.correctIndex).toBeGreaterThanOrEqual(0);
      expect(item.correctIndex).toBeLessThan(4);
    }
  });
});
