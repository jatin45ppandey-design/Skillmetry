import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Compass,
  Fingerprint,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Brand } from "@/components/brand";

const pillars = [
  {
    number: "01",
    icon: Fingerprint,
    category: "UNDERSTAND",
    title: "A skill profile that stays alive.",
    detail:
      "Track server-graded assessment results and progress over time in one evolving career twin.",
    highlight: "Quiz-derived, not self-rated",
  },
  {
    number: "02",
    icon: GitBranch,
    category: "NAVIGATE",
    title: "Not a roadmap for everyone. Yours.",
    detail:
      "Explore an interactive skill graph that adapts to your target role, prerequisites and measured progress.",
    highlight: "Your next step, explained",
  },
  {
    number: "03",
    icon: FlaskConical,
    category: "EXPLORE",
    title: "Try the future before you build it.",
    detail:
      "Run what-if scenarios to compare skill paths without changing server-graded results.",
    highlight: "Simulated, not guaranteed",
  },
];

const steps = [
  {
    index: "01",
    heading: "Choose a direction",
    description: "Pick a career goal. Your skills begin unassessed, not at zero.",
  },
  {
    index: "02",
    heading: "See your skill twin",
    description: "Take secure quizzes to establish trusted, versioned scores.",
  },
  {
    index: "03",
    heading: "Follow your own map",
    description: "Explore gaps, prerequisite paths and hands-on missions.",
  },
  {
    index: "04",
    heading: "Prove progress. Recalculate.",
    description: "Assessment evidence updates the twin and recommendations.",
  },
];

