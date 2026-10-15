import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Skillmetry home">
      <span className="brand-mark" aria-hidden="true">
        <i/><i/><i/><i/>
      </span>
      <span className="brand-copy"><span className="brand-name">skillmetry<span className="brand-dot">.</span></span><small>signal</small></span>
    </Link>
  );
}
