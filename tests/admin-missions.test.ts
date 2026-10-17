import {describe,it,expect} from "vitest";
import {careers,missions} from "@skillmetry/shared/data/catalog";
import {
  adminMissionPayloadSchema,
  adminMissionIdSchema,
  saveAdminMissionSchema,
  startingAdminMission,
  toPublishedMission
} from "@skillmetry/shared/lib/admin-missions";

describe("Admin Studio mission contract",()=>{
  const draft=startingAdminMission("Frontend Developer");
  const save=(overrides:Record<string,unknown>={})=>({
    id:"cms-responsive-app",
    careerId:"frontend-developer",
    skillId:"react",
    expectedRevision:0,
    publish:false,
    draft,
    ...overrides
  });
  it("provides a valid draft for each career",()=>{
    for(const career of careers){
      expect(saveAdminMissionSchema.safeParse(save({
        id:"cms-"+career.id,
        careerId:career.id,
        skillId:career.skills[0].skillId,
        draft:startingAdminMission(career.title)
      })).success,career.id).toBe(true);
    }
  });
  it("keeps the existing curated mission namespace immutable",()=>{
    for(const mission of missions){
      expect(adminMissionIdSchema.safeParse(mission.id).success).toBe(false);
      expect(saveAdminMissionSchema.safeParse(save({id:mission.id})).success).toBe(false);
    }
    expect(adminMissionIdSchema.safeParse("cms-react-workshop").success).toBe(true);
    expect(adminMissionIdSchema.safeParse("../a").success).toBe(false);
  });
  it("rejects career/skill mismatches and unrecognized curriculum IDs",()=>{
    expect(saveAdminMissionSchema.safeParse(save({skillId:"python"})).success).toBe(false);
    expect(saveAdminMissionSchema.safeParse(save({careerId:"unknown-career"})).success).toBe(false);
    expect(saveAdminMissionSchema.safeParse(save({skillId:"unknown"})).success).toBe(false);
  });
  it("rejects extra scoring attributes, empty checklist and duplicate deliverables",()=>{
    expect(adminMissionPayloadSchema.safeParse({...draft,simulatedGain:99}).success).toBe(false);
    expect(adminMissionPayloadSchema.safeParse({...draft,deliverables:[]}).success).toBe(false);
    expect(adminMissionPayloadSchema.safeParse({...draft,deliverables:["  A complete README ","a complete readme"]}).success).toBe(false);
    expect(saveAdminMissionSchema.safeParse(save({score:100})).success).toBe(false);
  });
  it("cannot expose unpublished data as a student mission",()=>{
    expect(toPublishedMission(save())).toBeNull();
    expect(toPublishedMission(save({publish:true}))).toMatchObject({
      id:"cms-responsive-app",roleId:"frontend-developer",
      skillId:"react",title:draft.title,deliverables:draft.deliverables
    });
    expect(toPublishedMission(save({publish:true,skillId:"python"}))).toBeNull();
  });
});
