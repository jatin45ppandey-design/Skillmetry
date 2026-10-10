import { Orbit } from "lucide-react";
import Link from "next/link";
export function Brand() {
  return <Link href="/" className="brand" aria-label="Skillmetry home"><span className="brand-mark"><Orbit size={20} strokeWidth={2.2}/></span><span>skillmetry<span className="brand-dot">.</span></span></Link>;
}
