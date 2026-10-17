"use client";
import {useState} from "react";
import {BookOpen,Route,GraduationCap,ClipboardList} from "lucide-react";
import {AdminCourseEditor} from "@/components/admin-course-editor";
import {AdminMissionEditor} from "@/components/admin-mission-editor";
import {AdminGuideEditor} from "@/components/admin-guide-editor";
import {AdminRoadmapEditor} from "@/components/admin-roadmap-editor";
type Role="owner"|"editor"|"reviewer";
export function AdminStudioWorkspace({role}:{role:Role}){
 const [mode,setMode]=useState<"guides"|"roadmaps"|"courses"|"missions">("guides");
 const [missionDirty,setMissionDirty]=useState(false);
 function changeMode(next:typeof mode){
   if(next===mode)return;
   if(mode==="missions"&&missionDirty&&!window.confirm("Discard unsaved mission edits?"))return;
   setMode(next);
   setMissionDirty(false);
 }
 return <section className="admin-workspace" aria-label="Manage learning content">
   <nav className="admin-manager-tabs" aria-label="Management area">
     <button type="button" aria-pressed={mode==="guides"} onClick={()=>changeMode("guides")}>
       <BookOpen size={18}/> Docs, Lectures & Notes</button>
     <button type="button" aria-pressed={mode==="roadmaps"} onClick={()=>changeMode("roadmaps")}>
       <Route size={18}/> Career Roadmaps</button>
     <button type="button" aria-pressed={mode==="courses"} onClick={()=>changeMode("courses")}>
       <GraduationCap size={18}/> Courses & Lessons</button>
     <button type="button" aria-pressed={mode==="missions"} onClick={()=>changeMode("missions")}>
       <ClipboardList size={18}/> Missions & Projects</button>
   </nav>
   {mode==="guides"?<AdminGuideEditor role={role}/>:
     mode==="roadmaps"?<AdminRoadmapEditor role={role}/>:
     mode==="courses"?<AdminCourseEditor role={role}/>:<AdminMissionEditor role={role} onDirtyChange={setMissionDirty}/>}
 </section>;
}
