import {z} from "zod";
import {missions} from "@skillmetry/shared/data/catalog";

export type MissionWorkStatus="in_progress"|"submitted"|"self_completed";
export type MissionWork={
  missionId:string;status:MissionWorkStatus;completedIndices:number[];
  repositoryUrl:string;demoUrl:string;notes:string;
};
export const missionWorkInputSchema=z.object({
  missionId:z.string().min(2).max(80),
  status:z.enum(["in_progress","submitted","self_completed"]),
  completedIndices:z.array(z.number().int().min(0).max(15)).max(16),
  repositoryUrl:z.string().max(500),
  demoUrl:z.string().max(500),
  notes:z.string().max(3000)
}).strict();

function checkedUrl(input:string,kind:"repository"|"demo"):string|null {
  if(!input.trim())return null;
  let url:URL;
  try{url=new URL(input.trim());}catch{throw new Error("Enter a valid HTTPS URL");}
  if(url.protocol!=="https:"||url.username||url.password||!url.hostname)throw new Error("Links must use HTTPS without credentials");
  if(kind==="repository"&&(url.hostname!=="github.com"||url.pathname.split("/").filter(Boolean).length<2))
    throw new Error("Use a GitHub repository link");
  if(kind==="demo"&&(url.hostname==="localhost"||url.hostname.endsWith(".local")||
      /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)))
    throw new Error("Enter a public HTTPS demo link");
  return url.toString();
}

/** Validates learner-submitted work, not professional project verification. */
export function normalizeMissionWork(input:unknown,publishedMission?:{id:string;deliverables:string[]}):MissionWork {
  const parsed=missionWorkInputSchema.safeParse(input);
  if(!parsed.success)throw new Error("Invalid mission work submission");
  const data=parsed.data;
  const mission=missions.find(item=>item.id===data.missionId)??(
    publishedMission?.id===data.missionId?publishedMission:undefined
  );
  if(!mission)throw new Error("Unknown curated mission");
  if(new Set(data.completedIndices).size!==data.completedIndices.length||
     data.completedIndices.some(index=>index>=mission.deliverables.length))
    throw new Error("Checklist contains unknown or repeated deliverables");
  const repository=checkedUrl(data.repositoryUrl,"repository");
  const demo=checkedUrl(data.demoUrl,"demo");
  if(data.status!=="in_progress"&&
    (data.completedIndices.length!==mission.deliverables.length||(!repository&&!demo)))
    throw new Error("Complete the checklist and attach a repository or demo before submitting");
  return {missionId:data.missionId,status:data.status,
    completedIndices:[...data.completedIndices].sort((a,b)=>a-b),
    repositoryUrl:repository??"",demoUrl:demo??"",notes:data.notes.trim()};
}
