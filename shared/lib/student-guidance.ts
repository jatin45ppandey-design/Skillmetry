import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import { skillById } from "@skillmetry/shared/data/catalog";
import { curriculumCatalog, curriculumTopicById, getCurriculumLessonRoute } from "@skillmetry/shared/data/curriculum";
import type { StudyTask } from "@skillmetry/shared/lib/learning-plan";
import type { LearningRecommendation } from "@skillmetry/shared/types/domain";

export type CurriculumGuidance = {
  skillId: string;
  skillLabel: string;
  topicId: string | null;
  topicTitle: string | null;
  lessonHref: string | null;
  practiceHref: string | null;
  assessmentHref: string | null;
  resourcesHref: string;
};

export type StudentAction = {
  source: "resume" | "revision" | "study-task" | "recommendation" | "setup";
  title: string;
  label: string;
  href: string;
  explanation: string;
  activityNote?: string;
};

type ResumeInput = { courseTitle: string; lessonTitle: string; href: string };

function knownSkill(skillId: string) {
  return skillId in skillById && Boolean(curriculumCatalog.skills.find(entry => entry.skillId === skillId));
}

/** Maps a canonical skill to its first published lesson and topic practice. */
export function getCurriculumGuidance(skillId: string): CurriculumGuidance | null {
  if (!knownSkill(skillId)) return null;
  const path = curriculumCatalog.skills.find(entry => entry.skillId === skillId);
  const topicId = path?.topicIds[0] ?? null;
  const topic = topicId ? curriculumTopicById[topicId] : null;
  const lesson = topic ? curriculumCatalog.lessons.find(entry => entry.subtopicId === `${skillId}:subtopic:${topic.id.split(":topic:")[1]}`) : null;
  const practice = topic ? curriculumCatalog.practices.find(entry => entry.kind === "topic-practice" && entry.topicId === topic.id) : null;
  const assessment = assessmentCatalog.find(entry => entry.skillId === skillId);
  return {
    skillId,
    skillLabel: skillById[skillId].label,
    topicId: topic?.id ?? null,
    topicTitle: topic?.title ?? null,
    lessonHref: lesson ? getCurriculumLessonRoute(lesson.id) : null,
    practiceHref: practice?.href ?? null,
    assessmentHref: assessment ? `/assessments?assessment=${encodeURIComponent(assessment.id)}` : null,
    resourcesHref: `/resources?skill=${encodeURIComponent(skillId)}`
  };
}

export function getStudyTaskAction(task: Pick<StudyTask, "skillId" | "kind" | "title">): StudentAction {
  const guidance = getCurriculumGuidance(task.skillId);
  const fallback = guidance?.resourcesHref ?? "/resources";
  if (task.kind === "learn") return {
    source: "study-task", title: task.title, label: "Open lesson",
    href: guidance?.lessonHref ?? fallback,
    explanation: guidance?.topicTitle ? `Start with the published ${guidance.topicTitle} lesson.` : "Open the mapped learning material.",
    activityNote: "Completing a study task records learning activity only."
  };
  if (task.kind === "practice") return {
    source: "study-task", title: task.title, label: "Open topic practice",
    href: guidance?.practiceHref ?? guidance?.lessonHref ?? fallback,
    explanation: guidance?.topicTitle ? `Practice the published ${guidance.topicTitle} topic.` : "Open the mapped practice material.",
    activityNote: "Practice activity does not create a skill score."
  };
  return {
    source: "study-task", title: task.title, label: guidance?.assessmentHref ? "Open assessment" : "Review lesson",
    href: guidance?.assessmentHref ?? guidance?.lessonHref ?? fallback,
    explanation: guidance?.assessmentHref ? "Reassess only when you are ready for a new server-graded result." : "No assessment is available for this skill; review the published lesson instead.",
    activityNote: "Only a completed server-graded assessment can update quiz evidence."
  };
}

export function getRecommendationAction(recommendation: LearningRecommendation): StudentAction {
  const skillId = recommendation.skillId;
  const guidance = skillId ? getCurriculumGuidance(skillId) : null;
  if ((recommendation.action === "take-assessment" || recommendation.action === "reassess") && recommendation.assessment.available) {
    return { source: "recommendation", title: recommendation.action === "reassess" ? "Reassess when ready" : "Establish a baseline", label: recommendation.action === "reassess" ? "Open assessment" : "Take assessment", href: recommendation.assessment.href, explanation: recommendation.explanation };
  }
  const practice = recommendation.action === "strengthen-skill";
  return {
    source: "recommendation",
    title: skillId ? `Work on ${guidance?.skillLabel ?? skillId}` : "Explore your selected tool",
    label: practice ? "Open topic practice" : "Open lesson",
    href: practice ? guidance?.practiceHref ?? guidance?.lessonHref ?? guidance?.resourcesHref ?? "/resources" : guidance?.lessonHref ?? guidance?.resourcesHref ?? "/resources",
    explanation: recommendation.explanation,
    activityNote: "Learning activity is kept separate from quiz evidence."
  };
}

function isDueOrInProgress(task: Pick<StudyTask, "status" | "plannedDate">, today: string) {
  return task.status === "in_progress" || (task.status === "todo" && task.plannedDate <= today);
}

/** Selects a truthful next action without inferring progress or changing evidence. */
export function selectStudentNextAction(input: {
  today: string;
  resume?: ResumeInput | null;
  tasks?: readonly StudyTask[];
  revisionTasks?: readonly StudyTask[];
  recommendation?: LearningRecommendation | null;
  fallback?: Omit<StudentAction, "source"> | null;
  hasGoals: boolean;
}): StudentAction {
  const tasks = input.tasks ?? [];
  const revision = input.revisionTasks ?? [];
  const ordered = (items: readonly StudyTask[]) => [...items]
    .filter(task => task.status !== "completed" && task.status !== "skipped")
    .sort((a, b) => Number(b.status === "in_progress") - Number(a.status === "in_progress") || a.plannedDate.localeCompare(b.plannedDate) || a.position - b.position);
  const dueRevision = ordered(revision).find(task => isDueOrInProgress(task, input.today));
  if (dueRevision) return { ...getStudyTaskAction(dueRevision), source: "revision", title: `Review: ${dueRevision.title}` };
  const activeTask = ordered(tasks).find(task => task.status === "in_progress");
  if (activeTask) return getStudyTaskAction(activeTask);
  if (input.resume) return {
    source: "resume", title: `Resume ${input.resume.courseTitle}`, label: "Resume course", href: input.resume.href,
    explanation: `Continue with ${input.resume.lessonTitle}, the next unfinished published lesson.`,
    activityNote: "Lesson completion is self-reported learning activity, not a quiz score."
  };
  const dueTask = ordered(tasks).find(task => isDueOrInProgress(task, input.today));
  if (dueTask) return getStudyTaskAction(dueTask);
  const nextRevision = ordered(revision)[0];
  if (nextRevision) return { ...getStudyTaskAction(nextRevision), source: "revision", title: `Review: ${nextRevision.title}` };
  const nextTask = ordered(tasks)[0];
  if (nextTask) return getStudyTaskAction(nextTask);
  if (input.recommendation) return getRecommendationAction(input.recommendation);
  if (input.fallback) return { source: "recommendation", ...input.fallback };
  return input.hasGoals
    ? { source: "recommendation", title: "Choose a learning step", label: "Open My Path", href: "/roadmap", explanation: "Your goals are set. Explore the pathway to choose a practical next step." }
    : { source: "setup", title: "Choose a direction", label: "Set goals", href: "/onboarding", explanation: "Choose a career or skill focus before Skillmetry can make a relevant recommendation." };
}
