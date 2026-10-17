"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {ArrowRight, BookOpen, BookOpenCheck, FileText, PlayCircle, Target} from "lucide-react";

/** Task-first controls live above the fold on every student workspace page.
 * Secondary routes stay available from the original main navigation.
 */
const sections:Record<string,{question:string;hint:string;actions:{href:string;label:string;icon:"book"|"video"|"notes"|"quiz"|"practice"}[]}>={
 "/dashboard":{question:"What can I learn today?",hint:"Start with one useful action.",actions:[{href:"/resources",label:"Start learning",icon:"book"},{href:"/planner",label:"This week",icon:"notes"}]},
 "/careers":{question:"Where do I want to go?",hint:"Compare paths, then choose one to explore.",actions:[{href:"/roadmap",label:"My pathway",icon:"book"},{href:"/resources",label:"Learning desk",icon:"video"}]},
 "/roadmap":{question:"Which skill comes next?",hint:"Open a skill to find its prerequisites, learning material and assessment.",actions:[{href:"/resources",label:"Learn a skill",icon:"book"},{href:"/lab",label:"Practice",icon:"practice"}]},
 "/assessments":{question:"What do I already know?",hint:"Take a supported quiz and use real evidence to choose what to learn.",actions:[{href:"/resources",label:"Study before quiz",icon:"book"},{href:"/twin",label:"My progress",icon:"notes"}]},
 "/twin":{question:"How far have I come?",hint:"See measured quizzes separately from learning activity.",actions:[{href:"/resources",label:"Improve a skill",icon:"video"},{href:"/assessments",label:"Take a quiz",icon:"quiz"}]},
 "/planner":{question:"What should I do this week?",hint:"Choose a short, manageable task from your plan.",actions:[{href:"/resources",label:"Learn",icon:"book"},{href:"/lab",label:"Practice",icon:"practice"}]},
 "/lab":{question:"Can I apply what I learned?",hint:"Solve one guided challenge, then try the next.",actions:[{href:"/resources",label:"See notes",icon:"notes"},{href:"/missions",label:"Build a project",icon:"practice"}]},
 "/missions":{question:"What could I build?",hint:"Pick one project and break it into deliverables.",actions:[{href:"/resources",label:"Study skills",icon:"book"},{href:"/planner",label:"Plan the work",icon:"notes"}]},
 "/jobs":{question:"What does this role require?",hint:"Compare a job description with your supported learning evidence.",actions:[{href:"/careers",label:"Explore careers",icon:"book"},{href:"/resources",label:"Study a gap",icon:"video"}]},
 "/simulator":{question:"What if I follow this path?",hint:"Compare hypothetical learning scenarios, not real predicted grades.",actions:[{href:"/roadmap",label:"My pathway",icon:"book"},{href:"/missions",label:"Real projects",icon:"practice"}]},
 "/tutor":{question:"What do I need help with?",hint:"Ask about a specific skill; start with curated guidance.",actions:[{href:"/resources",label:"Docs & videos",icon:"video"},{href:"/lab",label:"Try practice",icon:"practice"}]},
 "/passport":{question:"What can I share?",hint:"Review your actual verified learning evidence before sharing.",actions:[{href:"/twin",label:"My progress",icon:"notes"},{href:"/assessments",label:"Improve evidence",icon:"quiz"}]},
 "/settings":{question:"What are my learning goals?",hint:"Choose a career or topic to personalize future steps.",actions:[{href:"/careers",label:"Explore careers",icon:"book"},{href:"/roadmap",label:"View my path",icon:"notes"}]},
 "/practice":{question:"Can I explain this topic?",hint:"Answer and review questions without changing verified quiz scores.",actions:[{href:"/resources",label:"Review notes",icon:"notes"},{href:"/assessments",label:"Assess",icon:"quiz"}]},
 "/courses":{question:"What can I learn lesson by lesson?",hint:"Choose a course and work through one practical topic.",actions:[{href:"/resources",label:"Docs and videos",icon:"book"},{href:"/roadmap",label:"My skill path",icon:"notes"}]},
 "/resources":{question:"How do I want to learn?",hint:"Docs, video lectures and notes for the same topic.",actions:[{href:"/roadmap",label:"My skill path",icon:"book"},{href:"/lab",label:"Try a challenge",icon:"practice"}]}
};
const icons={book:BookOpen,video:PlayCircle,notes:FileText,quiz:BookOpenCheck,practice:Target};
export function LearningQuickBar(){
 const route=usePathname();
 const current=sections[route];
 if(!current)return null;
 return <section className="v3-taskbar" aria-label="Learning shortcuts">
   <div className="v3-taskbar-title"><span className="v3-taskbar-eyebrow">FOCUS</span>
     <strong>{current.question}</strong><span>{current.hint}</span></div>
   <div className="v3-taskbar-actions">{current.actions.map(action=>{const Icon=icons[action.icon];return <Link
     key={action.href} href={action.href}><Icon size={16} aria-hidden="true"/>{action.label}<ArrowRight size={13} aria-hidden="true"/></Link>;})}</div>
 </section>;
}