function SkillNode({
  label,
  meta,
  state = "upcoming",
}: {
  label: string;
  meta: string;
  state?: "complete" | "active" | "upcoming" | "locked";
}) {
  return (
    <div className={"lp-node lp-node--" + state}>
      <span className="lp-node-icon">
        {state === "complete" ? <CheckCircle2 size={13} /> : state === "locked" ? <LockKeyhole size={12} /> : <CircleDot size={13} />}
      </span>
      <span className="lp-node-copy">
        <strong>{label}</strong>
        <small>{meta}</small>
      </span>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="lp-showcase" aria-label="Illustrative career roadmap interface">
      <div className="lp-preview-window">
        <div className="lp-preview-chrome">
          <div className="lp-window-dots"><i /><i /><i /></div>
          <div className="lp-preview-address">skillmetry / workspace / roadmap</div>
          <span className="lp-demo-pill">SAMPLE DATA</span>
        </div>
        <div className="lp-preview-workspace">
          <aside className="lp-preview-sidebar" aria-hidden="true">
            <div className="lp-sidebar-logo">s.</div>
            <span className="lp-sidebar-icon lp-sidebar-icon--active"><Compass size={17} /></span>
            <span className="lp-sidebar-icon"><Fingerprint size={17} /></span>
            <span className="lp-sidebar-icon"><GitBranch size={17} /></span>
            <span className="lp-sidebar-icon"><Target size={17} /></span>
            <span className="lp-sidebar-spacer" />
            <span className="lp-sidebar-user">S</span>
          </aside>
          <div className="lp-preview-main">
            <div className="lp-preview-titleline">
              <div>
                <span className="lp-kicker">YOUR PERSONALIZED PATH</span>
                <h3>ML Engineer roadmap</h3>
                <p>Built around your current skill twin</p>
              </div>
              <span className="lp-preview-view">Illustrative preview · Graph view</span>
            </div>
            <div className="lp-preview-stats">
              <div><span>MEASURED SCORE</span><strong>72<span>/100</span></strong></div>
              <div><span>ASSESSED SKILLS</span><strong>04<span>/09</span></strong></div>
              <div><span>RECOMMENDED NEXT</span><strong className="lp-preview-stats-next">Docker</strong></div>
            </div>
            <div className="lp-graph">
              <div className="lp-graph-heading">
                <span><GitBranch size={13} /> Skill dependency map</span>
                <span>FOUNDATION → DEPLOYMENT</span>
              </div>
              <div className="lp-graph-flow">
                <div className="lp-graph-stage">
                  <span className="lp-stage-title">01 / FOUNDATIONS</span>
                  <SkillNode label="Python" meta="Assessed · 80%" state="complete" />
                  <SkillNode label="SQL" meta="Assessed · 60%" state="complete" />
                </div>
                <span className="lp-graph-connector"><ArrowRight size={15} /></span>
                <div className="lp-graph-stage">
                  <span className="lp-stage-title">02 / CORE</span>
                  <SkillNode label="ML basics" meta="Learning" state="active" />
                  <SkillNode label="Data prep" meta="Ready to explore" state="upcoming" />
                </div>
                <span className="lp-graph-connector"><ArrowRight size={15} /></span>
                <div className="lp-graph-stage">
                  <span className="lp-stage-title">03 / APPLIED</span>
                  <SkillNode label="Docker" meta="Recommended next" state="active" />
                  <SkillNode label="Deployment" meta="Prerequisites first" state="locked" />
                </div>
              </div>
              <div className="lp-graph-legend">
                <span><i className="lp-legend-done" /> Assessed</span>
                <span><i className="lp-legend-active" /> Not assessed</span>
                <span><i className="lp-legend-locked" /> Prerequisite pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-whatif">
        <span className="lp-whatif-icon"><TrendingUp size={15} /></span>
        <div>
          <span className="lp-whatif-label">WHAT-IF SIMULATION</span>
          <strong>48 <ArrowRight size={13} /> 68 <span>potential</span></strong>
          <small>Learn Docker + deployment</small>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="lp-page">
      <div className="lp-ambient" aria-hidden="true" />
      <div className="lp-shell">
        <header className="lp-header">
          <Brand />
          <nav className="lp-nav-links" aria-label="Main navigation">
            <a href="#platform">Platform</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/careers">Explore careers</Link>
          </nav>
          <div className="lp-nav-actions"><Link className="lp-nav-signin" href="/auth/sign-in">Sign in</Link><Link className="lp-nav-cta" href="/dashboard">Try demo <ArrowUpRight size={16} /></Link></div>
        </header>

        <section className="lp-hero" aria-labelledby="lp-hero-heading">
          <div className="lp-hero-copy">
            <div className="lp-eyebrow"><span className="lp-live-dot" /> SKILLMETRY / SIGNAL <span className="lp-eyebrow-spark"><Sparkles size={13} /></span></div>
            <h1 id="lp-hero-heading">Measure the signal. <em>Choose the next move.</em></h1>
            <p className="lp-hero-description">
              Meet your quiz-driven career digital twin. Measure foundational skills securely, preserve progress, and find the clearest next move.
            </p>
            <div className="lp-hero-actions">
              <Link className="lp-button lp-button--primary" href="/onboarding">
                Build your skill twin <ArrowUpRight size={18} />
              </Link>
              <Link className="lp-button lp-button--quiet" href="/roadmap">
                Explore a roadmap <ArrowRight size={17} />
              </Link>
            </div>
            <div className="lp-trust">
              <span><ShieldCheck size={15} /> No CV required</span>
              <span><BadgeCheck size={15} /> Server-graded progress</span>
              <span><Sparkles size={15} /> Free demo</span>
            </div>
          </div>
          <ProductPreview />
        </section>

        <div className="lp-value-strip" aria-label="How Skillmetry helps you grow">
          <span>ONE CONTINUOUS LOOP</span>
          <strong>Measure <ChevronRight size={16} /> Understand <ChevronRight size={16} /> Learn <ChevronRight size={16} /> Evolve</strong>
        </div>

        <section id="platform" className="lp-platform">
          <div className="lp-section-heading">
            <span className="lp-kicker">BUILT FOR REAL PROGRESS</span>
            <h2>Evidence first. <span>Direction second.</span></h2>
            <p>Learning paths are useful. A clear picture of your abilities—and a practical way forward—is better.</p>
          </div>
          <div className="lp-feature-grid">
            {pillars.map(({ number, icon: Icon, category, title, detail, highlight }) => (
              <article className="lp-feature" key={number}>
                <div className="lp-feature-top"><span>{number} / {category}</span><Icon size={21} strokeWidth={1.7} /></div>
                <h3>{title}</h3>
                <p>{detail}</p>
                <div className="lp-feature-foot"><CheckCircle2 size={15} /> {highlight}</div>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="lp-process">
          <div className="lp-process-intro">
            <span className="lp-kicker">HOW IT WORKS</span>
            <h2>Your growth, <span>connected.</span></h2>
            <p>Your roadmap changes when your skills change. Not when you tick an arbitrary checkbox.</p>
            <Link className="lp-text-link" href="/onboarding">See it in action <ArrowUpRight size={16} /></Link>
          </div>
          <div className="lp-steps">
            {steps.map((step) => (
              <div className="lp-step" key={step.index}>
                <span className="lp-step-index">{step.index}</span>
                <div><strong>{step.heading}</strong><p>{step.description}</p></div>
                <ArrowUpRight size={17} />
              </div>
            ))}
          </div>
        </section>

        <section className="lp-bottom-cta">
          <div><span className="lp-kicker">START WITH WHAT YOU KNOW</span><h2>Build a learning system around real evidence.</h2></div>
          <Link href="/onboarding" className="lp-button lp-button--primary">Create your skill twin <ArrowUpRight size={18} /></Link>
        </section>

        <footer className="lp-footer">
          <Brand />
          <p>Personalized growth, grounded in measured results.</p>
          <span>Early MVP · Quiz scores are not hiring predictions or professional certifications.</span>
        </footer>
      </div>
    </main>
  );
}
