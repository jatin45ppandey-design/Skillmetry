"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpenCheck, ExternalLink, GraduationCap, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { EmptyState, StatusPill } from "@/components/workspace-ui";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { careers, skills, skillById } from "@skillmetry/shared/data/catalog";
import { learningResources } from "@skillmetry/shared/data/learning-resources";
import { learningTools, toolById } from "@skillmetry/shared/data/learning-catalog";
import { useAssessmentProfile } from "@/hooks/use-assessment-profile";
import { filterLearningResources, getPersonalizedResources, getResourceAvailability, isSafeResourceUrl } from "@skillmetry/shared/lib/resource-intelligence";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { CareerId, LearningResource, LearningResourceTarget, ResourceCost, ResourceDifficulty, ResourceType, SkillMap } from "@skillmetry/shared/types/domain";

type TargetFilter = "all" | `skill:${string}` | `tool:${string}`;
type SelectValue = "all" | ResourceDifficulty | ResourceType | ResourceCost;

function targetFilterFromSearch(search: ReturnType<typeof useSearchParams>): TargetFilter {
  const skillId = search.get("skill");
  const toolId = search.get("tool");
  if (skillId && skillById[skillId]) return `skill:${skillId}`;
  if (toolId && toolId in toolById && toolId !== "docker") return `tool:${toolId}`;
  return "all";
}

function targetFromFilter(value: TargetFilter): LearningResourceTarget | undefined {
  if (value.startsWith("skill:")) return { kind: "skill", skillId: value.slice(6) };
  if (value.startsWith("tool:")) return { kind: "tool", toolId: value.slice(5) as "git" | "github" | "postman" };
  return undefined;
}

function targetLabel(target: LearningResourceTarget) {
  return target.kind === "skill" ? skillById[target.skillId]?.label ?? target.skillId : toolById[target.toolId].label;
}

function assessmentForResource(resource: LearningResource, scores: Readonly<SkillMap>) {
  if (resource.target.kind !== "skill") return null;
  const skillId = resource.target.skillId;
  const assessment = assessmentCatalog.find(item => item.skillId === skillId);
  if (!assessment) return null;
  const score = scores[skillId];
  return { href: `/assessments?assessment=${encodeURIComponent(assessment.id)}`, label: Number.isFinite(score) ? "Retake assessment" : "Take assessment" };
}

