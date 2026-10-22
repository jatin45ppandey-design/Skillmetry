"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Clock, Search } from "lucide-react";
import { careers, skillById, skills } from "@skillmetry/shared/data/catalog";
import { getCurriculumForSkill, getCurriculumLessonRoute } from "@skillmetry/shared/data/curriculum";
import type { CareerId, SkillId } from "@skillmetry/shared/types/domain";

function isSkillId(value: string | null): value is SkillId {
  return Boolean(value && skillById[value]);
}

export function CurriculumExplorer() {
  const params = useSearchParams();
  const initialSkill = isSkillId(params.get("skill")) ? params.get("skill") as SkillId : null;
  const initialCareer = careers.some(career => career.id === params.get("career")) ? params.get("career") as CareerId : "all";
  const [careerId, setCareerId] = useState<CareerId | "all">(initialCareer);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const selectedSkill = initialSkill ? skillById[initialSkill] : null;
  const visibleSkills = useMemo(() => {
    const careerSkills = careerId === "all" ? null : new Set(careers.find(career => career.id === careerId)?.skills.map(item => item.skillId));
    return skills.filter(skill => (!careerSkills || careerSkills.has(skill.id))
      && (!deferredQuery || `${skill.label} ${skill.description}`.toLowerCase().includes(deferredQuery)));
  }, [careerId, deferredQuery]);
  const path = selectedSkill ? getCurriculumForSkill(selectedSkill.id) : null;

  function explorerHref(skillId?: string) {
    const next = new URLSearchParams();
    if (skillId) next.set("skill", skillId);
    if (careerId !== "all") next.set("career", careerId);
    if (query.trim()) next.set("q", query.trim());
    return `/learn${next.size ? `?${next}` : ""}`;
  }

  return <div className="p2-learn-page">
    <header className="p2-learn-hero">
      <div><span className="v3-kicker">SKILL & TOPIC EXPLORER</span>
        <h1>Learn one skill in a clear sequence.</h1>
        <p>Choose a skill, move from foundations to advanced practice, and open concise lessons with reviewed references. Lesson activity never changes an assessment score.</p></div>
      <Link className="btn btn-outline" href="/courses">Browse all courses <ArrowRight aria-hidden="true"/></Link>
    </header>

    <section className="p2-explorer-controls" aria-label="Curriculum filters">
      <label><span>Career path</span><select value={careerId} onChange={event => setCareerId(event.target.value as CareerId | "all")}>
        <option value="all">All four careers</option>{careers.map(career => <option key={career.id} value={career.id}>{career.title}</option>)}
      </select></label>
      <label className="p2-search"><span>Find a skill</span><span><Search aria-hidden="true"/><input type="search" name="q" value={query}
        autoComplete="off" placeholder="Search skills…" onChange={event => setQuery(event.target.value)}/></span></label>
      <p><strong>{visibleSkills.length}</strong> of 18 skills</p>
    </section>

    {!selectedSkill ? <section className="p2-skill-index" aria-labelledby="p2-skill-index-title">
      <div className="p2-section-heading"><div><span className="v3-kicker">CHOOSE A STARTING POINT</span><h2 id="p2-skill-index-title">Skills with complete learning paths</h2></div><p>Each path contains 3 ordered topics and 3 original lessons.</p></div>
      {visibleSkills.length ? <div className="p2-skill-list">{visibleSkills.map(skill => {
        const skillPath = getCurriculumForSkill(skill.id);
        return <Link href={explorerHref(skill.id)} key={skill.id} className="p2-skill-row">
          <span><strong>{skill.label}</strong><small>{skill.description}</small></span>
          <span>{skillPath?.topics.length ?? 0} topics <ArrowRight aria-hidden="true"/></span>
        </Link>;
      })}</div> : <div className="p2-empty" role="status"><strong>No skill matches this search.</strong><p>Clear the search or choose another career path.</p></div>}
    </section> : path ? <section className="p2-path-view" aria-labelledby="p2-path-title">
      <nav className="p2-path-breadcrumb" aria-label="Curriculum breadcrumb"><Link href={explorerHref()}>All skills</Link><ArrowRight aria-hidden="true"/><span aria-current="page">{selectedSkill.label}</span></nav>
      <div className="p2-section-heading"><div><span className="v3-kicker">{selectedSkill.group} PATH</span><h2 id="p2-path-title">{selectedSkill.label}</h2><p>{selectedSkill.description}</p></div><Link className="btn btn-outline" href={`/resources?skill=${encodeURIComponent(selectedSkill.id)}`}>Filter its resources</Link></div>
      <ol className="p2-topic-sequence">{path.topics.map(({ topic, subtopics }, index) => {
        const lessons = subtopics.flatMap(item => item.lessons);
        const firstLesson = lessons[0];
        const href = firstLesson ? getCurriculumLessonRoute(firstLesson.id) : null;
        return <li key={topic.id}>
          <span className="p2-topic-line" aria-hidden="true"/>
          <article><header><span>{topic.difficulty}</span><small>Topic {index + 1} of {path.topics.length}</small></header>
            <h3>{topic.title}</h3><p>{topic.description}</p>
            <div className="p2-topic-meta"><span><BookOpen aria-hidden="true"/>{lessons.length} lesson</span><span><Clock aria-hidden="true"/>{lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0)} min</span><span>{topic.primaryResourceIds.length + topic.recommendedResourceIds.length} references</span></div>
            <ul>{topic.learningOutcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul>
            {href ? <Link className="btn btn-primary" href={href}>Open {firstLesson.title} <ArrowRight aria-hidden="true"/></Link> : <span className="p2-unavailable">Lesson unavailable</span>}
          </article>
        </li>;
      })}</ol>
    </section> : null}
    <p className="p2-trust-note">Saved completion uses the existing owner-scoped course-progress backend only when its approved migration and feature flag are enabled. Otherwise lessons remain fully readable and show no saved progress.</p>
  </div>;
}
