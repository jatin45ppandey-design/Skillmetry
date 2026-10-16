import { describe, expect, it } from "vitest";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { buildCareerAtlas } from "../frontend/src/lib/career-atlas";

describe("Public career atlas", () => {
  it.each(careers)("includes the entire canonical prerequisite closure of $title", career => {
    const { nodes } = buildCareerAtlas(career);
    const seen = new Set(nodes.map(node => node.id));
    for (const { skillId } of career.skills) expect(seen.has(skillId)).toBe(true);
    for (const node of nodes) {
      expect(skillById[node.id]).toBeDefined();
      for (const prerequisite of skillById[node.id].prerequisites) {
        expect(seen.has(prerequisite)).toBe(true);
      }
    }
    expect(new Set(nodes.map(node => node.id)).size).toBe(nodes.length);
  });

  it.each(careers)("renders only genuine prerequisite edges for $title", career => {
    const { nodes, edges } = buildCareerAtlas(career);
    const shown = new Set(nodes.map(node => node.id));
    const expected = nodes.flatMap(node =>
      skillById[node.id].prerequisites.filter(parent => shown.has(parent))
        .map(parent => parent + "->" + node.id)
    );
    expect(edges.map(edge => edge.from + "->" + edge.to).sort()).toEqual(expected.sort());
  });

  it.each(careers)("keeps $title node positions bounded in the atlas canvas", career => {
    for (const node of buildCareerAtlas(career).nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(100);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(100);
    }
  });

  it("exposes only genuinely available quiz links and no inferred scores", () => {
    const allowedQuizIds = new Map<string, string>(assessmentCatalog.map(quiz => [quiz.skillId, quiz.id]));
    for (const career of careers) {
      for (const node of buildCareerAtlas(career).nodes) {
        expect(node.assessmentId).toBe(allowedQuizIds.get(node.id) ?? null);
        expect(Object.hasOwn(node, "score")).toBe(false);
      }
    }
  });
});
