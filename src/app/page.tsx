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
      "Track your current abilities, assessment results and project evidence in one evolving career twin.",
    highlight: "Self-reported ≠ verified",
  },
  {
    number: "02",
    icon: GitBranch,
    category: "NAVIGATE",
    title: "Not a roadmap for everyone. Yours.",
    detail:
      "Explore an interactive skill graph that adapts to your target role, prerequisites and demonstrated progress.",
    highlight: "Your next step, explained",
  },
  {
    number: "03",
    icon: FlaskConical,
    category: "EXPLORE",
    title: "Try the future before you build it.",
    detail:
      "Run what-if scenarios to compare skill paths and projected readiness without changing verified results.",
    highlight: "Simulated, not guaranteed",
  },
];

const steps = [
  {
    index: "01",
    heading: "Choose a direction",
    description: "Pick a career goal and share the skills you already have.",
  },
  {
    index: "02",
    heading: "See your skill twin",
    description: "Get a transparent starting point, with confidence labels.",
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
              <span className="lp-preview-view">Graph view</span>
            </div>
            <div className="lp-preview-stats">
              <div><span>READINESS INDEX</span><strong>48<span>/100</span></strong></div>
              <div><span>ACTIVE SKILLS</span><strong>04<span>/09</span></strong></div>
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
                  <SkillNode label="Python" meta="Demonstrated" state="complete" />
                  <SkillNode label="SQL" meta="In progress" state="complete" />
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
                <span><i className="lp-legend-done" /> Demonstrated</span>
                <span><i className="lp-legend-active" /> Working on</span>
                <span><i className="lp-legend-locked" /> Coming up</span>
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
            <div className="lp-eyebrow"><span className="lp-live-dot" /> YOUR CAREER, IN MOTION <span className="lp-eyebrow-spark"><Sparkles size={13} /></span></div>
            <h1 id="lp-hero-heading">A roadmap that <em>knows</em> where you stand.</h1>
            <p className="lp-hero-description">
              Meet your career digital twin. Discover the skills you need, show what you actually know, and find the smartest next move.
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
              <span><BadgeCheck size={15} /> Evidence-aware progress</span>
              <span><Sparkles size={15} /> Free demo</span>
            </div>
          </div>
          <ProductPreview />
        </section>

        <div className="lp-value-strip" aria-label="How Skillmetry helps you grow">
          <span>ONE CONTINUOUS LOOP</span>
          <strong>Map skills <ChevronRight size={16} /> Choose a path <ChevronRight size={16} /> Build proof <ChevronRight size={16} /> Grow your twin</strong>
        </div>

        <section id="platform" className="lp-platform">
          <div className="lp-section-heading">
            <span className="lp-kicker">BUILT FOR REAL PROGRESS</span>
            <h2>Less guessing. <span>More growing.</span></h2>
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
          <div><span className="lp-kicker">START WITH WHAT YOU KNOW</span><h2>See the bigger picture of your potential.</h2></div>
          <Link href="/onboarding" className="lp-button lp-button--primary">Create your skill twin <ArrowUpRight size={18} /></Link>
        </section>

        <footer className="lp-footer">
          <Brand />
          <p>Personalized growth, backed by evidence.</p>
          <span>Early prototype · Readiness is an estimate, not a hiring prediction.</span>
        </footer>
      </div>
    </main>
  );
}
