"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown,
  CircleHelp, Code2, Compass, Fingerprint, Route, ShieldCheck
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LandingScrollMotion } from "@/components/landing-scroll-motion";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import type { CareerId } from "@skillmetry/shared/types/domain";

const skillGroups = ["Foundation", "Core", "Applied"] as const;

export function LandingHomeV5() {
  const [careerId, setCareerId] = useState<CareerId>("backend-developer");
  const [skillId, setSkillId] = useState("javascript");
  const selectedCareer = careers.find(career => career.id === careerId) ?? careers[0];
  const selectedSkills = selectedCareer.skills
    .map(({skillId: id}) => skillById[id])
    .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill));
  const selectedSkill = selectedSkills.find(skill => skill.id === skillId) ?? selectedSkills[0];
  const supportedQuiz = assessmentCatalog.find(assessment => assessment.skillId === selectedSkill?.id);
  const startingQuiz = supportedQuiz ?? assessmentCatalog.find(assessment =>
    selectedCareer.skills.some(skill => skill.skillId === assessment.skillId)
  );
  const onboardingHref = "/onboarding?career=" + encodeURIComponent(selectedCareer.id);
  const assessmentHref = startingQuiz
    ? "/assessments?assessment=" + encodeURIComponent(startingQuiz.id)
    : "/assessments";
  const resourcesHref = "/resources?skill=" + encodeURIComponent(selectedSkill?.id ?? "javascript");
  const practiceHref = "/lab?skill=" + encodeURIComponent(selectedSkill?.id ?? "javascript");
  const prerequisites = (selectedSkill?.prerequisites ?? [])
    .filter(id => selectedSkills.some(skill => skill.id === id))
    .map(id => skillById[id]);

  function selectCareer(id: CareerId) {
    const next = careers.find(career => career.id === id);
    if (!next) return;
    setCareerId(id);
    const initialQuizSkill = next.skills.find(({skillId: id}) =>
      assessmentCatalog.some(assessment => assessment.skillId === id)
    );
    setSkillId(initialQuizSkill?.skillId ?? next.skills[0]?.skillId ?? "");
  }

  return <main className="sm-landing">
    <LandingScrollMotion />
    <a className="sm-skip" href="#sm-content">Skip to content</a>
    <header className="sm-header">
      <div className="sm-container sm-header__inner">
        <Brand />
        <nav className="sm-header__links" aria-label="Landing navigation">
          <a href="#sm-how">How it works</a>
          <a href="#sm-careers">Explore careers</a>
          <a href="#sm-learning">Learning</a>
        </nav>
        <div className="sm-header__actions">
          <Link href="/auth/sign-in" className="sm-sign-in">Sign in</Link>
          <Link href="/onboarding" className="sm-button sm-button--compact">Get started <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </header>

    <div id="sm-content">
      <section className="sm-hero sm-container" aria-labelledby="sm-hero-title">
        <div className="sm-hero__copy">
          <div className="sm-hero__marker"><span aria-hidden="true" /> A BETTER WAY TO LEARN</div>
          <h1 id="sm-hero-title">Stop guessing <em>what to learn next.</em></h1>
          <p>Pick a career direction, see what you can assess, and build a learning path around real evidence.</p>
          <div className="sm-hero__actions">
            <Link className="sm-button" href="/onboarding">Build my learning path <ArrowUpRight size={19} aria-hidden="true" /></Link>
            <a href="#sm-careers" className="sm-text-link">Explore careers <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="sm-hero__footnote"><ShieldCheck size={18} aria-hidden="true" /><span>No score until you complete an assessment.</span></div>
        </div>

        <div className="sm-hero__product">
          <div className="sm-product">
            <div className="sm-product__bar">
              <span className="sm-product__title"><span className="sm-product__glyph"><Route size={17} aria-hidden="true" /></span> Your learning path</span>
              <span className="sm-product__demo">Example, not your profile</span>
            </div>
            <div className="sm-product__career">
              <label htmlFor="sm-career-select">Your direction</label>
              <div className="sm-product__selector">
                <select id="sm-career-select" value={careerId} onChange={event => selectCareer(event.target.value as CareerId)}>
                  {careers.map(career => <option key={career.id} value={career.id}>{career.title}</option>)}
                </select>
                <ChevronDown size={18} aria-hidden="true" />
              </div>
              <p>{selectedCareer.subtitle}</p>
            </div>
            <div className="sm-product__body">
              <div className="sm-product__skill">
                <div className="sm-product__topline"><span>Start with a skill</span><span className="sm-status"><span aria-hidden="true" /> Not assessed</span></div>
                <strong>{selectedSkill?.label}</strong>
                <p>{selectedSkill?.description}</p>
                <div className="sm-product__trail">
                  <span className="sm-product__trail-dot" />
                  <span>Career goal</span>
                  <ArrowRight size={15} aria-hidden="true" />
                  <span>Skill</span>
                  <ArrowRight size={15} aria-hidden="true" />
                  <span>Next action</span>
                </div>
              </div>
              <div className="sm-product__next">
                <span className="sm-product__next-icon"><BookOpen size={23} aria-hidden="true" /></span>
                <span className="sm-product__next-label">A useful next step</span>
                <strong>{startingQuiz ? startingQuiz.title : "Explore learning resources"}</strong>
                <p>{startingQuiz ? "Take an available foundations quiz to begin measuring what you know." : "Find material relevant to this direction."}</p>
                <Link href={startingQuiz ? assessmentHref : resourcesHref}>
                  {startingQuiz ? "View assessment" : "Explore resources"} <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="sm-product__footer"><Fingerprint size={15} aria-hidden="true" /> Learning activity and assessment results stay separate.</div>
          </div>
          <div className="sm-product__orbit sm-product__orbit--one" aria-hidden="true" />
          <div className="sm-product__orbit sm-product__orbit--two" aria-hidden="true" />
        </div>
      </section>

      <section id="sm-how" className="sm-how" aria-labelledby="sm-how-title">
        <div className="sm-container sm-how__layout">
          <div className="sm-how__copy" data-reveal>
            <span className="sm-overline">The idea is simple</span>
            <h2 id="sm-how-title">A direction.<br /><em>Something to work on.</em></h2>
            <p>Skillmetry turns a career goal and available quiz evidence into a useful place to start.</p>
            <a className="sm-text-link" href="#sm-careers">See the careers <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
          <div className="sm-how__journey" data-reveal>
            <div className="sm-how__line" aria-hidden="true" />
            <div className="sm-how__item">
              <span className="sm-how__icon"><Compass size={21} aria-hidden="true" /></span>
              <div><h3>Choose a goal</h3><p>Explore a career and its actual skill requirements.</p></div>
            </div>
            <div className="sm-how__item">
              <span className="sm-how__icon sm-how__icon--sky"><Fingerprint size={21} aria-hidden="true" /></span>
              <div><h3>Find out what you know</h3><p>Take an available quiz. Unassessed skills stay unknown.</p></div>
            </div>
            <div className="sm-how__item">
              <span className="sm-how__icon sm-how__icon--peach"><BookOpen size={21} aria-hidden="true" /></span>
              <div><h3>Make your next move</h3><p>Learn, practise, then reassess when you are ready.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="sm-careers" className="sm-careers sm-container" aria-labelledby="sm-careers-title">
        <div className="sm-careers__intro" data-reveal>
          <div><span className="sm-overline">Find your direction</span><h2 id="sm-careers-title">Explore what it takes to <em>get there.</em></h2></div>
          <p>Pick a career to see its real skills. Select any skill to inspect the foundations and find learning material.</p>
        </div>
        <div className="sm-careers__tabs" role="group" aria-label="Choose a career direction">
          {careers.map(career => <button type="button" key={career.id}
            className={"sm-careers__tab" + (career.id === careerId ? " is-active" : "")}
            aria-pressed={career.id === careerId}
            onClick={() => selectCareer(career.id)}
          >{career.title}<ArrowUpRight size={16} aria-hidden="true" /></button>)}
        </div>
        <div className="sm-workbench">
          <div className="sm-workbench__top">
            <div><span>Explore the skills</span><h3>{selectedCareer.title}</h3><p>{selectedCareer.subtitle}</p></div>
            <Link className="sm-button sm-button--small" href={onboardingHref}>Choose this career <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="sm-workbench__layout">
            <div className="sm-workbench__skills" key={careerId} aria-label={"Skills for " + selectedCareer.title}>
              {skillGroups.map(group => {
                const skills = selectedSkills.filter(skill => skill.group === group);
                if (!skills.length) return null;
                return <div className="sm-skillgroup" key={group}>
                  <h4>{group}</h4>
                  <div>{skills.map(skill => <button key={skill.id} type="button"
                    aria-pressed={selectedSkill?.id === skill.id}
                    className={"sm-skillgroup__skill" + (selectedSkill?.id === skill.id ? " is-active" : "")}
                    onClick={() => setSkillId(skill.id)}
                  >{skill.label} <ArrowUpRight size={14} aria-hidden="true" /></button>)}</div>
                </div>;
              })}
            </div>
            <aside className="sm-skill-detail" aria-live="polite">
              <span className="sm-skill-detail__eyebrow">Selected skill</span>
              <h4>{selectedSkill?.label}</h4>
              <p>{selectedSkill?.description}</p>
              <div className="sm-skill-detail__prereqs">
                <span>Prerequisites</span>
                <p>{prerequisites.length ? prerequisites.map(skill => skill.label).join(" · ") : "No prerequisites in this career path"}</p>
              </div>
              <div className="sm-skill-detail__links">
                <Link href={resourcesHref}>Explore learning resources <ArrowUpRight size={16} aria-hidden="true" /></Link>
                {supportedQuiz ? <Link href={"/assessments?assessment=" + encodeURIComponent(supportedQuiz.id)}>Available foundations quiz <ArrowRight size={16} aria-hidden="true" /></Link> : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="sm-proof" aria-labelledby="sm-proof-title">
        <div className="sm-container sm-proof__layout">
          <div data-reveal className="sm-proof__copy">
            <span className="sm-overline">Progress you can trust</span>
            <h2 id="sm-proof-title">Unknown isn't <em>zero.</em></h2>
            <p>Study time is useful. Quiz results are evidence. Skillmetry keeps them distinct so you always know where you stand.</p>
            <Link href="/twin" className="sm-text-link">See how progress works <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="sm-proof__sheet" data-reveal>
            <div className="sm-proof__item"><span className="sm-proof__symbol"><CircleHelp size={21} aria-hidden="true" /></span><div><strong>Not assessed</strong><p>No trusted quiz result yet.</p></div><span className="sm-proof__value">Unknown</span></div>
            <div className="sm-proof__item"><span className="sm-proof__symbol sm-proof__symbol--green"><Check size={21} aria-hidden="true" /></span><div><strong>Assessed knowledge</strong><p>Only completed, server-graded quizzes provide a score.</p></div><span className="sm-proof__value">Measured</span></div>
            <div className="sm-proof__item"><span className="sm-proof__symbol sm-proof__symbol--orange"><Code2 size={21} aria-hidden="true" /></span><div><strong>Learning activity</strong><p>Resources and practice don't change your quiz score.</p></div><span className="sm-proof__value">Unscored</span></div>
          </div>
        </div>
      </section>

      <section id="sm-learning" className="sm-learning sm-container" aria-labelledby="sm-learning-title">
        <div className="sm-learning__heading" data-reveal>
          <div><span className="sm-overline">What comes after</span><h2 id="sm-learning-title">Learn something. <em>Try it. Keep going.</em></h2></div>
          <p>Choose a skill above, then continue with learning, practice or an available assessment.</p>
        </div>
        <div className="sm-learning__list" data-reveal>
          <Link href={resourcesHref} className="sm-learning__row">
            <span className="sm-learning__icon sm-learning__icon--sage"><BookOpen size={24} aria-hidden="true" /></span>
            <span><strong>Find resources</strong><small>Browse curated material for {selectedSkill?.label}.</small></span>
            <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
          <Link href={practiceHref} className="sm-learning__row">
            <span className="sm-learning__icon sm-learning__icon--sky"><Code2 size={24} aria-hidden="true" /></span>
            <span><strong>Put it into practice</strong><small>Explore guided coding practice without claiming a score.</small></span>
            <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
          <Link href={supportedQuiz ? "/assessments?assessment=" + encodeURIComponent(supportedQuiz.id) : assessmentHref} className="sm-learning__row">
            <span className="sm-learning__icon sm-learning__icon--orange"><Fingerprint size={24} aria-hidden="true" /></span>
            <span><strong>Take an assessment</strong><small>{supportedQuiz ? supportedQuiz.title : startingQuiz ? startingQuiz.title : "Browse available foundational quizzes"}</small></span>
            <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="sm-final">
        <div className="sm-container sm-final__inner">
          <div><h2>Your next step starts <em>here.</em></h2><p>One direction is enough to begin.</p></div>
          <Link href={onboardingHref} className="sm-button sm-button--light">Choose my direction <ArrowUpRight size={19} aria-hidden="true" /></Link>
          <div className="sm-final__arc" aria-hidden="true" />
        </div>
      </section>
    </div>
    <footer className="sm-footer"><div className="sm-container sm-footer__inner">
      <Brand /><p>Learning guidance built on real quiz evidence.</p>
      <nav aria-label="Footer links"><Link href="/feedback">Feedback</Link><Link href="/auth/sign-in">Sign in</Link></nav>
    </div></footer>
  </main>;
}
