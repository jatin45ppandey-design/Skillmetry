import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CheckCircle2, Minus, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { CareerChapterGallery } from "@/components/career-chapter-gallery";
import { LearningChapterSampler } from "@/components/learning-chapter-sampler";
import "./chapter-landing.css";

export default function Home() {
  return (
    <main className="lc-site">
      <a href="#main-content" className="lc-skip">Skip to content</a>
      <div className="lc-frame">
        <header className="lc-header">
          <Brand/>
          <nav className="lc-nav" aria-label="Public navigation">
            <a href="#explore">Explore the paths</a>
            <a href="#measure">Why evidence matters</a>
            <a href="#inside">Inside Skillmetry</a>
          </nav>
          <div className="lc-header-actions">
            <Link href="/auth/sign-in" className="lc-signin">Sign in</Link>
            <Link href="/onboarding" className="lc-nav-cta">Start learning <ArrowUpRight size={17} aria-hidden="true"/></Link>
          </div>
        </header>

        <div id="main-content">
          <section className="lc-hero" aria-labelledby="lc-hero-title">
            <div className="lc-hero-top">
              <span className="lc-eyebrow"><span className="lc-eyebrow-dot"/> AN INTERACTIVE STUDIO FOR CURIOUS LEARNERS</span>
              <span className="lc-hero-folio">FIELD NOTES / VOL. 01</span>
            </div>
            <h1 id="lc-hero-title">
              <span>What does it take</span>
              <span className="lc-hero-answer">to get <em>there?</em><span className="lc-hero-asterisk" aria-hidden="true">✳</span></span>
            </h1>
            <div className="lc-hero-bottom">
              <p>Choose a career direction, trace the skills behind it, and discover what you can actually measure. <strong>Your path should make sense to you.</strong></p>
              <div className="lc-hero-guide">
                <span>NO GUESSED SKILL SCORES</span>
                <a href="#explore">Start by exploring <ArrowDown size={19} aria-hidden="true"/></a>
              </div>
            </div>
          </section>

          <section id="explore" className="lc-discovery" aria-labelledby="lc-discovery-title">
            <div className="lc-section-intro">
              <span className="lc-eyebrow">01 / OPEN THE FIELD GUIDE</span>
              <div className="lc-discovery-titleline">
                <h2 id="lc-discovery-title">Try a direction.<br/><em>Follow the threads.</em></h2>
                <p>Real skills. Real prerequisite links. Select a career, click a skill, and see what matters before choosing your learning goals.</p>
              </div>
            </div>
            <CareerChapterGallery/>
            <div className="lc-discovery-after">
              <span><ShieldCheck size={17} aria-hidden="true"/> Demo data is illustrative. Secure assessments require sign-in.</span>
              <Link href="/dashboard">See the student studio <ArrowUpRight size={17} aria-hidden="true"/></Link>
            </div>
          </section>

          <section id="measure" className="lc-measure" aria-labelledby="lc-measure-title">
            <div className="lc-measure-top">
              <span className="lc-eyebrow">02 / A BETTER WAY TO UNDERSTAND SKILLS</span>
              <span>THE DIFFERENCE MATTERS</span>
            </div>
            <h2 id="lc-measure-title">
              Not assessed <span className="lc-measure-symbol" aria-label="does not equal">≠</span>
              <em>not skilled.</em>
            </h2>
            <div className="lc-measure-foot">
              <div className="lc-measure-rule" aria-hidden="true"><span/><span/><span/></div>
              <p>A missing quiz tells us nothing about your ability. Skillmetry keeps it unknown until a supported, server-graded assessment adds real evidence.</p>
              <Link href="/twin">Why this matters <ArrowUpRight size={18} aria-hidden="true"/></Link>
            </div>
          </section>

          <LearningChapterSampler/>

          <section className="lc-end" aria-labelledby="lc-end-title">
            <div className="lc-end-top">
              <span className="lc-eyebrow">YOUR NEXT CHAPTER IS YOURS TO WRITE</span>
              <span className="lc-end-stamp" aria-hidden="true">✳</span>
            </div>
            <h2 id="lc-end-title">Learning starts<br/>with <em>a direction.</em></h2>
            <div className="lc-end-bottom">
              <p>You don&apos;t have to know everything yet. You just need somewhere meaningful to begin.</p>
              <Link className="lc-big-cta" href="/onboarding">Build my learning profile <span><ArrowUpRight size={23} aria-hidden="true"/></span></Link>
            </div>
          </section>
        </div>

        <footer className="lc-footer">
          <Brand/>
          <p>Curiosity is a start. Evidence builds the rest.</p>
          <span><CheckCircle2 size={15} aria-hidden="true"/> Early MVP · Quiz results are not professional certifications.</span>
          <Link href="/auth/sign-in">Sign in <ArrowRight size={15} aria-hidden="true"/></Link>
        </footer>
      </div>
    </main>
  );
}
