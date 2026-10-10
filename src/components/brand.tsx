import { Orbit } from "lucide-react";
import Link from "next/link";
export function Brand() {
  return <Link href="/" className="brand"><span className="brand-mark"><Orbit size={21} strokeWidth={2.2}/></span>skillmetry<span style={{ color: "#22D3EE", marginLeft:-8 }}>.</span></Link>;
}
