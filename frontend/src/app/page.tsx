import Link from "next/link";
import { ArrowDown, ArrowRight, Fingerprint } from "lucide-react";
import { Brand } from "@/components/brand";
import { CareerChapterGallery } from "@/components/career-chapter-gallery";
import { LandingJourneyPreview } from "@/components/landing-journey-preview";
import { careers } from "@skillmetry/shared/data/catalog";
import { LandingScrollMotion } from "@/components/landing-scroll-motion";

export default function Home() {
  return (
    <main className="mb-landing">
      <LandingScrollMotion />
      <a href="#main-content" className="mb-skip-link">Skip to content</a>

      <header className="mb-public-header">
        <div className="mb-public-frame mb-public-header__inner">
          <Brand />
          <nav aria-label="Public navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#career-paths">Career paths</a>
            <a href="#why-evidence">Why evidence</a>
          </nav>
          <div className="mb-public-header__actions">
            <Link href="/auth/sign-in" className="mb-text-link">Sign in</Link>
            <Link href="/onboarding" className="mb-button mb-button--small">Choose a direction</Link>
          </div>
        </div>
      </header>

      <div id="main-content">
        <section className="mb-public-frame mb-hero" aria-labelledby="mb-hero-title">
          <div className="mb-hero__copy">
            <h1 id="mb-hero-title">Know what to learn next.</h1>
            <p>Skillmetry turns a career goal and supported quiz evidence into one grounded next action. Skills you have not assessed stay unknown—not zero.</p>
            <div className="mb-hero__actions">
              <Link href="/onboarding" className="mb-button">Build my learning path <ArrowRight aria-hidden="true" /></Link>
              <Link href="/dashboard" className="mb-text-link">See the example workspace <ArrowRight aria-hidden="true" /></Link>
            </div>
            <p className="mb-hero__trust"><Fingerprint aria-hidden="true" /> Explore without an account. Private assessment history requires sign-in.</p>
            <a href="#how-it-works" className="mb-hero__down">See how Skillmetry works <ArrowDown aria-hidden="true" /></a>
          </div>
          <LandingJourneyPreview />
        </section>

        <section id="how-it-works" className="mb-process" aria-labelledby="mb-process-title">
          <div className="mb-public-frame">
            <header className="mb-section-heading" data-reveal>
              <h2 id="mb-process-title">A clear learning loop.</h2>
              <p>Each step answers a different question. Activity and trusted evidence never blur together.</p>
            </header>
            <div className="mb-process__steps">
              <article data-reveal data-ui>
                <div><h3>Choose a direction</h3><p>Explore one of {careers.length} curated career paths and change it when your interests change.</p></div>
              </article>
              <article data-reveal data-ui>
                <div><h3>Measure what is available</h3><p>A supported, server-graded quiz creates evidence. Missing evidence remains “Not assessed.”</p></div>
              </article>
              <article data-reveal data-ui>
                <div><h3>Take one useful action</h3><p>Learn, practise, or reassess based on your goal, prerequisites, and actual evidence.</p></div>
              </article>
            </div>
          </div>
        </section>

        <section id="career-paths" className="mb-public-frame mb-careers" aria-labelledby="mb-careers-title">
          <header className="mb-section-heading mb-section-heading--split" data-reveal>
            <h2 id="mb-careers-title">Explore a direction.</h2>
            <p>These paths use Skillmetry&apos;s real catalog. Preview the skills, then choose only when the direction feels useful.</p>
          </header>
          <div data-reveal><CareerChapterGallery /></div>
        </section>

        <section id="why-evidence" className="mb-evidence-principle" aria-labelledby="mb-evidence-title">
          <div className="mb-public-frame mb-evidence-principle__inner">
            <h2 id="mb-evidence-title" data-reveal>Unknown is not zero.</h2>
            <div data-reveal>
              <p>Skillmetry separates what is measured from what is still unknown. It does not manufacture career-readiness percentages from learning activity, project checklists, or unfinished paths.</p>
              <Link href="/twin">See how evidence is shown <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className="mb-public-frame mb-final-cta" aria-labelledby="mb-final-title">
          <h2 id="mb-final-title" data-reveal>Start with a direction.</h2>
          <p data-reveal>Choose a path, see what can be assessed, and get one useful next step.</p>
          <Link href="/onboarding" className="mb-button" data-reveal>Build my learning path <ArrowRight aria-hidden="true" /></Link>
        </section>
      </div>

      <footer className="mb-public-footer">
        <div className="mb-public-frame mb-public-footer__inner">
          <Brand />
          <p>Quiz evidence guides learning. It is not a professional certification or hiring prediction.</p>
          <nav aria-label="Footer navigation"><Link href="/feedback">Feedback</Link><Link href="/auth/sign-in">Sign in</Link></nav>
        </div>
      </footer>
    </main>
  );
}
