import { getCurriculumCoverageReport } from "@skillmetry/shared/lib/curriculum-coverage";

const report = getCurriculumCoverageReport();
const unresolvedByKind = report.unresolved.reduce<Record<string, number>>((counts, item) => {
  counts[item.kind] = (counts[item.kind] ?? 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({
  version: report.version,
  totals: report.totals,
  unresolvedByKind,
  skills: report.skills
}, null, 2));
