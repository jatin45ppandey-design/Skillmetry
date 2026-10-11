import Link from "next/link";
import { ArrowRight, GitBranch, Fingerprint, Gauge, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
const bars = [{ label: "Python", score: 80 },{ label: "ML Foundations", score: 50 },{ label: "SQL", score: 45 },{ label: "Deployment", score: 10 }];
export default function Home() {
  return <>
    <div className="hero"><div className="container">
      <nav className="topnav"><Brand/><div className="row"><Link className="btn btn-quiet" href="/auth/sign-in">Sign in</Link><Link className="btn btn-outline" href="/dashboard">Open demo <ArrowRight size={16}/></Link></div></nav>
      <div className="hero-grid"><div>
        <span className="tag"><Sparkles size={13}/> Beyond static career roadmaps</span>
        <h1>Don&apos;t just learn.<br/><span className="gradient-text">Know your trajectory.</span></h1>
        <p>Meet your evolving career digital twin. Map your real skills, find your next best move, and explore what your future could look like—before you commit.</p>
        <div className="hero-actions"><Link className="btn btn-primary" href="/onboarding">Create your skill twin <ArrowRight size={17}/></Link><Link className="btn btn-outline" href="/roadmap">Explore roadmap</Link></div>
        <p className="note" style={{ marginTop:23 }}>Free local prototype • No account or CV required • Sample data clearly labeled</p>
      </div><div className="visual" aria-label="Sample career twin dashboard">
        <div className="visual-heading"><div><div className="eyebrow">Career digital twin</div><h2 style={{ margin:"9px 0 0",fontSize:"1.17rem" }}>ML Engineer Track</h2></div><span className="tag">DEMO</span></div>
        <div className="muted small">Illustrative role-specific readiness index</div>
        <div style={{ display:"flex",alignItems:"baseline",gap:12,margin:"11px 0 18px" }}><span className="metric">48</span><span className="muted">/ 100</span><span style={{ marginLeft:"auto",color:"#5CE2BA",fontSize:".85rem" }}>↗ Potential growth</span></div>
        {bars.map(b=><div key={b.label}><div className="visual-row"><span>{b.label}</span><span>{b.score}%</span></div><div className="progress-track"><div className="progress-fill" style={{ width:`${b.score}%` }}/></div></div>)}
        <div className="row" style={{ marginTop:28,padding:"15px 13px",background:"#122B38",borderRadius:12,alignItems:"flex-start" }}><Gauge size={19} style={{ color:"#22D3EE",flexShrink:0 }}/><div><strong style={{ fontSize:".87rem" }}>What if you learned Docker?</strong><p className="note" style={{ margin:"6px 0 0" }}>See potential impact—without changing verified progress.</p></div></div>
      </div></div>
    </div></div>
    <div className="container"><div className="feature-strip">
      <div className="feature"><Fingerprint className="feature-icon" size={27}/><h3>An evolving skill twin</h3><p>Separate what you claim from what you demonstrate. Evidence and assessment matter.</p></div>
      <div className="feature"><GitBranch className="feature-icon" size={27}/><h3>Adaptive visual roadmaps</h3><p>See prerequisite connections, weak spots and the most useful next steps.</p></div>
      <div className="feature"><Gauge className="feature-icon" size={27}/><h3>What-if career simulation</h3><p>Try different learning missions and compare projected scores—not hiring probabilities.</p></div>
    </div></div>
    <footer className="footer"><div className="container">© Skillmetry • Starter prototype • Built for responsible career exploration</div></footer>
  </>;
}
