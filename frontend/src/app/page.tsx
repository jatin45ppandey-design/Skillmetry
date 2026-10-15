import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  GitBranch,
  MoveUpRight,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
import "./landing.css";

const principles = [
  {
    index: "01",
    title: "Start with a direction.",
    description:
      "Choose a career or a few skills you want to work on. You can change your focus as you learn.",
    detail: "Career and skill goals",
  },
  {
    index: "02",
    title: "Let evidence do the talking.",
    description:
      "Take an available, server-graded assessment. A missing quiz result is marked unknown, never zero.",
    detail: "Measured results, clear limits",
  },
  {
    index: "03",
    title: "Work on a useful next step.",
    description:
      "Explore prerequisite-aware paths and curated resources grounded in your goals and available evidence.",
    detail: "Explainable recommendations",
  },
];

const workflow = [
  { number: "01", title: "Choose your direction", description: "A career track is optional. Start with the skills that matter to you." },
  { number: "02", title: "Take a supported quiz", description: "A completed assessment adds a measured result to your private record." },
  { number: "03", title: "Understand the gaps", description: "See what has been measured and what still needs evidence." },
  { number: "04", title: "Learn, then reassess", description: "Follow the next step and compare your assessment history over time." },
];

function LearningRecordPreview() {
  return (
    <div className="sl-record" aria-label="Illustrative Skillmetry learning record, not live user data">
      <div className="sl-record-top">
        <span className="sl-record-brand"><span className="sl-record-mark" aria-hidden="true">s.</span> Learning record</span>
        <span className="sl-record-demo">ILLUSTRATIVE VIEW</span>
      </div>
      <div className="sl-record-body">
        <div className="sl-record-heading">
          <span className="sl-micro">YOUR DIRECTION</span>
          <h2>Backend Developer</h2>
          <p>A learning direction, not an employability score.</p>
        </div>
        <div className="sl-record-divider" />
        <div className="sl-record-section-heading">
          <span className="sl-micro">SKILL EVIDENCE</span>
          <span className="sl-record-note">Example before your first quiz</span>
        </div>
        <div className="sl-evidence-row">
          <div className="sl-evidence-symbol"><BookOpenCheck size={17} aria-hidden="true" /></div>
          <div><strong>Assessment record</strong><small>No completed quiz yet</small></div>
          <span className="sl-evidence-state">Not assessed</span>
        </div>
        <div className="sl-evidence-row sl-evidence-row-muted">
          <div className="sl-evidence-symbol"><GitBranch size={17} aria-hidden="true" /></div>
          <div><strong>Learning pathway</strong><small>Based on your selected goal</small></div>
          <span className="sl-evidence-state">Explore</span>
        </div>
        <div className="sl-record-callout">
          <span className="sl-callout-symbol" aria-hidden="true">→</span>
          <div>
            <span className="sl-micro">YOUR NEXT MOVE</span>
            <strong>Take a supported skill assessment.</strong>
            <p>Get a measured starting point before making conclusions about your skills.</p>
          </div>
        </div>
      </div>
      <div className="sl-record-bottom">
        <span><ShieldCheck size={14} aria-hidden="true" /> Unknown is not a failed score</span>
        <span>SKILLMETRY / 01</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="sl-page">
      <a className="sl-skip" href="#main-content">Skip to main content</a>
      <div className="sl-wrap">
        <header className="sl-header">
          <Brand />
          <nav aria-label="Main navigation" className="sl-nav">
            <a href="#approach">The approach</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/careers">Career paths</Link>
          </nav>
          <div className="sl-header-actions">
            <Link className="sl-signin" href="/auth/sign-in">Sign in</Link>
            <Link className="sl-header-cta" href="/onboarding">Get started <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </header>

        <div id="main-content">
          <section className="sl-hero" aria-labelledby="sl-title">
            <div className="sl-hero-copy">
              <p className="sl-kicker"><span className="sl-kicker-line" /> SKILLMETRY / CAREER LEARNING SYSTEM</p>
              <h1 id="sl-title">Your next skill <span>shouldn&apos;t be a guess.</span></h1>
              <p className="sl-hero-description">
                Choose where you want to go. Measure what supported quizzes can tell you.
                Then follow a learning path that makes your next move clearer.
              </p>
              <div className="sl-actions">
                <Link className="sl-button sl-button-primary" href="/onboarding">Set my direction <ArrowUpRight size={18} aria-hidden="true" /></Link>
                <Link className="sl-button sl-button-secondary" href="/dashboard">Explore the demo <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
              <p className="sl-hero-disclosure">The demo uses illustrative data. Sign in to take a secure assessment.</p>
              <div className="sl-hero-bottom">
                <span>ONE CONNECTED LEARNING LOOP</span>
                <strong>Assess <span>/</span> Understand <span>/</span> Learn <span>/</span> Reassess</strong>
              </div>
            </div>
            <div className="sl-hero-visual">
              <div className="sl-visual-label"><span>THE PRODUCT, NOT THE PROMISE</span><span>FIG. 01</span></div>
              <LearningRecordPreview />
              <div className="sl-visual-footnote"><span>Built around the evidence you actually have.</span><span>NO INVENTED SCORES</span></div>
            </div>
          </section>

          <section className="sl-belief" aria-label="Core principle">
            <div className="sl-belief-label"><span className="sl-small-rule" /> THE IDEA</div>
            <div><p>Not assessed <em>does not</em> mean not skilled.</p><span>Skillmetry keeps missing evidence separate from measured results. It shows the limits of what it knows instead of filling gaps with made-up certainty.</span></div>
          </section>

          <section id="approach" className="sl-approach" aria-labelledby="sl-approach-title">
            <div className="sl-section-intro">
              <div><span className="sl-kicker sl-kicker-small">01 / HOW SKILLMETRY THINKS</span><h2 id="sl-approach-title">Less noise. <span>More direction.</span></h2></div>
              <p>Not another dashboard full of percentages. A focused system for turning assessment evidence into a practical learning decision.</p>
            </div>
            <div className="sl-principles">
              {principles.map((item) => (
                <article className="sl-principle" key={item.index}>
                  <span className="sl-principle-index">{item.index}</span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                  <span className="sl-principle-detail">{item.detail}</span>
                </article>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="sl-process" aria-labelledby="sl-process-title">
            <div className="sl-process-lead">
              <span className="sl-kicker sl-kicker-small">02 / YOUR LEARNING LOOP</span>
              <h2 id="sl-process-title">Make progress you can <em>explain.</em></h2>
              <p>A clear sequence from setting a goal to reviewing new evidence. No placement prediction, no shortcut to professional verification.</p>
              <Link href="/roadmap" className="sl-inline-link">Explore an example roadmap <MoveUpRight size={16} aria-hidden="true" /></Link>
            </div>
            <ol className="sl-process-list">
              {workflow.map((item) => (
                <li key={item.number}>
                  <span>{item.number}</span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                  <CheckCircle2 size={17} aria-hidden="true" />
                </li>
              ))}
            </ol>
          </section>

          <section className="sl-last" aria-labelledby="sl-last-title">
            <div><span className="sl-kicker sl-kicker-small">READY WHEN YOU ARE</span><h2 id="sl-last-title">Begin with a goal.<br />Build with evidence.</h2></div>
            <Link className="sl-button sl-button-primary" href="/onboarding">Create my learning path <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </section>
        </div>

        <footer className="sl-footer">
          <Brand />
          <div><span>Made for learning, not for hiring predictions.</span><small>Early MVP · Quiz results are not professional certifications.</small></div>
          <Link href="/auth/sign-in"><Compass size={16} aria-hidden="true" /> Go to my workspace</Link>
        </footer>
      </div>
    </main>
  );
}
