import { notFound } from "next/navigation";
import { CurriculumLessonReader } from "@/components/curriculum-lesson-reader";
import { skillById } from "@skillmetry/shared/data/catalog";
import { getCurriculumLessonByRoute, getCurriculumLessonRoute } from "@skillmetry/shared/data/curriculum";

export default async function CurriculumLessonPage({ params }: {
  params: Promise<{ skillId: string; topicSlug: string; lessonSlug: string }>;
}) {
  const { skillId, topicSlug, lessonSlug } = await params;
  const context = getCurriculumLessonByRoute(skillId, topicSlug, lessonSlug);
  const skill = skillById[skillId];
  if (!context || !skill) notFound();
  return <CurriculumLessonReader skillId={skillId} skillLabel={skill.label}
    topic={context.topic} lesson={context.lesson} resources={context.resources}
    position={context.position} total={context.total}
    previousHref={context.previous ? getCurriculumLessonRoute(context.previous.id) : null}
    nextHref={context.next ? getCurriculumLessonRoute(context.next.id) : null}/>;
}
