/**
 * Privacy-preserving, local-only reader of consent-based feedback exports.
 * Usage: node scripts/analyze-usability-feedback.mjs path/to/participant1.json [...]
 * Never sends requests, writes files, prints free-text notes or student identities.
 */
import {readFile, lstat} from "node:fs/promises";
import {pathToFileURL} from "node:url";

const knownTasks=new Set(["onboarding","dashboard","course","practice","reassess","account","admin"]);
const outcomes=new Set(["yes","partly","no"]);
export function summarizeUsability(exports){
 const counts=new Map([...knownTasks].map(id=>[id,{tested:0,yes:0,partly:0,no:0,difficultyTotal:0,difficultyRated:0}]));
 let accepted=0;
 for(const document of exports){
   if(!document||typeof document!=="object"||document.study!=="skillmetry-usability-v1"||!Array.isArray(document.answers))continue;
   accepted++;
   const unique=new Set();
   for(const answer of document.answers){
     if(!answer||!knownTasks.has(answer.taskId)||unique.has(answer.taskId)||!outcomes.has(answer.complete))continue;
     unique.add(answer.taskId);
     const row=counts.get(answer.taskId);row.tested++;row[answer.complete]++;
     if(Number.isInteger(answer.difficulty)&&answer.difficulty>=1&&answer.difficulty<=5){
       row.difficultyTotal+=answer.difficulty;row.difficultyRated++;
     }
   }
 }
 return {exportsAnalyzed:accepted,uniqueParticipantsNotVerifiable:true,notStatisticallyRepresentative:accepted<10,
  summary:[...counts].map(([task,row])=>({task,tested:row.tested,completed:row.yes,partly:row.partly,failed:row.no,
    completionRate:row.tested?Math.round(100*row.yes/row.tested):null,
    meanDifficulty:row.difficultyRated?Math.round(row.difficultyTotal/row.difficultyRated*10)/10:null
  }))};
}
export async function analyzeFiles(paths){
 const files=[];
 for(const p of paths){
   const stat=await lstat(p);
   if(!stat.isFile()||stat.isSymbolicLink()||stat.size>131072)throw new Error("Feedback input must be a non-symlink JSON file of at most 128 KiB.");
   const raw=await readFile(p,"utf8");
   const parsed=JSON.parse(raw);
   files.push(parsed);
 }
 return summarizeUsability(files);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const paths=process.argv.slice(2);
 if(!paths.length){console.error("Usage: node scripts/analyze-usability-feedback.mjs <consented-export.json> [...files]");process.exitCode=2;}
 else{
   try{
     const result=await analyzeFiles(paths);
     if(result.exportsAnalyzed<5)console.warn("Preliminary observations only: fewer than five supplied consented feedback exports.");
     console.log(JSON.stringify(result,null,2));
   }catch{console.error("Unable to analyze the provided local exports. Check their JSON format and file size.");process.exitCode=1;}
 }
}
