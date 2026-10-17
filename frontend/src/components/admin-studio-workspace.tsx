"use client";
import {useState} from "react";
import {AdminContentInventory,type ContentModule} from "@/components/admin-content-inventory";
import {BookOpen,Route,GraduationCap,ClipboardList,BookOpenCheck,LayoutDashboard} from "lucide-react";
import {AdminCourseEditor} from "@/components/admin-course-editor";
import {AdminMissionEditor} from "@/components/admin-mission-editor";
import {AdminAssessmentEditor} from "@/components/admin-assessment-editor";
import {AdminGuideEditor} from "@/components/admin-guide-editor";
import {AdminRoadmapEditor} from "@/components/admin-roadmap-editor";
type Role="owner"|"editor"|"reviewer";
export function AdminStudioWorkspace({role}:{role:Role}){
 const [mode,setMode]=useState<ContentModule|"inventory">("inventory");
 const [guideDirty,setGuideDirty]=useState(false);
 const [roadmapDirty,setRoadmapDirty]=useState(false);
 const [courseDirty,setCourseDirty]=useState(false);
 const [missionDirty,setMissionDirty]=useState(false);
 const [assessmentDirty,setAssessmentDirty]=useState(false);
 function changeMode(next:typeof mode){
   if(next===mode)return;
   if(mode==="guides"&&guideDirty&&!window.confirm("Discard unsaved guide edits?"))return;
   if(mode==="roadmaps"&&roadmapDirty&&!window.confirm("Discard unsaved roadmap edits?"))return;
   if(mode==="courses"&&courseDirty&&!window.confirm("Discard unsaved course edits?"))return;
   if(mode==="missions"&&missionDirty&&!window.confirm("Discard unsaved mission edits?"))return;
   if(mode==="assessments"&&assessmentDirty&&!window.confirm("Discard unsaved assessment edits?"))return;
   setMode(next);
   setGuideDirty(false);
   setRoadmapDirty(false);
   setCourseDirty(false);
   setMissionDirty(false);
   setAssessmentDirty(false);
 }
 return <section className="admin-workspace" aria-label="Manage learning content">
   <nav className="admin-manager-tabs" aria-label="Management area">
     <button type="button" aria-pressed={mode==="inventory"} onClick={()=>changeMode("inventory")}>
       <LayoutDashboard size={18}/> Content inventory</button>
     <button type="button" aria-pressed={mode==="guides"} onClick={()=>changeMode("guides")}>
       <BookOpen size={18}/> Docs, Lectures & Notes</button>
     <button type="button" aria-pressed={mode==="roadmaps"} onClick={()=>changeMode("roadmaps")}>
       <Route size={18}/> Career Roadmaps</button>
     <button type="button" aria-pressed={mode==="courses"} onClick={()=>changeMode("courses")}>
       <GraduationCap size={18}/> Courses & Lessons</button>
     <button type="button" aria-pressed={mode==="missions"} onClick={()=>changeMode("missions")}>
       <ClipboardList size={18}/> Missions & Projects</button>
     <button type="button" aria-pressed={mode==="assessments"} onClick={()=>changeMode("assessments")}>
       <BookOpenCheck size={18}/> Assessment Bank</button>
   </nav>
   <div className="admin-mobile-module-select">
     <label htmlFor="admin-active-module">Manage content</label>
     <select id="admin-active-module" value={mode} onChange={event=>changeMode(event.target.value as typeof mode)}>
       <option value="inventory">Content inventory</option>
       <option value="guides">Docs, Lectures & Notes</option>
       <option value="roadmaps">Career Roadmaps</option>
       <option value="courses">Courses & Lessons</option>
       <option value="missions">Missions & Projects</option>
       <option value="assessments">Assessment Bank</option>
     </select>
   </div>
   <div className="admin-active-module">
   {mode==="inventory"?<AdminContentInventory onManage={changeMode}/>:
    mode==="guides"?<AdminGuideEditor role={role} onDirtyChange={setGuideDirty}/>:
     mode==="roadmaps"?<AdminRoadmapEditor role={role} onDirtyChange={setRoadmapDirty}/>:
     mode==="courses"?<AdminCourseEditor role={role} onDirtyChange={setCourseDirty}/>:
     mode==="missions"?<AdminMissionEditor role={role} onDirtyChange={setMissionDirty}/>:
     <AdminAssessmentEditor role={role} onDirtyChange={setAssessmentDirty}/>}
   </div>
 </section>;
}
