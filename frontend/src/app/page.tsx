import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpenText, Compass, Fingerprint, GitBranch, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { CareerChapterGallery } from "@/components/career-chapter-gallery";
import { LandingJourneyPreview } from "@/components/landing-journey-preview";
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
              <p className="lc-eyebrow"><span className="lc-eyebrow-dot" /> THE NEXT STEP IN YOUR CAREER STARTS HERE</p>
              <h1 id="lc-hero-title">Not sure <span className="lc-hero-line">what to learn<span className="lc-swoosh" aria-hidden="true" /></span><span className="lc-hero-last">next<span className="lc-period">?</span></span></h1>
              <p className="lc-hero-intro">Choose a career, check what you know with a real quiz, and follow one useful learning step at a time. No guessed skill ratings. No overwhelming to-do lists.</p>
              <div className="lc-hero-ctas">
                <Link href="/onboarding" className="lc-split-cta"><span>Find my starting point</span><span className="lc-cta-orbit"><ArrowUpRight aria-hidden="true" size={21} /></span></Link>
                <Link href="/dashboard" className="lc-text-action">See an example journey <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
              <p className="lc-hero-note"><ShieldCheck size={15} aria-hidden="true" /> Explore without an account. Quiz scores are saved securely only after sign-in.</p>
              <div className="lc-hero-stamp"><span>EXPLORE</span><ArrowDownRight size={22} aria-hidden="true" /><span>01—03</span></div>
            </div>
            <LandingJourneyPreview/>
          </section>

          <section id="explore" className="lc-discovery" aria-labelledby="lc-discovery-title">
            <div className="lc-section-intro">
              <div>
                <span className="lc-eyebrow">CHAPTER 01 / DISCOVER</span>
                <h2 id="lc-discovery-title">What could you <em>build?</em></h2>
              </div>
              <p>Pick a career below. See what skills it involves before committing to a plan. You can change direction later.</p>
            </div>
            <CareerChapterGallery />
          </section>

          <section id="chapters" className="lc-chapter-section" aria-labelledby="lc-chapters-title">
            <div className="lc-chapter-heading"><span className="lc-eyebrow">A PATH, NOT A PILE OF DASHBOARDS</span><h2 id="lc-chapters-title">One clear step.<br /><em>Then the next.</em></h2></div>
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

          <section className="sx-home-example" aria-label="Example learner journey">
            <div className="sx-home-example-copy">
              <span className="lc-eyebrow">THIS IS WHAT YOU WILL ACTUALLY DO</span>
              <h2>Less guessing.<br /><em>More doing.</em></h2>
              <p>Think of Skillmetry as a quiet guide: choose what you want to learn, take a foundational quiz when available, and get a specific next step. Your progress is based on your own work, not a made-up career score.</p>
              <Link href="/onboarding" className="sx-text-link">Build my path <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className="sx-sample-path" aria-label="Illustrative learning journey, not an actual student's results">
              <span className="sx-sample-label">EXAMPLE ONLY · FRONTEND DEVELOPER</span>
              <div className="sx-sample-row"><span>1</span><div><strong>Choose a direction</strong><p>Frontend Developer</p></div><Compass aria-hidden="true" /></div>
              <div className="sx-sample-row"><span>2</span><div><strong>See what quizzes can measure</strong><p>JavaScript and HTML foundations</p></div><Fingerprint aria-hidden="true" /></div>
              <div className="sx-sample-row"><span>3</span><div><strong>Get a helpful next step</strong><p>Learn a topic, practise, or reassess</p></div><GitBranch aria-hidden="true" /></div>
              <p>No fictional score or career readiness percentage.</p>
            </div>
          </section>

          <section id="why" className="lc-statement" aria-labelledby="lc-statement-title">
            <div className="lc-statement-mark"><BookOpenText size={27} aria-hidden="true" /><span>OUR POINT OF VIEW / 001</span></div>
            <h2 id="lc-statement-title">Not assessed <span>doesn&apos;t mean</span> not skilled.</h2>
            <div className="lc-statement-bottom"><p>Skillmetry separates missing evidence from measured results. Your next move is explained through your selected goals, supported assessments and real skill prerequisites—not imaginary placement probabilities.</p><Link href="/twin">Explore the Skill Twin <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
          </section>

          <section className="lc-end" aria-labelledby="lc-end-title">
            <span className="lc-eyebrow">YOUR STORY ISN&apos;T PREWRITTEN</span>
            <h2 id="lc-end-title">Your next move <em>starts here.</em></h2>
            <Link href="/onboarding" className="lc-split-cta"><span>Find my starting point</span><span className="lc-cta-orbit"><ArrowUpRight size={21} aria-hidden="true" /></span></Link>
          </section>
        </div>

        <footer className="lc-footer">
          <Brand />
          <p>Built to make learning a little clearer, one step at a time.</p>
          <span>Early MVP · Quiz outcomes aren&apos;t professional certifications or hiring predictions.</span>
          <Link href="/auth/sign-in">Sign in ↗</Link>
        </footer>
      </div>
    </main>
  );
}
