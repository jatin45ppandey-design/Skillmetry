"use client";
import {useState} from "react";
import {BookOpen,Route} from "lucide-react";
import {AdminGuideEditor} from "@/components/admin-guide-editor";
import {AdminRoadmapEditor} from "@/components/admin-roadmap-editor";
type Role="owner"|"editor"|"reviewer";
export function AdminStudioWorkspace({role}:{role:Role}){
 const [mode,setMode]=useState<"guides"|"roadmaps">("guides");
 return <section className="admin-workspace" aria-label="Manage learning content">
   <nav className="admin-manager-tabs" aria-label="Management area">
     <button type="button" aria-pressed={mode==="guides"} onClick={()=>setMode("guides")}>
       <BookOpen size={18}/> Docs, Lectures & Notes</button>
     <button type="button" aria-pressed={mode==="roadmaps"} onClick={()=>setMode("roadmaps")}>
       <Route size={18}/> Career Roadmaps</button>
   </nav>
   {mode==="guides"?<AdminGuideEditor role={role}/>:<AdminRoadmapEditor role={role}/>}
 </section>;
}
