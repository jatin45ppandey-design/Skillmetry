"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity, ArrowUpRight, BookMarked, BriefcaseBusiness, Cloud, CloudOff,
  Compass, Fingerprint, FlaskConical, GitBranch, LogIn, Menu,
  Settings2, Target, UserRound, WandSparkles, X, BookOpen
} from "lucide-react";
import { Brand } from "@/components/brand";
import { useAuth } from "@/components/auth-provider";
import { useSkillmetry } from "@/store/use-skillmetry";

const primary = [
  { href: "/dashboard", label: "My Studio", short: "Studio", icon: Activity },
  { href: "/careers", label: "Explore", short: "Explore", icon: Compass },
  { href: "/roadmap", label: "My Path", short: "My Path", icon: GitBranch },
  { href: "/assessments", label: "Assess", short: "Assess", icon: BookOpen },
  { href: "/twin", label: "Evidence", short: "Evidence", icon: Fingerprint }
] as const;

const secondary = [
  { href: "/resources", label: "Learning resources", icon: BookMarked },
  { href: "/planner", label: "Weekly study planner", icon: BookOpen },
  { href: "/simulator", label: "What-if simulator", icon: FlaskConical },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/jobs", label: "Job analyzer", icon: BriefcaseBusiness },
  { href: "/passport", label: "Career passport", icon: WandSparkles },
  { href: "/settings", label: "Learning goals & settings", icon: Settings2 }
] as const;

function StudioLinks({ current, onNavigate }: { current: string; onNavigate?: () => void }) {
  return (
    <>
      {primary.map(({ href, label, icon: Icon }) => (
        <Link href={href} key={href} onClick={onNavigate}
          aria-current={current === href ? "page" : undefined}
          className={"studio-nav-link" + (current === href ? " is-current" : "")}>
          <Icon size={17} aria-hidden="true" />{label}
        </Link>
      ))}
    </>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerPanelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    function onDrawerKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
      if (event.key !== "Tab") return;
      const controls = drawerPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onDrawerKeyDown);
    return () => document.removeEventListener("keydown", onDrawerKeyDown);
  }, [drawerOpen, closeDrawer]);
  const { name, profileSource } = useSkillmetry();
  const { user, syncStatus } = useAuth();
  const current = [...primary, ...secondary].find(item => item.href === pathname);
  const accountHref = user ? "/account" : "/auth/sign-in";
  const cloudLabel = !user ? (profileSource === "demo" ? "Illustrative demo" : "Local profile")
    : syncStatus === "offline" ? "Offline" : syncStatus === "error" ? "Sync issue"
    : syncStatus === "saving" ? "Saving" : syncStatus === "loading" ? "Loading" : "Cloud synced";
  const CloudIcon = !user ? UserRound : syncStatus === "offline" || syncStatus === "error" ? CloudOff : Cloud;
  const isAssessmentPage = pathname === "/assessments";

  return (
    <div className={"studio-app" + (isAssessmentPage ? " studio-app--assessment" : "")}>
      <a href="#studio-main" className="studio-skip">Skip to main content</a>
      <header className="studio-header">
        <div className="studio-header-inner">
          <Brand />
          <nav className="studio-primary-nav" aria-label="Learning studio navigation">
            <StudioLinks current={pathname} />
            <details className="studio-more">
              <summary className={"studio-nav-link" + (secondary.some(item => item.href === pathname) ? " is-current" : "")}>
                More <span aria-hidden="true">⌄</span>
              </summary>
              <div className="studio-more-list">
                {secondary.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
                    <Icon size={17} aria-hidden="true" /> {label}
                  </Link>
                ))}
              </div>
            </details>
          </nav>
          <div className="studio-header-actions">
            <span className="studio-sync" title={cloudLabel}><CloudIcon size={14} aria-hidden="true" />{cloudLabel}</span>
            <Link className="studio-avatar" href={accountHref} aria-label={user ? "Open account" : "Sign in"}>
              {user ? <span>{(name || "S").slice(0, 1).toUpperCase()}</span> : <LogIn size={19} aria-hidden="true" />}
            </Link>
            <button type="button" className="studio-mobile-menu" ref={menuButtonRef} onClick={() => setDrawerOpen(true)}
              aria-label="Open all navigation" aria-expanded={drawerOpen} aria-controls="studio-navigation-drawer">
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="studio-contextbar">
        <div className="studio-contextbar-inner">
          <span className="studio-context-number">SKILLMETRY / YOUR SPACE</span>
          <span className="studio-context-separator" aria-hidden="true">/</span>
          <strong>{current?.label ?? "Learning Studio"}</strong>
          <span className="studio-context-trail" aria-hidden="true">✳ &nbsp; learn at your own pace</span>
        </div>
      </div>

      <main className="studio-main" id="studio-main">
        <div className="studio-content">{children}</div>
      </main>

      {drawerOpen ? (
        <div className="studio-drawer" id="studio-navigation-drawer" role="dialog" aria-modal="true" aria-label="All Skillmetry sections">
          <button type="button" className="studio-drawer-backdrop" onClick={closeDrawer} aria-label="Close navigation" />
          <aside className="studio-drawer-panel" ref={drawerPanelRef}>
            <div className="studio-drawer-heading">
              <Brand />
              <button type="button" className="studio-icon-button" ref={closeButtonRef} onClick={closeDrawer} aria-label="Close navigation"><X size={19} /></button>
            </div>
            <span className="studio-drawer-caption">YOUR CHAPTERS</span>
            <nav aria-label="All learning pages"><StudioLinks current={pathname} onNavigate={closeDrawer} /></nav>
            <span className="studio-drawer-caption">MORE TO EXPLORE</span>
            <nav aria-label="Additional learning pages">
              {secondary.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={closeDrawer}
                  className={"studio-nav-link" + (pathname === href ? " is-current" : "")}>
                  <Icon size={17} aria-hidden="true" />{label}
                </Link>
              ))}
            </nav>
            <Link className="studio-drawer-account" href={accountHref} onClick={() => setDrawerOpen(false)}>
              <UserRound size={18} /> {user ? "My account" : "Sign in"} <ArrowUpRight size={16} />
            </Link>
          </aside>
        </div>
      ) : null}

      <nav className="studio-bottom-nav" aria-label="Mobile learning navigation">
        {primary.slice(0, 4).map(({ href, short, icon: Icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
            className={pathname === href ? "is-current" : ""}>
            <Icon size={20} aria-hidden="true" /><span>{short}</span>
          </Link>
        ))}
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open more learning pages">
          <Menu size={21} aria-hidden="true" /><span>More</span>
        </button>
      </nav>
    </div>
  );
}
