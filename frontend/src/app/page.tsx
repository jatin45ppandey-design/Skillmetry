import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { LandingKineticArt } from "@/components/landing-kinetic-art";
import { LandingScrollMotion } from "@/components/landing-scroll-motion";
import styles from "./landing-v2.module.css";

export default function Home() {
  return <main className={styles.page} data-landing-root>
    <LandingScrollMotion />
    <a href="#main-content" className={styles.skipLink}>Skip to content</a>

    <header className={styles.publicHeader}>
      <div className={`${styles.frame} ${styles.headerInner}`}>
        <Brand />
        <nav aria-label="Public navigation" className={styles.headerNav}>
          <a href="#about">Explore</a>
          <Link href="/auth/sign-in" className={styles.headerSignIn}>Sign In <ArrowRight aria-hidden="true" /></Link>
        </nav>
      </div>
    </header>

    <div id="main-content">
      <section className={`${styles.frame} ${styles.hero}`} aria-labelledby="landing-hero-title" data-story-section="hero">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span>Skillmetry</span> / Learn with direction</p>
          <h1 id="landing-hero-title"><span>Learn</span><span>beyond</span><span className={styles.heroAccent}>limits.</span></h1>
          <p className={styles.heroLead}>A smarter space to learn, practice, and grow with purpose.</p>
          <div className={styles.heroActions}>
            <Link href="/auth/sign-in" className={styles.primaryAction}>Sign In <ArrowRight aria-hidden="true" /></Link>
            <a href="#about" className={styles.exploreAction}>Explore <ArrowDownRight aria-hidden="true" /></a>
          </div>
        </div>

        <div className={styles.heroArt}>
          <LandingKineticArt />
        </div>

        <div className={styles.heroFootnote} aria-hidden="true">
          <span>Curiosity</span><i /><span>Direction</span><i /><span>Growth</span>
        </div>
      </section>

      <section id="about" className={styles.about} aria-labelledby="about-title" data-story-section="about">
        <div className={`${styles.frame} ${styles.aboutInner}`}>
          <div className={styles.aboutMarker} aria-hidden="true"><span>02</span><i /></div>
          <div className={styles.aboutLead} data-reveal>
            <p className={styles.eyebrow}>Built for purposeful learning</p>
            <h2 id="about-title">Keep curiosity<br /><em>moving.</em></h2>
          </div>
          <div className={styles.aboutCopy} data-reveal>
            <p>Skillmetry helps students discover a learning direction, learn through structured content, practise with purpose, and understand how they are progressing. It brings the next useful step into focus, so learning feels intentional, connected, and easier to continue.</p>
            <span>Direction becomes momentum.</span>
          </div>
          <div className={styles.aboutArtwork} aria-hidden="true" data-reveal>
            <span className={styles.aboutRing} />
            <span className={styles.aboutSlash} />
            <strong>S</strong>
            <small>Learn / practise / grow</small>
          </div>
        </div>
      </section>

      <section className={styles.close} aria-labelledby="close-title" data-story-section="close">
        <div className={styles.closeShape} aria-hidden="true"><span /><span /></div>
        <div className={`${styles.frame} ${styles.closeInner}`} data-reveal>
          <p className={styles.eyebrow}>Your space is ready</p>
          <h2 id="close-title">Your growth<br />starts here.</h2>
          <Link href="/auth/sign-in" className={styles.primaryAction}>Sign In <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>

    <footer className={styles.footer}>
      <div className={`${styles.frame} ${styles.footerInner}`}>
        <Brand />
        <nav aria-label="Footer navigation"><a href="#about">About</a><Link href="/feedback">Feedback</Link><Link href="/auth/sign-in">Sign In</Link></nav>
        <p>Learn with direction.</p>
      </div>
    </footer>
  </main>;
}
