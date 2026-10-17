"use client";

import {useState} from "react";
import Link from "next/link";
import {ArrowUpRight,BookOpenCheck,Check,Compass,Fingerprint,GitBranch} from "lucide-react";

const steps=[
 {id:"choose",number:"01",label:"Choose",title:"Start with a direction",subtitle:"A goal is a starting point, not a permanent label.",eyebrow:"EXAMPLE GOAL",value:"Frontend Developer",support:"Explore skills · change direction anytime",next:"/careers",action:"Explore careers",icon:Compass},
 {id:"measure",number:"02",label:"Measure",title:"Check what you know",subtitle:"Short quizzes create evidence; missing scores remain unknown.",eyebrow:"EXAMPLE ASSESSMENT",value:"JavaScript foundations",support:"10 questions · server-graded result",next:"/assessments",action:"View assessments",icon:Fingerprint},
 {id:"grow",number:"03",label:"Grow",title:"Make one useful move",subtitle:"Follow a real prerequisite and a curated learning resource.",eyebrow:"EXAMPLE NEXT STEP",value:"Practice JavaScript",support:"Learn → practice → reassess",next:"/roadmap",action:"Explore the roadmap",icon:GitBranch}
] as const;

export function LandingJourneyPreview(){
 const [active,setActive]=useState(0);
 const step=steps[active];
 const Icon=step.icon;
 return <section className="sx-journey-preview" aria-label="Interactive Skillmetry journey example">
   <div className="sx-journey-preview-top"><span>THE SKILLMETRY JOURNEY</span><span>Interactive example · not a real account</span></div>
   <div className="sx-journey-tabs" role="group" aria-label="Choose a journey step">
     {steps.map((item,index)=>{
       const TabIcon=item.icon;
       return <button className={"sx-journey-tab"+(active===index?" is-active":"")} type="button"
          aria-pressed={active===index} key={item.id} onClick={()=>setActive(index)}>
          <span className="sx-journey-tab-number">{item.number}</span><TabIcon size={17} aria-hidden="true"/><strong>{item.label}</strong>
       </button>;
     })}
   </div>
   <div className="sx-journey-stage" key={step.id}>
     <div className="sx-journey-stage-icon"><Icon size={27} aria-hidden="true"/></div>
     <span className="sx-journey-stage-eyebrow">{step.eyebrow}</span>
     <h2>{step.value}</h2>
     <p className="sx-journey-stage-support"><Check size={16} aria-hidden="true"/>{step.support}</p>
     <div className="sx-journey-stage-divider"/>
     <strong className="sx-journey-stage-title">{step.title}</strong>
     <p>{step.subtitle}</p>
     <Link className="sx-journey-stage-link" href={step.next}>{step.action}<ArrowUpRight size={17} aria-hidden="true"/></Link>
   </div>
   <div className="sx-journey-preview-foot"><BookOpenCheck size={16} aria-hidden="true"/><span>See a real workflow, not an invented skill score.</span><span className="sx-journey-counter">0{active+1} / 03</span></div>
 </section>;
}
