import { skills } from "@skillmetry/shared/data/catalog";
import type { SkillMap } from "@skillmetry/shared/types/domain";

/** A privacy-preserving, explainable vocabulary matcher, NOT AI job analysis. */
const vocabulary: Record<string, readonly { term: string; pattern: RegExp }[]> = {
  python: [{ term: "Python", pattern: /\bpython\b/i }],
  sql: [{ term: "SQL / relational databases", pattern: /\bsql\b|\bpostgres(?:ql)?\b|\bmysql\b|\brelational databases?\b/i }],
  math: [{ term: "Statistics / linear algebra", pattern: /\bstatistic(?:s|al)\b|\bprobability\b|\blinear algebra\b/i }],
  html: [{ term: "HTML / semantic markup", pattern: /\bhtml5?\b|\bsemantic markup\b/i }],
  css: [{ term: "CSS / responsive styling", pattern: /\bcss3?\b|\bscss\b|\bresponsive (?:web )?design\b/i }],
  javascript: [{ term: "JavaScript", pattern: /\bjavascript\b|\becmascript\b/i }],
  typescript: [{ term: "TypeScript", pattern: /\btypescript\b/i }],
  react: [{ term: "React", pattern: /\breact(?:\.js|js)?\b/i }],
  node: [{ term: "Node.js / Express", pattern: /\bnode(?:\.js|js)\b|\bexpress(?:\.js)?\b/i }],
  "rest-api": [{ term: "REST API", pattern: /\brest(?:ful)?\s+(?:apis?|services?)\b|\bapi endpoints?\b/i }],
  docker: [{ term: "Docker / containers", pattern: /\bdocker\b|\bcontaineri[sz]ation\b/i }],
  deployment: [{ term: "Deployment / CI/CD", pattern: /\bdeployment\b|\bci\/cd\b|\bcontinuous deployment\b/i }],
  accessibility: [{ term: "Accessibility", pattern: /\baccessibility\b|\bwcag\b|\ba11y\b/i }],
  testing: [{ term: "Testing", pattern: /\bunit tests?\b|\bintegration tests?\b|\btest automation\b|\bjest\b|\bvitest\b/i }],
  authentication: [{ term: "Authentication / authorization", pattern: /\bauthentication\b|\bauthorization\b|\boauth2?\b|\bjwt\b/i }],
  "data-processing": [{ term: "Data processing", pattern: /\bdata (?:processing|cleaning|transformation)\b|\bpandas\b/i }],
  "ml-foundations": [{ term: "Machine learning", pattern: /\bmachine learning\b|\bsupervised learning\b|\bscikit-learn\b/i }],
  "model-evaluation": [{ term: "Model evaluation", pattern: /\bmodel evaluation\b|\bcross.validation\b|\bprecision and recall\b/i }]
};

export type JobSkillMention = {
  skillId: string;
  skillLabel: string;
  matchedTerms: string[];
  score: number | null;
  evidenceState: "not-assessed" | "needs-practice" | "developing" | "strong-quiz-result";
};

export function matchJobSkillMentions(description: string, measuredScores: Readonly<SkillMap>): JobSkillMention[] {
  if (description.length > 12000) throw new Error("Job description exceeds the 12,000-character local limit.");
  return skills.flatMap(skill => {
    const matchedTerms = (vocabulary[skill.id] ?? []).filter(v => v.pattern.test(description)).map(v => v.term);
    if (!matchedTerms.length) return [];
    const current = measuredScores[skill.id];
    const score = typeof current === "number" && Number.isFinite(current) && current >= 0 && current <= 100 ? current : null;
    const evidenceState = score === null ? "not-assessed" :
      score < 50 ? "needs-practice" : score < 75 ? "developing" : "strong-quiz-result";
    return [{ skillId: skill.id, skillLabel: skill.label, matchedTerms, score, evidenceState }];
  });
}
