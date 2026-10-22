"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity, ArrowRight, BookMarked, BookOpen, BriefcaseBusiness, Cloud, CloudOff,
  Compass, Fingerprint, FlaskConical, GitBranch, LogIn, Menu, Settings2, Target,
  UserRound, WandSparkles, X
} from "lucide-react";
import { Brand } from "@/components/brand";
import { useAuth } from "@/components/auth-provider";
import { useSkillmetry } from "@/store/use-skillmetry";

const primary = [
  { href: "/dashboard", label: "Home", icon: Activity, matches: ["/dashboard"] },
  { href: "/roadmap", label: "My Path", icon: GitBranch, matches: ["/roadmap", "/careers"] },
  { href: "/resources", label: "Learn", icon: BookMarked, matches: ["/resources", "/courses"] },
  { href: "/assessments", label: "Practice", icon: Target, matches: ["/assessments", "/practice", "/lab", "/missions"] },
  { href: "/twin", label: "Progress", icon: Fingerprint, matches: ["/twin", "/passport"] }
] as const;

type SecondaryLink = { href: string; label: string; description: string; icon: typeof BookOpen };
const secondaryGroups: { label: string; items: SecondaryLink[] }[] = [
  { label: "Path & learning", items: [
    { href: "/careers", label: "Career directions", description: "Compare the 4 curated paths", icon: Compass },
    { href: "/courses", label: "Courses & lessons", description: "Read structured learning material", icon: BookOpen },
    { href: "/lab", label: "Guided coding practice", description: "Practise without changing quiz scores", icon: Target },
    { href: "/missions", label: "Project challenges", description: "Work through learner-reported projects", icon: Target }
  ] },
  { label: "Planning & advanced tools", items: [
    { href: "/planner", label: "Weekly planner", description: "Plan learning time", icon: BookOpen },
    { href: "/tutor", label: "Learning tutor", description: "Open curated guidance", icon: BookOpen },
    { href: "/jobs", label: "Job description analyzer", description: "Compare canonical skill requirements", icon: BriefcaseBusiness },
    { href: "/simulator", label: "Learning scenarios", description: "Explore hypothetical changes", icon: FlaskConical },
    { href: "/passport", label: "Career Passport", description: "Review private evidence presentation", icon: WandSparkles }
  ] },
  { label: "Settings", items: [
    { href: "/settings", label: "Goals & settings", description: "Update your learning direction", icon: Settings2 },
    { href: "/feedback", label: "Product feedback", description: "Record optional usability notes", icon: BookOpen }
  ] }
];
const secondary = secondaryGroups.flatMap(group => group.items);

function isPrimaryCurrent(pathname: string, matches: readonly string[]) {
  return matches.includes(pathname);
}

function routeFamily(pathname: string) {
  if (["/assessments", "/practice", "/lab", "/missions"].includes(pathname)) return "practice";
  if (["/careers", "/roadmap"].includes(pathname)) return "path";
  if (["/resources", "/courses"].includes(pathname)) return "learn";
  if (["/twin", "/passport"].includes(pathname)) return "progress";
  if (["/planner", "/tutor", "/jobs", "/simulator"].includes(pathname)) return "tools";
  if (["/settings", "/feedback"].includes(pathname)) return "account";
  return "home";
}

function PrimaryLinks({ current, onNavigate }: { current: string; onNavigate?: () => void }) {
  return primary.map(({ href, label, icon: Icon, matches }) => {
    const active = isPrimaryCurrent(current, matches);
    return (
      <Link href={href} key={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
        className={active ? "is-current" : undefined}>
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  });
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onDrawerKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
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
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onDrawerKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  const { name, profileSource } = useSkillmetry();
  const { user, syncStatus } = useAuth();
  const primaryArea = primary.find(item => isPrimaryCurrent(pathname, item.matches));
  const current = primaryArea ?? secondary.find(item => item.href === pathname);
  const accountHref = user ? "/account" : "/auth/sign-in";
  const cloudLabel = !user ? (profileSource === "demo" ? "Illustrative demo" : "Local profile")
    : syncStatus === "offline" ? "Offline"
      : syncStatus === "error" ? "Sync issue"
        : syncStatus === "saving" ? "Saving…"
          : syncStatus === "loading" ? "Loading…" : "Cloud synced";
  const CloudIcon = !user ? UserRound : syncStatus === "offline" || syncStatus === "error" ? CloudOff : Cloud;
  const isAssessmentPage = pathname === "/assessments";

  return (
    <div className={`studio-app mb-shell${isAssessmentPage ? " studio-app--assessment" : ""}`}
      data-route={pathname.slice(1) || "home"} data-area={routeFamily(pathname)}>
      <a href="#workspace-main" className="mb-skip-link">Skip to main content</a>
      <header className="mb-shell-header">
        <div className="mb-shell-header__inner">
          <Brand />
          <nav className="mb-primary-nav" aria-label="Primary learning navigation">
            <PrimaryLinks current={pathname} />
          </nav>
          <div className="mb-shell-actions">
            <span className="mb-sync-state" title={cloudLabel}><CloudIcon aria-hidden="true" />{cloudLabel}</span>
            <Link className="mb-account-link" href={accountHref} aria-label={user ? "Open account" : "Sign in"}>
              {user ? <span>{(name || "S").slice(0, 1).toUpperCase()}</span> : <LogIn aria-hidden="true" />}
            </Link>
            <button type="button" className="mb-menu-button" ref={menuButtonRef} onClick={() => setDrawerOpen(true)}
              aria-label="Open tools and settings" aria-expanded={drawerOpen} aria-controls="mb-navigation-drawer">
              <Menu aria-hidden="true" /><span>More</span>
            </button>
          </div>
        </div>
      </header>

      <main className="studio-main mb-shell-main" id="workspace-main">
        <div className="studio-content mb-shell-content" key={pathname}>{children}</div>
      </main>

      {drawerOpen ? (
        <div className="mb-drawer" id="mb-navigation-drawer" role="dialog" aria-modal="true" aria-label="Skillmetry tools and settings">
          <button type="button" className="mb-drawer__backdrop" onClick={closeDrawer} aria-label="Close navigation" />
          <aside className="mb-drawer__panel" ref={drawerPanelRef}>
            <header><Brand /><button type="button" ref={closeButtonRef} onClick={closeDrawer} aria-label="Close navigation"><X aria-hidden="true" /></button></header>
            <nav className="mb-drawer__primary" aria-label="Primary learning areas"><PrimaryLinks current={pathname} onNavigate={closeDrawer} /></nav>
            {secondaryGroups.map(group => (
              <section key={group.label} className="mb-drawer__group">
                <h2>{group.label}</h2>
                <nav aria-label={group.label}>
                  {group.items.map(({ href, label, description, icon: Icon }) => (
                    <Link key={href} href={href} onClick={closeDrawer} aria-current={pathname === href ? "page" : undefined}>
                      <Icon aria-hidden="true" />
                      <span><strong>{label}</strong><small>{description}</small></span>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  ))}
                </nav>
              </section>
            ))}
            <Link className="mb-drawer__account" href={accountHref} onClick={closeDrawer}>
              <UserRound aria-hidden="true" /> {user ? "My account" : "Sign in"} <ArrowRight aria-hidden="true" />
            </Link>
          </aside>
        </div>
      ) : null}

      <nav className="mb-bottom-nav" aria-label="Mobile learning navigation">
        <PrimaryLinks current={pathname} />
      </nav>

      <span className="mb-current-area" aria-live="polite">{current?.label ?? "Learning workspace"}</span>
    </div>
  );
}
