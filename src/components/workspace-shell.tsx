"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, BriefcaseBusiness, ChartNoAxesCombined, CircleHelp, Compass, Fingerprint, FlaskConical, GitBranch, Settings2, Target, UserRound, WandSparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { useSkillmetry } from "@/store/use-skillmetry";
const links = [
  { href:"/dashboard",label:"Dashboard",icon:Activity },
  { href:"/careers",label:"Career Explorer",icon:Compass },
  { href:"/roadmap",label:"Adaptive Roadmap",icon:GitBranch },
  { href:"/twin",label:"My Skill Twin",icon:Fingerprint },
  { href:"/simulator",label:"What-If Lab",icon:FlaskConical },
  { href:"/missions",label:"Missions",icon:Target },
  { href:"/assessments",label:"Assessments",icon:BookOpen },
  { href:"/jobs",label:"Job Analyzer",icon:BriefcaseBusiness },
  { href:"/passport",label:"Career Passport",icon:WandSparkles },
  { href:"/settings",label:"Settings",icon:Settings2 }
];
export function WorkspaceShell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const {name,baselineSource}=useSkillmetry();
  return <div className="workspace"><aside className="sidebar"><Brand/><div className="nav-list"><div className="nav-caption">Your workspace</div>
    {links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`nav-link ${pathname===href?"active":""}`}><Icon/>{label}</Link>)}
    </div><div style={{ marginTop:"auto",padding:"14px",border:"1px solid #294059",borderRadius:12 }}><div className="row"><UserRound size={17} style={{color:"#22D3EE"}}/><strong className="small">{name}</strong></div><p className="note" style={{ marginBottom:0 }}>{baselineSource === "demo" ? "Demo mode • sample data" : "Self-reported profile"}</p></div>
  </aside><main className="main"><header className="main-top"><div className="row"><ChartNoAxesCombined size={18} style={{color:"#22D3EE"}}/><span style={{fontWeight:700}}>Career command center</span></div><Link href="/onboarding" className="btn btn-outline" style={{fontSize:".78rem",padding:"8px 12px",minHeight:36}}><CircleHelp size={15}/> Edit profile</Link></header><div className="mobile-links">{links.map(l=><Link key={l.href} href={l.href}>{l.label}</Link>)}</div><div className="main-content">{children}</div></main></div>;
}
