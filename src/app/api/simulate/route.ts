import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { missions } from "@/data/catalog";
import { applyScenario, readiness, selectCareer } from "@/lib/readiness";
const schema = z.object({
 careerId:z.enum(["ml-engineer","frontend-developer","backend-developer"]),
 skills:z.record(z.number().min(0).max(100)),
 missionIds:z.array(z.string()).max(20)
});
export async function POST(request:NextRequest){
 try {const payload=await request.json();const parsed=schema.safeParse(payload);
  if(!parsed.success)return NextResponse.json({error:"Invalid simulation input"},{status:400});
  const {careerId,skills,missionIds}=parsed.data;const unique=new Set(missionIds);
  const selected=missions.filter(m=>unique.has(m.id)&&m.roleId===careerId);
  if(selected.length!==unique.size)return NextResponse.json({error:"Unknown or incompatible mission IDs"},{status:400});
  const career=selectCareer(careerId);
  return NextResponse.json({baseline:readiness(career,skills),projected:readiness(career,applyScenario(skills,selected)),type:"hypothetical",disclaimer:"Not an employment probability or verified proficiency."});
 } catch {return NextResponse.json({error:"Malformed request"},{status:400});}
}
