import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpenText, Compass, Fingerprint, GitBranch, ShieldCheck, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { CareerChapterGallery } from "@/components/career-chapter-gallery";
import "./chapter-landing.css";

const chapters = [
  { chapter: "01", label: "DISCOVER", title: "Choose a direction.", copy: "Begin with a role or the skills you want to explore. You don't need a perfect career plan to get started.", icon: Compass, tone: "apricot", href: "/onboarding", action: "Make a learning profile" },
  { chapter: "02", label: "UNDERSTAND", title: "Let evidence speak.", copy: "A supported quiz gives you a measured result. Unassessed skills stay unknown—not failures in disguise.", icon: Fingerprint, tone: "sage", href: "/assessments", action: "See assessments" },
  { chapter: "03", label: "GROW", title: "Find the next move.", copy: "Explore real prerequisite connections and curated learning materials that reflect your goals and available evidence.", icon: GitBranch, tone: "lilac", href: "/roadmap", action: "Explore the skill map" }
] as const;

export default function Home() {
  return (
    <main className="lc-site">
      <a href="#main-content" className="lc-skip">Skip to content</a>
      <div className="lc-frame">
        <header className="lc-header">
          <Brand />
          <nav className="lc-nav" aria-label="Public navigation">
            <a href="#explore">Explore careers</a>
            <a href="#chapters">The journey</a>
            <a href="#why">Our approach</a>
          </nav>
          <div className="lc-header-actions">
            <Link href="/auth/sign-in" className="lc-signin">Sign in</Link>
            <Link href="/onboarding" className="lc-nav-cta">Start exploring <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </header>

        <div id="main-content">
          <section className="lc-hero" aria-labelledby="lc-hero-title">
            <div className="lc-hero-copy">
              <p className="lc-eyebrow"><span className="lc-eyebrow-dot" /> A LEARNING STUDIO THAT GROWS WITH YOU</p>
              <h1 id="lc-hero-title">Find your <span className="lc-hero-line">direction<span className="lc-swoosh" aria-hidden="true" /></span><span className="lc-hero-last">One skill at a time<span className="lc-period">.</span></span></h1>
              <p className="lc-hero-intro">Your career journey isn&apos;t a checklist. Discover a path, measure what a quiz can tell you, and make sense of what to learn next.</p>
              <div className="lc-hero-ctas">
                <Link href="/onboarding" className="lc-split-cta"><span>Build my learning profile</span><span className="lc-cta-orbit"><ArrowUpRight aria-hidden="true" size={21} /></span></Link>
                <Link href="/dashboard" className="lc-text-action">Explore a demo <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
              <p className="lc-hero-note"><ShieldCheck size={15} aria-hidden="true" /> Demo data is illustrative. Secure assessments require sign-in.</p>
              <div className="lc-hero-stamp"><span>EXPLORE</span><ArrowDownRight size={22} aria-hidden="true" /><span>01—03</span></div>
            </div>
            <div className="lc-hero-art" aria-label="Illustration of learning notes connected along a curved path">
              <div className="lc-art-paper lc-art-paper--back"><span>NOTES / 001</span><span className="lc-handdrawn">Curiosity<br />is a start.</span></div>
              <div className="lc-art-sun" aria-hidden="true"><Sparkles size={30} /></div>
              <div className="lc-art-path" aria-hidden="true" />
              <div className="lc-art-note lc-art-note--one"><span>01 / CHOOSE</span><Compass size={30} /><strong>YOUR<br />DIRECTION</strong></div>
              <div className="lc-art-note lc-art-note--two"><span>02 / MEASURE</span><Fingerprint size={34} /><strong>WHAT&apos;S<br />KNOWN</strong></div>
              <div className="lc-art-note lc-art-note--three"><span>03 / GROW</span><GitBranch size={33} /><strong>WHAT&apos;S<br />NEXT</strong></div>
              <div className="lc-art-sticker">your path<br />unfolds ↗</div>
              <div className="lc-art-side-note">FIG. 01 / THE LEARNING LOOP</div>
            </div>
          </section>

          <section id="explore" className="lc-discovery" aria-labelledby="lc-discovery-title">
            <div className="lc-section-intro">
              <div>
                <span className="lc-eyebrow">CHAPTER 01 / DISCOVER</span>
                <h2 id="lc-discovery-title">There are many ways <em>to begin.</em></h2>
              </div>
              <p>Four real career directions in the Skillmetry catalog. Explore their skills before deciding where your learning should begin.</p>
            </div>
            <CareerChapterGallery />
          </section>

          <section id="chapters" className="lc-chapter-section" aria-labelledby="lc-chapters-title">
            <div className="lc-chapter-heading"><span className="lc-eyebrow">A PATH, NOT A PILE OF DASHBOARDS</span><h2 id="lc-chapters-title">A little more clarity.<br /><em>At every chapter.</em></h2></div>
            <div className="lc-chapter-stack">
              {chapters.map(({chapter,label,title,copy,icon:Icon,tone,href,action}) => (
                <article className={"lc-chapter lc-chapter--" + tone} key={chapter}>
                  <span className="lc-chapter-num">{chapter} / {label}</span>
                  <div className="lc-chapter-icon"><Icon size={36} strokeWidth={1.65} aria-hidden="true" /></div>
                  <div className="lc-chapter-content"><h3>{title}</h3><p>{copy}</p></div>
                  <Link href={href} className="lc-chapter-link" aria-label={action}><ArrowUpRight size={21} aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
          </section>

          <section id="why" className="lc-statement" aria-labelledby="lc-statement-title">
            <div className="lc-statement-mark"><BookOpenText size={27} aria-hidden="true" /><span>OUR POINT OF VIEW / 001</span></div>
            <h2 id="lc-statement-title">Not assessed <span>doesn&apos;t mean</span> not skilled.</h2>
            <div className="lc-statement-bottom"><p>Skillmetry separates missing evidence from measured results. Your next move is explained through your selected goals, supported assessments and real skill prerequisites—not imaginary placement probabilities.</p><Link href="/twin">Explore the Skill Twin <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
          </section>

          <section className="lc-end" aria-labelledby="lc-end-title">
            <span className="lc-eyebrow">YOUR STORY ISN&apos;T PREWRITTEN</span>
            <h2 id="lc-end-title">Ready to start a new <em>chapter?</em></h2>
            <Link href="/onboarding" className="lc-split-cta"><span>Find my direction</span><span className="lc-cta-orbit"><ArrowUpRight size={21} aria-hidden="true" /></span></Link>
          </section>
        </div>

        <footer className="lc-footer">
          <Brand />
          <p>Made for curious people learning real skills.</p>
          <span>Early MVP · Quiz outcomes aren&apos;t professional certifications or hiring predictions.</span>
          <Link href="/auth/sign-in">Sign in ↗</Link>
        </footer>
      </div>
    </main>
  );
}