function ResourceCard({ resource, reason, scores }: { resource: LearningResource; reason?: string; scores: Readonly<SkillMap> }) {
  const availability = getResourceAvailability(resource);
  const assessment = assessmentForResource(resource, scores);
  const safeUrl = availability.available && isSafeResourceUrl(resource.url);
  return <article className="resource-card"><div className="resource-card-top"><span className="resource-target">{targetLabel(resource.target)}</span><StatusPill tone={resource.difficulty === "advanced" ? "warning" : resource.difficulty === "intermediate" ? "accent" : "neutral"}>{resource.difficulty}</StatusPill></div><h2>{resource.title}</h2><p className="resource-provider">By {resource.provider}</p>{resource.discoverySource ? <p className="resource-provider">Discovered via <a href={resource.discoverySource.url} target="_blank" rel="noopener noreferrer">{resource.discoverySource.label}</a></p> : null}<p className="resource-description">{resource.description}</p><div className="resource-meta"><span>{resource.type}</span><span>{resource.cost}</span><span>{resource.verificationStatus === "verified" ? "Link verified" : "Link unverified"}</span></div><div className="resource-topic"><strong>{resource.topic}</strong>{resource.subtopics?.slice(0, 3).map(topic => <span key={topic}>{topic}</span>)}</div>{resource.careerIds?.length ? <div className="resource-topic"><strong>Relevant careers</strong>{resource.careerIds.map(id => <span key={id}>{careers.find(career => career.id === id)?.title ?? id}</span>)}</div> : null}{reason ? <p className="resource-reason"><ShieldCheck aria-hidden="true"/>{reason}</p> : <p className="resource-reason muted"><GraduationCap aria-hidden="true"/>Curated material for {targetLabel(resource.target)}.</p>}<div className="resource-card-actions">{safeUrl ? <a className="btn btn-primary" href={resource.url} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true"/>{resource.type === "roadmap" ? "View roadmap" : resource.type === "course" ? "Open course" : `Learn on ${resource.provider}`}</a> : <span className="resource-unavailable" role="status">{availability.available ? "External link unavailable." : availability.fallbackMessage}</span>}{assessment ? <Link href={assessment.href} className="text-link"><BookOpenCheck aria-hidden="true"/>{assessment.label}</Link> : null}</div></article>;
}

function ResourceExperience() {
  const searchParams = useSearchParams();
  const queryTarget = targetFilterFromSearch(searchParams);
  const { preferences } = useSkillmetry();
  const { scores, illustrative, status, message } = useAssessmentProfile();
  const [target, setTarget] = useState<TargetFilter>(queryTarget);
  const [careerFilter, setCareerFilter] = useState<"all" | CareerId>("all");
  const [difficulty, setDifficulty] = useState<SelectValue>("all");
  const [type, setType] = useState<SelectValue>("all");
  const [cost, setCost] = useState<SelectValue>("all");
  const [language, setLanguage] = useState("all");
  const [search, setSearch] = useState("");
  // React Router can preserve this client component across same-page deep links.
  // Keep the selected target in sync when a roadmap action changes the query.
  useEffect(() => {
    setTarget(queryTarget);
  }, [queryTarget]);
  const learning = preferences.learning;
  const selectedCareer = learning.primaryCareerId ? careers.find(career => career.id === learning.primaryCareerId) : null;
  const hasGoals = Boolean(learning.primaryCareerId || learning.selectedSkillIds.length || learning.selectedToolIds.length);
  const personalized = useMemo(() => getPersonalizedResources({ learning, trustedScores: scores, maxResults: 6 }), [learning, scores]);
  const recommendations = useMemo(() => {
    const allowed = new Set(filterLearningResources({ target: targetFromFilter(target), careerId: careerFilter === "all" ? undefined : careerFilter }).map(resource => resource.id));
    return personalized.filter(item => allowed.has(item.resource.id));
  }, [personalized, target, careerFilter]);
  const resources = useMemo(() => filterLearningResources({ target: targetFromFilter(target), careerId: careerFilter === "all" ? undefined : careerFilter, difficulties: difficulty === "all" ? undefined : [difficulty as ResourceDifficulty], types: type === "all" ? undefined : [type as ResourceType], costs: cost === "all" ? undefined : [cost as ResourceCost] }).filter(resource => language === "all" || resource.language === language).filter(resource => `${resource.title} ${resource.topic} ${resource.provider} ${resource.subtopics?.join(" ") ?? ""} ${resource.careerIds?.map(id => careers.find(career => career.id === id)?.title).join(" ") ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())), [careerFilter, cost, difficulty, language, search, target, type]);
  const recommendedById = new Map(recommendations.map(item => [item.resource.id, item]));
  const roadmapPicks = useMemo(() => {
    const careerId = careerFilter !== "all" ? careerFilter : learning.primaryCareerId ?? undefined;
    const relevant = filterLearningResources({ target: targetFromFilter(target), careerId, types: ["roadmap"] });
    const matchedById = new Set(relevant.map(resource => resource.id));
    const prioritized = getPersonalizedResources({ learning, trustedScores: scores, maxResults: 12 })
      .map(item => item.resource).filter(resource => matchedById.has(resource.id));
    return [...new Map([...prioritized, ...relevant].map(resource => [resource.id, resource])).values()].slice(0, 4);
  }, [careerFilter, learning, scores, target]);
  const roadmapCount = learningResources.filter(resource => resource.type === "roadmap").length;
  const context = target !== "all" ? targetLabel(targetFromFilter(target)!) : selectedCareer ? selectedCareer.title : hasGoals ? "Your selected learning goals" : "Curated learning catalog";

  function resetFilters() {
    setTarget("all");
    setCareerFilter("all");
    setDifficulty("all");
    setType("all");
    setCost("all");
    setLanguage("all");
    setSearch("");
  }

  return <><SectionTitle eyebrow="Learning resources" title={`Learn with purpose: ${context}`} description="Curated external material matched to your selected goals and trusted quiz context. Opening a resource never records completion or changes a score." action={<Link href="/roadmap" className="btn btn-quiet">Back to roadmap <ArrowUpRight aria-hidden="true"/></Link>}/>{illustrative ? <p className="resource-notice" role="status">Demo context uses illustrative assessment history. Resources remain curated external material.</p> : null}{status === "loading" ? <p className="resource-notice" role="status">Loading trusted assessment context. Catalog browsing remains available.</p> : null}{status === "error" || status === "offline" ? <p className="resource-notice warning" role="alert">{message ?? "Trusted assessment context is unavailable. Resource results do not estimate a score."}</p> : null}<section className="resource-overview"><div><span className="eyebrow">Personalized guidance</span><h2>{hasGoals ? "Recommended next resources" : "Explore the curated catalog"}</h2><p>{hasGoals ? "Reasons use your selected learning goals, prerequisite relationships, and the latest trusted quiz result when one exists." : "Choose a learning goal for tailored recommendations, or browse the verified catalog without creating a score."}</p></div><div className="resource-overview-actions">{!hasGoals ? <Link href="/settings" className="btn btn-primary">Choose learning goals</Link> : null}<Link href="/assessments" className="btn btn-outline">Review assessments</Link></div></section>{recommendations.length ? <section className="resource-recommendations" aria-labelledby="resource-recommendations-title"><div className="resource-section-head"><div><span className="eyebrow">Start here</span><h2 id="resource-recommendations-title">Personalized recommendations</h2></div><span>{recommendations.length} shown</span></div><div className="resource-grid">{recommendations.map(item => <ResourceCard key={item.resource.id} resource={item.resource} reason={item.reason} scores={scores}/>)}</div></section> : hasGoals ? <section className="resource-empty"><GraduationCap aria-hidden="true"/><strong>No personalized resource match for this filter</strong><p>Reset filters or browse the catalog below. Your learning goals and trusted results remain unchanged.</p></section> : null}{roadmapPicks.length ? <section className="resource-recommendations" aria-labelledby="curated-roadmaps-title"><div className="resource-section-head"><div><span className="eyebrow">Curated via awesome-roadmaps</span><h2 id="curated-roadmaps-title">Roadmaps for your learning direction</h2><p>External career paths complement your personal Skillmetry roadmap; they never replace assessment evidence.</p></div><span>{roadmapCount} paths in library</span></div><div className="resource-grid">{roadmapPicks.map(resource => <ResourceCard key={resource.id} resource={resource} reason={recommendedById.get(resource.id)?.reason} scores={scores}/>)}</div></section> : null}<section className="resource-catalog" aria-labelledby="resource-catalog-title"><div className="resource-section-head"><div><span className="eyebrow">Catalog discovery</span><h2 id="resource-catalog-title">Browse curated learning material</h2></div><span>{resources.length} results</span></div><div className="resource-overview-actions" role="group" aria-label="Quick resource filters"><button type="button" className={type === "all" ? "btn btn-primary" : "btn btn-quiet"} onClick={() => setType("all")}>All</button><button type="button" className={type === "roadmap" ? "btn btn-primary" : "btn btn-quiet"} onClick={() => setType("roadmap")}>Roadmaps</button><button type="button" className={type === "course" ? "btn btn-primary" : "btn btn-quiet"} onClick={() => setType("course")}>Courses</button><button type="button" className={type === "documentation" ? "btn btn-primary" : "btn btn-quiet"} onClick={() => setType("documentation")}>Docs</button><button type="button" className={type === "practice" ? "btn btn-primary" : "btn btn-quiet"} onClick={() => setType("practice")}>Practice</button></div><div className="resource-filters"><label><Search aria-hidden="true"/><span className="sr-only">Search resources</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search title, topic, provider"/></label><label><span>Target</span><select value={target} onChange={event => setTarget(event.target.value as TargetFilter)}><option value="all">All targets</option>{skills.map(skill => <option key={skill.id} value={`skill:${skill.id}`}>{skill.label}</option>)}{learningTools.filter(tool => tool.id !== "docker").map(tool => <option key={tool.id} value={`tool:${tool.id}`}>{tool.label}</option>)}</select></label><label><span>Career</span><select value={careerFilter} onChange={event => setCareerFilter(event.target.value as "all" | CareerId)}><option value="all">All careers</option>{careers.map(career => <option key={career.id} value={career.id}>{career.title}</option>)}</select></label><label><span>Level</span><select value={difficulty} onChange={event => setDifficulty(event.target.value as SelectValue)}><option value="all">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label><span>Format</span><select value={type} onChange={event => setType(event.target.value as SelectValue)}><option value="all">All formats</option><option value="roadmap">Roadmap</option><option value="documentation">Documentation</option><option value="tutorial">Tutorial</option><option value="video">Video</option><option value="course">Course</option><option value="practice">Practice</option></select></label><label><span>Cost</span><select value={cost} onChange={event => setCost(event.target.value as SelectValue)}><option value="all">All costs</option><option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option></select></label><label><span>Language</span><select value={language} onChange={event => setLanguage(event.target.value)}><option value="all">All languages</option><option value="English">English</option></select></label><button className="btn btn-quiet" type="button" onClick={resetFilters}><RotateCcw aria-hidden="true"/>Reset</button></div>{resources.length ? <div className="resource-grid catalog-grid">{resources.map(resource => { const recommendation = recommendedById.get(resource.id); return <ResourceCard key={resource.id} resource={resource} reason={recommendation?.reason} scores={scores}/>; })}</div> : <EmptyState title="No matching resources" description="Try another filter or reset the catalog. Skillmetry will not substitute unrelated material." actionLabel="Reset filters" actionHref="/resources"/>}</section></>;
}

function targetFilterFromResource(resource: LearningResource): TargetFilter {
  return resource.target.kind === "skill" ? `skill:${resource.target.skillId}` : `tool:${resource.target.toolId}`;
}

export default function ResourcesPage() {
  return <Suspense fallback={<p className="resource-notice" role="status">Loading learning resources.</p>}><ResourceExperience/></Suspense>;
}
