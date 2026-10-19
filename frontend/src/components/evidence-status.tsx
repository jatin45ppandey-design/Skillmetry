type EvidenceStatusProps = {
  state: "not-assessed" | "measured" | "illustrative" | "unavailable";
  score?: number;
};

export function EvidenceStatus({ state, score }: EvidenceStatusProps) {
  const label = state === "measured"
    ? `Measured ${score ?? 0}/100`
    : state === "not-assessed"
      ? "Not assessed"
      : state === "illustrative"
        ? "Illustrative example"
        : "Evidence unavailable";

  return <span className={`mb-truth-state mb-truth-state--${state}`}>{label}</span>;
}
