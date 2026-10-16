import { careers, skillById } from "@skillmetry/shared/data/catalog";
import { assessmentCatalog } from "@skillmetry/shared/data/assessment-catalog";
import type { LearningPreferences, SkillMap } from "@skillmetry/shared/types/domain";

export type StudyTaskKind = "learn" | "practice" | "reassess";
export type StudyTaskStatus = "todo" | "in_progress" | "completed" | "skipped";
export type StudyTask = {
  taskKey: string;
  skillId: string;
  title: string;
  kind: StudyTaskKind;
  status: StudyTaskStatus;
  estimatedMinutes: number;
  plannedDate: string;
  position: number;
};

/** UTC date-only values prevent browser timezones from altering saved plan IDs. */
export function weekStartUtc(date: Date): string {
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid planning date");
  const day = date.getUTCDay();
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - ((day + 6) % 7)));
  return monday.toISOString().slice(0, 10);
}
function offsetDate(monday: string, days: number) {
  const date = new Date(monday + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Deterministic suggestions, never grades or inferred mastery. */
export function buildWeeklyStudyPlan(input: {
  learning: LearningPreferences;
  trustedScores: Readonly<SkillMap>;
  hoursPerWeek: number;
  monday: string;
}): StudyTask[] {
  const { learning, trustedScores, monday } = input;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monday) || weekStartUtc(new Date(monday + "T00:00:00Z")) !== monday) {
    throw new Error("A UTC Monday is required");
  }
  const hours = Math.max(1, Math.min(80, Math.trunc(input.hoursPerWeek || 6)));
  let minutes = Math.min(hours * 60, 900);
  const role = careers.find(career => career.id === learning.primaryCareerId);
  const weightById = new Map(role?.skills.map(item => [item.skillId, item.weight]) ?? []);
  const focus = new Set<string>([...(role?.skills.map(item => item.skillId) ?? []), ...learning.selectedSkillIds]);
  const addPrerequisites = (id: string) => {
    const skill = skillById[id];
    if (!skill) return;
    for (const prerequisite of skill.prerequisites) {
      if (!focus.has(prerequisite)) { focus.add(prerequisite); addPrerequisites(prerequisite); }
    }
  };
  [...focus].forEach(addPrerequisites);
  const ordered = [...focus].filter(id => Boolean(skillById[id])).sort((a,b) => {
    const scoreA = Object.hasOwn(trustedScores,a) ? trustedScores[a] : null;
    const scoreB = Object.hasOwn(trustedScores,b) ? trustedScores[b] : null;
    const priority = (score: number|null, id: string) => (score !== null && score < 75 ? 200 - score : score === null ? 100 : 0) + (weightById.get(id) ?? 0);
    return priority(scoreB,b) - priority(scoreA,a) || a.localeCompare(b);
  });
  const tasks: StudyTask[] = [];
  for (const skillId of ordered) {
    if (minutes < 20 || tasks.length >= 10) break;
    const label = skillById[skillId].label;
    const observed = Object.hasOwn(trustedScores,skillId) ? trustedScores[skillId] : null;
    const kinds: StudyTaskKind[] = observed !== null && observed >= 75 ? ["practice"] : ["learn","practice","reassess"];
    for (const kind of kinds) {
      if (minutes < 20 || tasks.length >= 10) break;
      if (kind === "reassess" && !assessmentCatalog.some(item => item.skillId === skillId)) continue;
      const duration = Math.min(minutes, kind === "learn" ? 45 : kind === "practice" ? 30 : 30);
      const position = tasks.length;
      tasks.push({
        taskKey: `${monday}:${skillId}:${kind}`,
        skillId,
        kind,
        title: kind === "learn" ? `Study ${label} foundations` :
          kind === "practice" ? `Practice ${label} concepts` : `Reassess ${label} when ready`,
        status: "todo",
        estimatedMinutes: duration,
        plannedDate: offsetDate(monday, position % 7),
        position
      });
      minutes -= duration;
    }
  }
  return tasks;
}

export type SkillActivityState = "not_started" | "planned" | "learning" | "practiced" | "project_submitted";
/** Activity is never converted into assessment scores. */
export function resolveLearningActivity(skillId: string, tasks: readonly Pick<StudyTask,"skillId"|"kind"|"status">[],
  practiceSkillIds: ReadonlySet<string>, submittedMissionSkillIds: ReadonlySet<string>): SkillActivityState {
  if (submittedMissionSkillIds.has(skillId)) return "project_submitted";
  if (practiceSkillIds.has(skillId) || tasks.some(task => task.skillId===skillId && task.kind==="practice" && task.status==="completed")) return "practiced";
  if (tasks.some(task => task.skillId===skillId && (task.status==="in_progress" || task.status==="completed"))) return "learning";
  if (tasks.some(task => task.skillId===skillId && task.status!=="skipped")) return "planned";
  return "not_started";
}
