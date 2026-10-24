import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { LandingScrollMotion } from "@/components/landing-scroll-motion";
import { LivingLearningPath } from "@/components/living-learning-path";
import styles from "./landing-v2.module.css";

export default function Home() {
  return <main className={styles.page} data-landing-root>
    <LandingScrollMotion />
    <a href="#main-content" className={styles.skipLink}>Skip to content</a>

    <header className={styles.publicHeader}>
      <div className={`${styles.frame} ${styles.headerInner}`}>
        <Brand />
        <nav aria-label="Public navigation" className={styles.headerNav}>
          <a href="#career-explorer">Explore Careers</a>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/auth/sign-in" className={styles.signIn}>Sign In</Link>
          <Link href="/onboarding" className={`${styles.button} ${styles.buttonCompact}`}>Get Started <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </header>

    <div id="main-content">
      <section className={`${styles.frame} ${styles.hero}`} aria-labelledby="landing-hero-title" data-story-section="goal">
        <div className={styles.heroCopy} data-reveal>
          <p className={styles.eyebrow}>A clearer way into tech</p>
          <h1 id="landing-hero-title">Stop guessing.<br /><span>Start building.</span></h1>
          <p className={styles.heroLead}>Find your direction. Build real skills. Make every step count.</p>
          <div className={styles.heroActions}>
            <Link href="/onboarding" className={styles.button}>Find Your Path <ArrowRight aria-hidden="true" /></Link>
            <a href="#career-explorer" className={styles.secondaryAction}>Explore Careers <span aria-hidden="true">↘</span></a>
          </div>
        </div>

        <div className={styles.heroVisual} data-reveal>
          <div className={styles.heroIndex} aria-hidden="true"><span>01</span><i /></div>
          <LivingLearningPath mode="hero" />
        </div>
      </section>

      <section id="career-explorer" className={styles.explorer} aria-labelledby="career-explorer-title" data-story-section="explorer">
        <div className={`${styles.frame} ${styles.explorerInner}`}>
          <header className={styles.explorerHeader} data-reveal>
            <p className={styles.eyebrow}>Fourteen directions. One place to begin.</p>
            <h2 id="career-explorer-title">Follow what<br />connects.</h2>
            <p>Choose a role and watch its real curriculum take shape. Select any skill to understand where it fits.</p>
          </header>
          <div className={styles.explorerCanvas} data-reveal>
            <LivingLearningPath mode="explorer" />
          </div>
        </div>
      </section>

      <section className={styles.close} aria-labelledby="close-title" data-story-section="close">
        <svg className={styles.closePath} viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-40 280 C 150 280, 170 70, 365 70 S 570 285, 760 200 S 950 55, 1240 55" />
          <circle cx="365" cy="70" r="10" /><circle cx="760" cy="200" r="10" /><circle cx="1130" cy="55" r="10" />
        </svg>
        <div className={`${styles.frame} ${styles.closeInner}`} data-reveal>
          <p className={styles.eyebrow}>The first step is a direction</p>
          <h2 id="close-title">Your next chapter<br />starts here.</h2>
          <Link href="/onboarding" className={`${styles.button} ${styles.buttonDark}`}>Get Started <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>

    <footer className={styles.footer}>
      <div className={`${styles.frame} ${styles.footerInner}`}>
        <Brand />
        <nav aria-label="Footer navigation"><a href="#career-explorer">Explore Careers</a><Link href="/feedback">Feedback</Link><Link href="/auth/sign-in">Sign In</Link></nav>
        <p>Learning direction, grounded in real curriculum.</p>
      </div>
    </footer>
  </main>;
}
