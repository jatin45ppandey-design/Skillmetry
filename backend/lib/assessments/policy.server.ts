import "server-only";

function optionalPositiveInteger(name: string) {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) throw new Error(`${name} must be a positive integer.`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  return value;
}

export function getAssessmentRetakePolicy() {
  const maxCompletions = optionalPositiveInteger("ASSESSMENT_MAX_COMPLETIONS");
  const windowMinutes = optionalPositiveInteger("ASSESSMENT_WINDOW_MINUTES");
  if ((maxCompletions === null) !== (windowMinutes === null)) {
    throw new Error("Assessment completion limits require both server-only policy values.");
  }
  return { maxCompletions, windowMinutes };
}
