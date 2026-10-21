"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, BookOpenCheck, ChevronRight, CircleHelp, Compass, Fingerprint, Map as MapIcon, MousePointer2, Network, Route, ShieldCheck, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { LandingScrollMotion } from "@/components/landing-scroll-motion";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import type { CareerId } from "@skillmetry/shared/types/domain";

type PreviewStep = "goal" | "evidence" | "action";
const previewSteps: {id: PreviewStep; title: string; index: string}[] = [
  {id:"goal",title:"Choose your direction",index:"01"},
  {id:"evidence",title:"Understand what is known",index:"02"},
  {id:"action",title:"Find the next step",index:"03"}
];
const learningSteps = [
  {index:"01",title:"Choose a direction",note:"Explore a curated career and the skills it actually contains."},
  {index:"02",title:"Assess what you know",note:"Available, server-graded quizzes create trusted evidence."},
  {index:"03",title:"Read your evidence",note:"Measured results stay distinct from skills that are still unknown."},
  {index:"04",title:"Learn, then reassess",note:"Follow relevant resources and practice without inventing a score."}
] as const;

export function LandingAtlasV4() {
  const [careerId,setCareerId] = useState<CareerId>("backend-developer");
  const [previewStep,setPreviewStep] = useState<PreviewStep>("goal");
  const [activeSkill,setActiveSkill] = useState("javascript");
  const selectedCareer = careers.find(item=>item.id===careerId) ?? careers[0];
  const activeCareerSkills = selectedCareer.skills.map(item=>skillById[item.skillId]).filter((skill):skill is NonNullable<typeof skill>=>Boolean(skill));
  const featuredSkill = skillById[activeSkill] && selectedCareer.skills.some(item=>item.skillId===activeSkill)
    ? skillById[activeSkill] : activeCareerSkills[0];
  const matchingAssessment = assessmentCatalog.find(item=> selectedCareer.skills.some(skill=>skill.skillId===item.skillId));
  const skillAssessment = assessmentCatalog.find(item=>item.skillId===featuredSkill?.id);
  const assessmentHref = matchingAssessment ? "/assessments?assessment=" + encodeURIComponent(matchingAssessment.id) : "/assessments";
  const chooseHref = "/onboarding?career=" + encodeURIComponent(selectedCareer.id);
  const groups = (["Foundation","Core","Applied"] as const).map(group=>({
    group, items: activeCareerSkills.filter(skill=>skill.group===group)
  }));
  const locationById = new Map<string,{x:number;y:number}>();
  groups.forEach(({group,items})=>{
    const x = group==="Foundation"?170:group==="Core"?500:830;
    items.forEach((skill,index)=>locationById.set(skill.id,{x,y:540*(index+1)/(items.length+1)}));
  });
  const links: {source:string;target:string;d:string}[]=[];
  activeCareerSkills.forEach(skill=>{
    skill.prerequisites.forEach(id=>{
      const from=locationById.get(id),to=locationById.get(skill.id);
      if(!from||!to) return;
      const fx=from.x+110, tx=to.x-110;
      links.push({source:id,target:skill.id,d:from.x===to.x
        ? "M "+(from.x+112)+" "+from.y+" C "+(from.x+175)+" "+from.y+" "+(to.x+175)+" "+to.y+" "+(to.x+112)+" "+to.y
        : "M "+fx+" "+from.y+" C "+(fx+tx)/2+" "+from.y+" "+(fx+tx)/2+" "+to.y+" "+tx+" "+to.y});
    });
  });
  function chooseCareer(id:CareerId) {
    const next=careers.find(item=>item.id===id);
    setCareerId(id);
    if(next) setActiveSkill(next.skills[0]?.skillId ?? "");
  }
  const closeSkillDependencies = featuredSkill?.prerequisites.filter(id=>Boolean(skillById[id])) ?? [];
  return <main className="atlas-site">
    <LandingScrollMotion />
    <a href="#atlas-main" className="atlas-skip">Skip to content</a>
    <header className="atlas-header">
      <div className="atlas-container atlas-header__inner">
        <Brand />
        <nav aria-label="Landing page sections" className="atlas-header__nav">
          <a href="#atlas-journey">How it works</a>
          <a href="#atlas-blueprint">Career atlas</a>
          <a href="#atlas-evidence">Why evidence</a>
        </nav>
        <div className="atlas-header__actions">
          <Link className="atlas-header__signin" href="/auth/sign-in">Sign in</Link>
          <Link className="atlas-cta atlas-cta--small" href="/onboarding">Get started <ArrowUpRight size={16} aria-hidden="true"/></Link>
        </div>
      </div>
    </header>

    <div id="atlas-main">
      <section className="atlas-hero atlas-container" aria-labelledby="atlas-title">
        <div className="atlas-hero__ambient" aria-hidden="true">
          <svg viewBox="0 0 630 520" preserveAspectRatio="xMidYMid meet">
            <path d="M8 412Q160 342 203 225T411 120T612 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 9"/>
            <circle cx="203" cy="225" r="6"/><circle cx="411" cy="120" r="6"/><circle cx="612" cy="48" r="5"/>
            <path d="M26 480L125 418L267 477L385 368L520 414" fill="none" stroke="currentColor" strokeOpacity=".4"/>
          </svg>
        </div>
        <div className="atlas-hero__copy">
          <div className="atlas-eyebrow"><span className="atlas-eyebrow__dot"/> LEARN WITH DIRECTION <span className="atlas-eyebrow__rule"/></div>
          <h1 id="atlas-title">A clearer path<br/>starts with <span>what you know.</span></h1>
          <p>Choose a career, understand real assessment evidence, and discover what to learn next. No imaginary scores. No guessing your progress.</p>
          <div className="atlas-hero__actions">
            <Link className="atlas-cta" href="/onboarding">Build my learning path <ArrowUpRight size={19} aria-hidden="true"/></Link>
            <a className="atlas-quiet-link" href="#atlas-blueprint">Explore the career atlas <ArrowDown size={17} aria-hidden="true"/></a>
          </div>
          <div className="atlas-hero__proof" aria-label="What Skillmetry offers">
            <div><b>{careers.length.toString().padStart(2,"0")}</b><span>Curated career<br/>directions</span></div>
            <span className="atlas-hero__divider" aria-hidden="true"/>
            <div><b>{assessmentCatalog.length.toString().padStart(2,"0")}</b><span>Available quiz<br/>assessments</span></div>
            <span className="atlas-hero__divider" aria-hidden="true"/>
            <div className="atlas-hero__truth"><ShieldCheck size={19} aria-hidden="true"/><span>Evidence before<br/>assumptions</span></div>
          </div>
        </div>
        <div className="atlas-hero__visual">
          <div className="atlas-hero__stamp" aria-hidden="true"><span>SKILL<br/>ATLAS</span><small>VOL. 01</small></div>
          <div className="atlas-artifact">
            <div className="atlas-artifact__topline"><span><span className="atlas-live-dot"/> PRODUCT PREVIEW</span><span>INTERACTIVE · DEMO</span></div>
            <div className="atlas-artifact__title"><span>My learning map</span><Network size={26} aria-hidden="true"/></div>
            <div className="atlas-artifact__tabs" role="tablist" aria-label="Explore the learning journey">
              {previewSteps.map((step,index)=><button key={step.id} id={"atlas-tab-"+step.id} type="button" role="tab" aria-selected={previewStep===step.id} aria-controls="atlas-demo-panel" className={previewStep===step.id?"is-active":""} onClick={()=>setPreviewStep(step.id)}><small>{step.index}</small><span>{index===0?"Goal":index===1?"Evidence":"Next step"}</span></button>)}
            </div>
            <div className="atlas-artifact__stage" key={previewStep} id="atlas-demo-panel" role="tabpanel" aria-labelledby={"atlas-tab-"+previewStep} tabIndex={0}>
              {previewStep==="goal"?<>
                <span className="atlas-stage__label"><Compass size={17} aria-hidden="true"/> YOUR DIRECTION</span>
                <h2>{selectedCareer.title}</h2><p>{selectedCareer.subtitle}</p>
                <div className="atlas-stage__skillchips">{activeCareerSkills.slice(0,4).map(skill=><span key={skill.id}>{skill.label}</span>)}</div>
                <a href="#atlas-blueprint" className="atlas-stage__link">Inspect this career <ArrowRight size={17} aria-hidden="true"/></a>
              </>:previewStep==="evidence"?<>
                <span className="atlas-stage__label"><Fingerprint size={17} aria-hidden="true"/> TRUSTED EVIDENCE</span>
                <h2>Unknown means unknown.</h2><p>{matchingAssessment ? matchingAssessment.title+" is available as a server-graded quiz." : "This direction has no available foundational quiz yet."} Until you complete an assessment, no numerical result is shown.</p>
                <div className="atlas-statusline"><span>Current preview</span><strong>Not assessed</strong></div>
                <Link href={assessmentHref} className="atlas-stage__link">Browse assessments <ArrowRight size={17} aria-hidden="true"/></Link>
              </>:<>
                <span className="atlas-stage__label"><Route size={17} aria-hidden="true"/> A USEFUL NEXT ACTION</span>
                <h2>Learn with a next step.</h2><p>{matchingAssessment ? "Begin with "+matchingAssessment.title+" to establish a trusted starting point." : "Explore the curated skills and available learning resources for this direction."}</p>
                <div className="atlas-stage__skillchips"><span>Learn</span><span>Practise</span><span>Reassess</span></div>
                <Link href={matchingAssessment?assessmentHref:"/resources"} className="atlas-stage__link">{matchingAssessment?"View available assessment":"Browse resources"} <ArrowRight size={17} aria-hidden="true"/></Link>
              </>}
            </div>
            <div className="atlas-artifact__bottom"><span>01 / 03 — THE LEARNING LOOP</span><span>Illustrative · no learner results</span></div>
          </div>
          <div className="atlas-artifact__index" aria-hidden="true"><span>GOAL</span><span>EVIDENCE</span><span>ACTION</span></div>
        </div>
      </section>

      <section id="atlas-journey" className="atlas-journey" aria-labelledby="atlas-journey-title">
        <div className="atlas-container">
          <div className="atlas-section-intro" data-reveal>
            <div><span className="atlas-section-number">01 / THE METHOD</span><h2 id="atlas-journey-title">Learning becomes clearer when the <em>steps connect.</em></h2></div>
            <p>One learning loop, four honest decisions. Every step leads somewhere useful—not another disconnected dashboard.</p>
          </div>
          <ol className="atlas-journey__track" aria-label="How Skillmetry works">
            {learningSteps.map((step,index)=><li key={step.index} className="atlas-journey__step" data-reveal>
              <div className="atlas-journey__number"><span>{step.index}</span><span className="atlas-journey__number-icon" aria-hidden="true">{index===0?<Compass/>:index===1?<Fingerprint/>:index===2?<ShieldCheck/>:<BookOpen/>}</span></div>
              <h3>{step.title}</h3><p>{step.note}</p>
              <span className="atlas-journey__step-bottom" aria-hidden="true">{index===3?"BACK TO LEARNING":"NEXT STAGE"} <ArrowRight size={15}/></span>
            </li>)}
          </ol>
        </div>
      </section>

      <section id="atlas-blueprint" className="atlas-blueprint atlas-container" aria-labelledby="atlas-blueprint-title">
        <div className="atlas-section-intro atlas-section-intro--blueprint" data-reveal>
          <div><span className="atlas-section-number">02 / EXPLORE THE POSSIBILITIES</span><h2 id="atlas-blueprint-title">See how the <em>skills connect.</em></h2></div>
          <p>Not a generic roadmap illustration. Every node and connection below comes from Skillmetry's actual career and prerequisite catalog.</p>
        </div>
        <div className="atlas-explorer" data-reveal>
          <aside className="atlas-explorer__sidebar" aria-label="Career directions">
            <span className="atlas-explorer__sidebar-title">CHOOSE A CAREER <span>{careers.length} PATHS</span></span>
            <div role="group" aria-label="Preview a career path">
              {careers.map((career,index)=><button key={career.id} type="button" aria-pressed={career.id===careerId} onClick={()=>chooseCareer(career.id)} className={"atlas-career-choice "+(career.id===careerId?"is-active":"")}>
                <span className="atlas-career-choice__index">0{index+1}</span><span className="atlas-career-choice__name">{career.title}<small>{career.skills.length} catalog skills</small></span><ChevronRight size={18} aria-hidden="true"/>
              </button>)}
            </div>
            <div className="atlas-explorer__aside-note"><Sparkles size={18} aria-hidden="true"/><p>Every path is editable. No profile or score is created by exploring.</p></div>
          </aside>
          <div className="atlas-explorer__main">
            <header className="atlas-explorer__heading">
              <div><span className="atlas-section-number">CAREER BLUEPRINT / {selectedCareer.skills.length} SKILLS</span><h3>{selectedCareer.title}</h3><p>{selectedCareer.subtitle}</p></div>
              <Link href={chooseHref} className="atlas-cta atlas-cta--small">Choose path <ArrowRight size={17} aria-hidden="true"/></Link>
            </header>
            <div className="atlas-map" aria-label={"Skills and prerequisite relationships for "+selectedCareer.title}>
              <div className="atlas-map__legend">{groups.map(({group,items})=><span key={group}>{group} <small>{items.length.toString().padStart(2,"0")}</small></span>)}</div>
              <div className="atlas-map__stage">
                <svg className="atlas-map__edges" viewBox="0 0 1000 540" preserveAspectRatio="none" aria-hidden="true">
                  {links.map(link=><path key={link.source+"-"+link.target} d={link.d} className={activeSkill===link.source||activeSkill===link.target?"is-highlighted":""}/>)}
                </svg>
                {groups.map(({group,items})=><div className={"atlas-map__column atlas-map__column--"+group.toLowerCase()} key={group}>
                  {items.map((skill,index)=><button type="button" key={skill.id} aria-pressed={featuredSkill?.id===skill.id} className={"atlas-map__node "+(featuredSkill?.id===skill.id?"is-selected":"")} style={{top:(100*(index+1)/(items.length+1))+"%"}} onClick={()=>setActiveSkill(skill.id)}>
                    <span className="atlas-map__node-dot"/><span>{skill.label}</span><ArrowUpRight size={14} aria-hidden="true"/>
                  </button>)}
                </div>)}
              </div>
            </div>
            <div className="atlas-explorer__inspector" aria-live="polite">
              <div><span className="atlas-section-number">SELECTED SKILL</span><strong>{featuredSkill?.label}</strong><p>{featuredSkill?.description}</p></div>
              <div><span className="atlas-section-number">PREREQUISITES</span><p>{closeSkillDependencies.length?closeSkillDependencies.map(id=>skillById[id]?.label).join(" · "):"No catalog prerequisites"}</p></div>
              <div className="atlas-explorer__inspector-actions">
                <Link href={"/resources?skill="+encodeURIComponent(featuredSkill?.id??"")} className="atlas-small-action">Explore resources <ArrowUpRight size={16} aria-hidden="true"/></Link>
                {skillAssessment?<Link href={"/assessments?assessment="+encodeURIComponent(skillAssessment.id)} className="atlas-small-action atlas-small-action--outline">Available quiz <ArrowRight size={16} aria-hidden="true"/></Link>:null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="atlas-evidence" className="atlas-evidence" aria-labelledby="atlas-evidence-title">
        <div className="atlas-container atlas-evidence__layout">
          <div className="atlas-evidence__copy" data-reveal><span className="atlas-section-number">03 / NO GUESSWORK</span><h2 id="atlas-evidence-title">A score means something. <em>So does its absence.</em></h2><p>Skillmetry doesn't confuse studying with demonstrated knowledge. Every state is shown for what it is.</p><Link href="/twin" className="atlas-quiet-link">Explore the Digital Twin <ArrowUpRight size={18} aria-hidden="true"/></Link></div>
          <div className="atlas-evidence__ledger" data-reveal>
            <div className="atlas-ledger__top"><span>THE EVIDENCE LEDGER</span><span>THREE DISTINCT STATES</span></div>
            <div className="atlas-ledger__row"><span className="atlas-ledger__symbol atlas-ledger__symbol--sage"><ShieldCheck aria-hidden="true"/></span><div><strong>Measured knowledge</strong><p>A number appears only after a completed server-graded assessment.</p></div><span className="atlas-ledger__tag">Quiz result</span></div>
            <div className="atlas-ledger__row"><span className="atlas-ledger__symbol atlas-ledger__symbol--paper"><CircleHelp aria-hidden="true"/></span><div><strong>Not assessed</strong><p>No trusted result yet. Unknown does not mean zero.</p></div><span className="atlas-ledger__tag">Unknown</span></div>
            <div className="atlas-ledger__row"><span className="atlas-ledger__symbol atlas-ledger__symbol--apricot"><BookOpenCheck aria-hidden="true"/></span><div><strong>Learning activity</strong><p>Resources and practice help you learn; they are not scored evidence.</p></div><span className="atlas-ledger__tag">Unscored</span></div>
            <div className="atlas-ledger__foot"><Fingerprint size={16} aria-hidden="true"/> Honest progress begins with knowing what is known.</div>
          </div>
        </div>
      </section>

      <section id="atlas-learning" className="atlas-learning atlas-container" aria-labelledby="atlas-learning-title">
        <div className="atlas-section-intro" data-reveal><div><span className="atlas-section-number">04 / TURN INSIGHT INTO ACTION</span><h2 id="atlas-learning-title">Don't just measure. <em>Keep moving.</em></h2></div><p>From one selected skill, take a useful action: learn the concept, practise it, or measure your understanding.</p></div>
        <div className="atlas-learning__composition" data-reveal>
          <div className="atlas-learning__note"><span className="atlas-section-number">YOUR NEXT CHAPTER</span><div className="atlas-learning__icon"><MapIcon size={29} aria-hidden="true"/></div><h3>Follow the thread.</h3><p>Learning resources connect back to the skills in your chosen direction. Progress stays honest.</p><span className="atlas-learning__scribble" aria-hidden="true"><svg viewBox="0 0 200 38"><path d="M5 25Q52 5 91 24T190 15" fill="none" stroke="currentColor" strokeWidth="2"/></svg></span></div>
          <div className="atlas-learning__actions">
            <Link href={"/resources?skill="+encodeURIComponent(featuredSkill?.id??"javascript")} className="atlas-learning__action atlas-learning__action--sage"><span><BookOpen size={24} aria-hidden="true"/> LEARN</span><div><strong>Find a relevant resource</strong><p>Explore curated material for {featuredSkill?.label}.</p></div><ArrowUpRight aria-hidden="true"/></Link>
            <Link href={"/lab?skill="+encodeURIComponent(featuredSkill?.id??"javascript")} className="atlas-learning__action atlas-learning__action--sky"><span><MousePointer2 size={24} aria-hidden="true"/> PRACTISE</span><div><strong>Try it for yourself</strong><p>Build understanding without inventing a measured score.</p></div><ArrowUpRight aria-hidden="true"/></Link>
            <Link href={skillAssessment?"/assessments?assessment="+encodeURIComponent(skillAssessment.id):"/assessments"} className="atlas-learning__action atlas-learning__action--apricot"><span><Fingerprint size={24} aria-hidden="true"/> ASSESS</span><div><strong>Check your knowledge</strong><p>Available quizzes create trusted results only after submission.</p></div><ArrowUpRight aria-hidden="true"/></Link>
          </div>
        </div>
      </section>

      <section className="atlas-close atlas-container" aria-labelledby="atlas-close-title">
        <div className="atlas-close__content"><span className="atlas-section-number">START SOMEWHERE REAL</span><h2 id="atlas-close-title">Make the next step <em>yours.</em></h2><p>One direction is enough to begin. You can always change it as you learn.</p></div>
        <Link href="/onboarding" className="atlas-cta atlas-cta--light">Choose my direction <ArrowUpRight size={20} aria-hidden="true"/></Link>
        <div className="atlas-close__detail" aria-hidden="true"><span>GOAL</span><ArrowRight size={19}/><span>EVIDENCE</span><ArrowRight size={19}/><span>ACTION</span></div>
      </section>
    </div>
    <footer className="atlas-footer"><div className="atlas-container atlas-footer__inner"><Brand/><p>Quiz evidence guides learning. It is not a professional certification or hiring prediction.</p><nav aria-label="Footer links"><Link href="/feedback">Feedback</Link><Link href="/auth/sign-in">Sign in</Link></nav></div></footer>
  </main>;
}