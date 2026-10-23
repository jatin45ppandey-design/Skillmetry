import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {careers,missions} from "@skillmetry/shared/data/catalog";
import {missionSpecificationById} from "@skillmetry/shared/data/mission-specs";

describe("Phase 3 project specifications",()=>{
  it("provides beginner, intermediate and advanced projects for every career",()=>{
    for(const career of careers){
      const related=missions.filter(item=>item.roleId===career.id);
      expect(related).toHaveLength(3);
      expect(new Set(related.map(item=>missionSpecificationById[item.id].difficulty))).toEqual(new Set(["beginner","intermediate","advanced"]));
      for(const mission of related){
        const spec=missionSpecificationById[mission.id];
        expect(spec.objectives.length).toBeGreaterThanOrEqual(2);
        expect(spec.rubric).toHaveLength(3);
        expect(spec.lessonHref).toMatch(/^\/learn\//);
        expect(spec.practiceHref).toMatch(/^\/practice\?topic=/);
        expect(spec.referenceResourceIds.length).toBeGreaterThan(0);
      }
    }
  });
  it("adds only idempotent catalog seeds and retains owner-scoped mission RLS",()=>{
    const seed=readFileSync("database/supabase/migrations/20261023070032_phase3_project_catalog.sql","utf8");
    const workflows=readFileSync("database/supabase/migrations/202610160004_learning_workflows.sql","utf8");
    for(const id of ["frontend-component-library","backend-service-observability"]){
      expect(seed).toContain(`'${id}'`);expect(missions.some(item=>item.id===id)).toBe(true);
    }
    expect(seed).toContain("on conflict (id) do nothing");
    expect(seed).not.toContain("drop table");
    expect(workflows).toContain('create policy "Learners read their mission evidence"');
    expect(workflows).toContain("unique(user_id,mission_id)");
    expect(workflows).toContain("mission_id text not null references public.missions(id)");
  });
});
