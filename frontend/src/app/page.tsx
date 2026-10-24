import Link from "next/link";
import { ArrowRight, BookOpenText, Check, CodeXml, Fingerprint, RefreshCw, Route, ScanSearch } from "lucide-react";
import { Brand } from "@/components/brand";
import { CareerChapterGallery } from "@/components/career-chapter-gallery";
import { LandingJourneyPreview } from "@/components/landing-journey-preview";
import { LandingScrollMotion } from "@/components/landing-scroll-motion";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skillById } from "@skillmetry/shared/data/catalog";
import styles from "./landing-v2.module.css";

const journey = [
  { title: "Choose a goal", copy: `Compare ${careers.length} curated paths and select a direction you can change later.`, tone: "sage" },
  { title: "Take an assessment", copy: "A supported, server-graded quiz is the only source of a numerical skill score.", tone: "sky" },
  { title: "Read the evidence", copy: "See what is measured, what is still unknown, and which prerequisites matter.", tone: "lilac" },
  { title: "Learn & reassess", copy: "Use a grounded learning action, practise, and reassess when you are ready.", tone: "apricot" }
] as const;

export default function Home() {
  const featuredAssessment = assessmentCatalog[0];
  const featuredSkill = skillById[featuredAssessment.skillId];

  return <main className={styles.page} data-landing-root>
    <LandingScrollMotion />
    <a href="#main-content" className={styles.skipLink}>Skip to content</a>
    <div className={styles.storyTrail} aria-hidden="true"><span /></div>

    <header className={styles.publicHeader}>
      <div className={`${styles.frame} ${styles.headerInner}`}>
        <Brand />
        <nav aria-label="Public navigation" className={styles.headerNav}>
          <a href="#how-it-works">How it works</a><a href="#career-paths">Career map</a>
          <a href="#practice-preview">Practice</a><a href="#why-evidence">Evidence</a>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/auth/sign-in" className={styles.textLink}>Sign in</Link>
          <Link href="/onboarding" className={`${styles.button} ${styles.buttonSmall}`}>Choose a direction</Link>
        </div>
      </div>
    </header>

    <div id="main-content">
      <section className={`${styles.frame} ${styles.hero}`} aria-labelledby="landing-hero-title" data-story-section="goal">
        <svg className={styles.heroAtlas} viewBox="0 0 720 420" aria-hidden="true">
          <path d="M18 310C106 310 126 102 240 102s113 208 222 208c91 0 89-146 202-146" />
          <path d="M18 360C132 360 142 182 281 182s114 99 211 99c84 0 101-84 190-84" />
          <path d="M92 382V62M202 382V62M312 382V62M422 382V62M532 382V62M642 382V62" />
          <circle cx="18" cy="310" r="8"/><circle cx="240" cy="102" r="8"/><circle cx="462" cy="310" r="8"/><circle cx="664" cy="164" r="8"/>
        </svg>
        <div className={styles.heroCopy} data-reveal>
          <p className={styles.heroEyebrow} data-reveal-part>Career &rarr; Learn &rarr; Practice &rarr; Evidence &rarr; Next step</p>
          <h1 id="landing-hero-title" data-reveal-part>Turn a career goal into a <span>learning path you can trust.</span></h1>
          <p className={styles.heroLead}>Skillmetry connects the choice you make, the concepts you study, and the quiz evidence you earn&mdash;without turning activity into a fabricated score.</p>
          <div className={styles.heroActions} data-reveal-part>
            <Link href="/onboarding" className={styles.button}>Choose a direction <ArrowRight aria-hidden="true" /></Link>
            <a href="#learning-canvas" className={styles.textLink}>Explore the connected canvas <ArrowRight aria-hidden="true" /></a>
          </div>
          <dl className={styles.heroProof} aria-label="Skillmetry catalog facts" data-reveal-part>
            <div><dt>{careers.length}</dt><dd>curated career paths</dd></div>
            <div><dt>{assessmentCatalog.length}</dt><dd>available assessment entries</dd></div>
            <div><dt><Fingerprint aria-hidden="true" /></dt><dd>Explore without an account. No score without a trusted quiz.</dd></div>
          </dl>
        </div>
        <div className={styles.heroPreview} data-reveal><LandingJourneyPreview /></div>
      </section>

      <section id="how-it-works" className={styles.journey} aria-labelledby="journey-title" data-story-section="loop">
        <div className={styles.frame}>
          <header className={styles.sectionIntro} data-reveal>
            <div><p className={styles.sectionKicker}>The connected learning canvas</p><h2 id="journey-title">Each move changes the next useful view.</h2></div>
            <p>The path carries context from career selection into learning and practice; only a completed supported quiz adds a numerical result.</p>
          </header>
          <ol className={styles.journeyTrack} aria-label="How Skillmetry works">
            {journey.map(item => <li key={item.title} className={styles[`tone${item.tone[0].toUpperCase()}${item.tone.slice(1)}`]} data-reveal>
              <span className={styles.journeyMarker} aria-hidden="true"><Check /></span><div><h3>{item.title}</h3><p>{item.copy}</p></div>
            </li>)}
          </ol>
        </div>
      </section>

      <section id="career-paths" className={`${styles.frame} ${styles.careers}`} aria-labelledby="careers-title" data-story-section="blueprint">
        <header className={`${styles.sectionIntro} ${styles.sectionIntroSplit}`} data-reveal>
          <div><p className={styles.sectionKicker}>01 / Set the direction</p><h2 id="careers-title">Start with a real career map.</h2></div>
          <p>Follow visible prerequisites from Skillmetry&apos;s actual catalog, then carry a selected direction into onboarding. It stays editable and never becomes a score.</p>
        </header>
        <div data-reveal><CareerChapterGallery /></div>
      </section>

      <section id="learning-preview" className={styles.learning} aria-labelledby="learning-title" data-story-section="learning">
        <div className={`${styles.frame} ${styles.learningLayout}`}>
          <header className={styles.learningIntro} data-reveal>
            <p className={styles.sectionKicker} data-reveal-part>02 / Develop the skill</p>
            <h2 id="learning-title" data-reveal-part>Let the path become the work.</h2>
            <p data-reveal-part>Resources and topic practice make the next lesson concrete. They remain clearly separate from verified assessment evidence.</p>
          </header>
          <div className={styles.learningDesk} data-ui data-reveal>
            <div className={styles.learningPrimary} data-reveal-part data-ui>
              <BookOpenText aria-hidden="true" /><span>Learn the concept</span><h3>{featuredSkill.label}</h3>
              <p>Open catalog-linked resources without changing assessment evidence.</p>
              <Link href={`/resources?skill=${encodeURIComponent(featuredSkill.id)}`}>Browse resources <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={styles.learningSequence}>
              <Link href={`/practice?skill=${encodeURIComponent(featuredSkill.id)}`} data-reveal-part data-ui><CodeXml aria-hidden="true" /><span><strong>Practise without a score</strong><small>Review ideas without claiming proficiency.</small></span><ArrowRight aria-hidden="true" /></Link>
              <Link href={`/assessments?assessment=${encodeURIComponent(featuredAssessment.id)}`} data-reveal-part data-ui><RefreshCw aria-hidden="true" /><span><strong>Assess when ready</strong><small>{featuredAssessment.questionCount} server-graded questions establish real evidence.</small></span><ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="practice-preview" className={styles.practice} aria-labelledby="practice-title" data-story-section="practice">
        <div className={`${styles.frame} ${styles.practiceLayout}`}>
          <div className={styles.practiceCode} data-reveal aria-label="Illustrative topic practice flow">
            <div className={styles.practiceCodeBar}><span /><span /><span /><strong>Topic practice / JavaScript</strong></div>
            <pre><code><span>const</span>{" nextStep = "}<span>await</span>{" chooseAction({\n  goal: \"Backend Developer\",\n  evidence: \"Not assessed\"\n});"}</code></pre>
            <div className={styles.practicePrompt}><span>Prompt</span><p>Explain what makes an API response useful to a client.</p><small>Practice responses guide reflection. They do not produce a skill score.</small></div>
          </div>
          <div className={styles.practiceCopy} data-reveal>
            <p className={styles.sectionKicker}>03 / Practise with context</p><h2 id="practice-title">Try the idea before you ask it to count.</h2>
            <p>Use guided exercises to work through a topic. When you want measured evidence, take an available assessment instead.</p>
            <div className={styles.practiceActions}><Link href={`/practice?skill=${encodeURIComponent(featuredSkill.id)}`} className={styles.button}>Open topic practice <CodeXml aria-hidden="true" /></Link><Link href={`/assessments?assessment=${encodeURIComponent(featuredAssessment.id)}`} className={styles.textLink}>View supported assessment <ArrowRight aria-hidden="true" /></Link></div>
          </div>
        </div>
      </section>

      <section id="why-evidence" className={styles.evidence} aria-labelledby="evidence-title" data-story-section="evidence">
        <div className={`${styles.frame} ${styles.evidenceLayout}`}>
          <div className={styles.evidenceCopy} data-reveal>
            <p className={styles.sectionKicker}>04 / Understand the evidence</p><h2 id="evidence-title">Evidence has a clear status.</h2>
            <p>A blank is not a failure, and completed learning is not automatically proof. Skillmetry shows the boundary instead of hiding it.</p>
            <Link href="/twin" className={styles.textLink}>See My Skill Progress <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.evidenceLedger} data-ui data-reveal aria-label="Evidence state examples">
            <div className={`${styles.ledgerRow} ${styles.ledgerMeasured}`} data-ui><span><ScanSearch aria-hidden="true" /></span><div><h3>Measured assessment evidence</h3><p>A numerical result appears only after a completed server-graded quiz.</p></div><strong>Measured after quiz</strong></div>
            <div className={`${styles.ledgerRow} ${styles.ledgerUnknown}`} data-ui><span aria-hidden="true">&mdash;</span><div><h3>Not assessed</h3><p>No trusted attempt means no numeric value. Unknown never falls back to 0%.</p></div><strong>Unknown</strong></div>
            <div className={`${styles.ledgerRow} ${styles.ledgerActivity}`} data-ui><span><Route aria-hidden="true" /></span><div><h3>Unscored learning activity</h3><p>Resources and practice can guide learning without changing assessed proficiency.</p></div><strong>Activity only</strong></div>
          </div>
        </div>
      </section>

      <section className={`${styles.frame} ${styles.close}`} aria-labelledby="close-title" data-story-section="close">
        <div data-reveal><p className={styles.sectionKicker}>Make the first useful move</p><h2 id="close-title">Choose a direction, not a guess.</h2><p>Choose a path now. Skillmetry will keep the evidence honest as you learn.</p></div>
        <Link href="/onboarding" className={styles.button} data-reveal>Choose my direction <ArrowRight aria-hidden="true" /></Link>
      </section>
    </div>

    <footer className={styles.footer}><div className={`${styles.frame} ${styles.footerInner}`}><Brand /><p>Quiz evidence guides learning. It is not a professional certification or hiring prediction.</p><nav aria-label="Footer navigation"><Link href="/feedback">Feedback</Link><Link href="/auth/sign-in">Sign in</Link></nav></div></footer>
  </main>;
}
