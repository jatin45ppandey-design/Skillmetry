import Link from "next/link";
import { ChartNoAxesCombined } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Skillmetry home">
      <span className="brand-mark" aria-hidden="true">
        <ChartNoAxesCombined size={20} strokeWidth={2.1} />
      </span>
      <span className="brand-name">skillmetry<span className="brand-dot">.</span></span>
    </Link>
  );
}
