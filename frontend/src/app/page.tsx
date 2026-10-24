import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Code2,
  Zap,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LandingKineticArt } from "@/components/landing-kinetic-art";
import { LandingScrollMotion } from "@/components/landing-scroll-motion";
import styles from "./landing-v2.module.css";

const learningSteps = [
  { label: "Learn", detail: "Understand deeper", icon: BookOpen },
  { label: "Practice", detail: "Apply what you learn", icon: Code2 },
  { label: "Improve", detail: "See your progress", icon: ChartNoAxesColumnIncreasing },
  { label: "Grow", detail: "Build real skills for what’s next", icon: Zap },
];

export default function Home() {
  return (
    <main className={styles.page} data-landing-root>
      <LandingScrollMotion />
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>

      <header className={styles.publicHeader}>
        <div className={`${styles.frame} ${styles.headerInner}`}>
          <Brand />
          <nav aria-label="Public navigation" className={styles.headerNav}>
            <a href="#about" className={styles.headerExplore}>Explore</a>
            <Link href="/auth/sign-in" className={styles.headerSignIn}>
              Sign In <ArrowRight aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <div id="main-content">
        <section className={`${styles.frame} ${styles.hero}`} aria-labelledby="landing-hero-title" data-story-section="hero">
          <div className={styles.heroCopy}>
            <h1 id="landing-hero-title">
              <span>Learn</span>
              <span>beyond</span>
              <span className={styles.heroAccent}>limits.</span>
            </h1>
            <p className={styles.heroLead}>A smarter space to learn, practice, and grow with purpose.</p>
            <div className={styles.heroActions}>
              <Link href="/auth/sign-in" className={styles.primaryAction}>
                Sign In <ArrowRight aria-hidden="true" />
              </Link>
              <a href="#about" className={styles.exploreAction}>
                Explore <ArrowDownRight aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className={styles.heroArt}>
            <LandingKineticArt />
          </div>

        </section>

        <section id="about" className={styles.about} aria-labelledby="about-title" data-story-section="about">
          <div className={`${styles.frame} ${styles.aboutInner}`}>
            <div className={styles.aboutCopy} data-reveal>
              <p className={styles.eyebrow}>About</p>
              <h2 id="about-title">A clearer way<br />to <em>grow</em> as a developer.</h2>
              <p className={styles.aboutLead}>
                Skillmetry helps you find a learning direction, build skills through structured content,
                practice consistently, and understand your progress—all in one place.
              </p>
            </div>
            <div className={styles.aboutArtwork} data-reveal>
              <div className={styles.aboutHalo} aria-hidden="true" />
              <Image
                src="/images/landing/about-open-book.png"
                alt="An open book with learning pages rising from it"
                width={1536}
                height={1024}
                sizes="(max-width: 768px) 100vw, 52vw"
              />
            </div>
          </div>

          <div className={`${styles.frame} ${styles.learningStrip}`} aria-labelledby="learning-strip-title" data-reveal>
            <div className={styles.stripHeading}>
              <h3 id="learning-strip-title">Everything you need<br />to grow, in one place.</h3>
            </div>
            <div className={styles.steps}>
              <span className={styles.stepLine} aria-hidden="true" />
              {learningSteps.map(({ label, detail, icon: Icon }) => (
                <div className={styles.step} key={label}>
                  <span className={styles.stepIcon}><Icon aria-hidden="true" /></span>
                  <strong>{label}</strong>
                  <p>{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="get-started" className={styles.close} aria-labelledby="close-title" data-story-section="close">
          <div className={`${styles.frame} ${styles.closeShell}`}>
            <div className={styles.closeInner} data-reveal>
              <p className={styles.eyebrow}>Get started</p>
              <h2 id="close-title">Your <em>growth</em><br />starts here.</h2>
              <p>Sign in and take the next step in your learning journey.</p>
              <Link href="/auth/sign-in" className={styles.closeAction}>
                Sign In <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.growthArtwork} data-reveal>
              <Image
                src="/images/landing/growth-steps-plants.png"
                alt="Three ascending blocks with progressively larger plants"
                width={1736}
                height={906}
                loading="eager"
                sizes="(max-width: 768px) 100vw, 62vw"
              />
              <ol className={styles.growthLabels} aria-label="Learning growth sequence">
                <li>Learn</li>
                <li>Practice</li>
                <li>Grow</li>
              </ol>
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.frame} ${styles.footerInner}`}>
          <Brand />
          <nav aria-label="Footer navigation">
            <a href="#about">Explore</a>
            <Link href="/feedback">Feedback</Link>
            <Link href="/auth/sign-in">Sign In</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
