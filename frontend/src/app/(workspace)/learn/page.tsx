import { Suspense } from "react";
import { CurriculumExplorer } from "@/components/curriculum-explorer";

export default function LearnPage() {
  return <Suspense fallback={<p className="resource-notice" role="status">Loading curriculum…</p>}><CurriculumExplorer/></Suspense>;
}
