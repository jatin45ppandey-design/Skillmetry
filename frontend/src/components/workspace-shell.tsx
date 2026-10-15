"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, BookMarked, BookOpen, BriefcaseBusiness, ChevronRight, Cloud, CloudOff, Compass, Fingerprint, FlaskConical, GitBranch, LogIn, Menu, Settings2, Target, UserRound, WandSparkles, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Brand } from "@/components/brand";
import { StatusPill } from "@/components/workspace-ui";
import { useSkillmetry } from "@/store/use-skillmetry";

const links = [
  { href:"/dashboard",label:"Learning Command",shortLabel:"Home",icon:Activity,group:"Overview" },
  { href:"/roadmap",label:"Adaptive Roadmap",shortLabel:"Roadmap",icon:GitBranch,group:"Learning system" },
  { href:"/assessments",label:"Skill Assessments",shortLabel:"Assess",icon:BookOpen,group:"Learning system" },
  { href:"/resources",label:"Learning Resources",shortLabel:"Learn",icon:BookMarked,group:"Learning system" },
  { href:"/twin",label:"Digital Skill Twin",shortLabel:"Twin",icon:Fingerprint,group:"Learning system" },
  { href:"/careers",label:"Career Explorer",shortLabel:"Careers",icon:Compass,group:"Explore" },
  { href:"/simulator",label:"What-If Simulator",shortLabel:"Simulator",icon:FlaskConical,group:"Explore" },
  { href:"/missions",label:"Missions Workspace",shortLabel:"Missions",icon:Target,group:"Explore" },
  { href:"/jobs",label:"Job Analyzer",shortLabel:"Jobs",icon:BriefcaseBusiness,group:"Explore" },
  { href:"/passport",label:"Career Passport",shortLabel:"Passport",icon:WandSparkles,group:"Explore" },
  { href:"/settings",label:"Settings",shortLabel:"Settings",icon:Settings2,group:"Account" }
] as const;

function Navigation({pathname,onNavigate}:{pathname:string;onNavigate?:()=>void}) {
  const groups = ["Overview", "Learning system", "Explore", "Account"] as const;
  return <nav aria-label="Workspace navigation">{groups.map((group, index) => <div className="nav-group" key={group}><div className="nav-caption"><span>0{index + 1}</span>{group}</div><div className="nav-list">{links.filter(link => link.group === group).map(({href,label,icon:Icon}) => <Link key={href} href={href} onClick={onNavigate} aria-current={pathname === href ? "page" : undefined} className={`nav-link ${pathname === href ? "active" : ""}`}><Icon aria-hidden="true"/><span>{label}</span>{pathname === href ? <ChevronRight className="nav-chevron" aria-hidden="true"/> : null}</Link>)}</div></div>)}</nav>;
}

export function WorkspaceShell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const [menuOpen,setMenuOpen] = useState(false);
  const {name,profileSource} = useSkillmetry();
  const {user,syncStatus} = useAuth();
  const current = links.find(link => link.href === pathname);
  const mobileLinks = links.filter(link => ["/dashboard", "/roadmap", "/assessments", "/resources", "/twin"].includes(link.href));
  const cloudLabel = syncStatus === "offline" ? "Offline" : syncStatus === "error" ? "Sync issue" : syncStatus === "saving" ? "Saving" : syncStatus === "loading" ? "Loading" : "Cloud synced";
  const CloudIcon = syncStatus === "offline" || syncStatus === "error" ? CloudOff : Cloud;

  return <div className="workspace">
    <aside className="sidebar"><Brand/><Navigation pathname={pathname}/><Link href={user ? "/account" : "/auth/sign-in"} className="profile-card"><div className="profile-avatar"><UserRound aria-hidden="true"/></div><div><strong>{name || "Student"}</strong><span>{user ? cloudLabel : profileSource === "demo" ? "Illustrative demo" : "Local career profile"}</span></div></Link></aside>
    <main className="main">
      <header className="main-top"><button className="icon-button mobile-menu-button" type="button" onClick={()=>setMenuOpen(true)} aria-label="Open navigation" aria-expanded={menuOpen}><Menu/></button><div className="workspace-context"><span className="context-index" aria-hidden="true">{String(Math.max(1, links.findIndex(link => link.href === pathname) + 1)).padStart(2,"0")}</span><div><span>Skillmetry / Signal</span><strong>{current?.label ?? "Skillmetry"}</strong></div></div><div className="top-actions"><StatusPill tone={user ? syncStatus === "synced" ? "success" : syncStatus === "offline" || syncStatus === "error" ? "warning" : "accent" : profileSource === "demo" ? "warning" : "accent"}>{user ? <><CloudIcon aria-hidden="true"/>{cloudLabel}</> : profileSource === "demo" ? "Demo data" : "Local profile"}</StatusPill><Link href={user ? "/account" : "/auth/sign-in"} className="btn btn-quiet">{user ? <Cloud aria-hidden="true"/> : <LogIn aria-hidden="true"/>}{user ? "Account" : "Sign in"}</Link></div></header>
      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}><button className="drawer-backdrop" type="button" onClick={()=>setMenuOpen(false)} aria-label="Close navigation"/><aside><div className="drawer-head"><Brand/><button className="icon-button" type="button" onClick={()=>setMenuOpen(false)} aria-label="Close navigation"><X/></button></div><Navigation pathname={pathname} onNavigate={()=>setMenuOpen(false)}/></aside></div>
      <div className="main-content">{children}</div>
      <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">{mobileLinks.map(({href,shortLabel,icon:Icon}) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={pathname === href ? "active" : ""}><Icon aria-hidden="true"/><span>{shortLabel}</span></Link>)}</nav>
    </main>
  </div>;
}
