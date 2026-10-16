"use client";
import {useEffect,useMemo,useState} from "react";
import {useAuth} from "@/components/auth-provider";
import {missions} from "@skillmetry/shared/data/catalog";
import {resolveLearningActivity,type SkillActivityState,type StudyTask} from "@skillmetry/shared/lib/learning-plan";

type TaskEvidence=Pick<StudyTask,"skillId"|"kind"|"status">;
type Status="unavailable"|"loading"|"ready"|"error";
export function useLearningActivity() {
  const {user}=useAuth();
  const [state,setState]=useState<{owner:string|null;status:Status;tasks:TaskEvidence[];
    practiceSkillIds:string[];submittedMissionSkillIds:string[]}>({
      owner:null,status:"unavailable",tasks:[],practiceSkillIds:[],submittedMissionSkillIds:[]
    });
  const enabled=process.env.NEXT_PUBLIC_LEARNING_WORKFLOWS_ENABLED==="true";
  useEffect(()=>{
    if(!user||!enabled)return;
    const controller=new AbortController();
    setState({owner:user.id,status:"loading",tasks:[],practiceSkillIds:[],submittedMissionSkillIds:[]});
    async function load(){
      try{
        const urls=["/api/learning/plan","/api/learning/lab","/api/learning/missions"];
        const responses=await Promise.all(urls.map(url=>fetch(url,{cache:"no-store",signal:controller.signal})));
        if(responses.some(response=>!response.ok))throw new Error("Activity unavailable");
        const [plan,lab,mission]=await Promise.all(responses.map(response=>response.json())) as [
          {tasks?:TaskEvidence[]},
          {exercises?:{id:string;skillId:string}[];history?:{exercise_id:string}[]},
          {work?:{missionId:string;status:string}[]}
        ];
        if(controller.signal.aborted)return;
        const exerciseIds=new Map((lab.exercises??[]).map(item=>[item.id,item.skillId]));
        const practiceSkills=(lab.history??[]).map(item=>exerciseIds.get(item.exercise_id)).filter((v):v is string=>Boolean(v));
        const submitted=(mission.work??[]).filter(item=>["submitted","self_completed"].includes(item.status))
          .map(item=>missions.find(m=>m.id===item.missionId)?.skillId).filter((v):v is string=>Boolean(v));
        setState({owner:user!.id,status:"ready",tasks:plan.tasks??[],
          practiceSkillIds:[...new Set(practiceSkills)],submittedMissionSkillIds:[...new Set(submitted)]});
      }catch{
        if(!controller.signal.aborted)setState({owner:user!.id,status:"error",tasks:[],
          practiceSkillIds:[],submittedMissionSkillIds:[]});
      }
    }
    void load();
    return ()=>controller.abort();
  },[enabled,user?.id]);
  return useMemo(()=>{
    const valid=Boolean(user&&state.owner===user.id);
    const status=valid?state.status:"unavailable";
    const bySkill:Record<string,SkillActivityState>={};
    if(status==="ready"){
      const activitySkillIds=new Set([...state.tasks.map(t=>t.skillId),...state.practiceSkillIds,...state.submittedMissionSkillIds]);
      for(const skillId of activitySkillIds)bySkill[skillId]=resolveLearningActivity(skillId,state.tasks,
        new Set(state.practiceSkillIds),new Set(state.submittedMissionSkillIds));
    }
    return {status,bySkill};
  },[state,user?.id]);
}
