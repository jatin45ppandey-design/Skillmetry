type EvidenceStatusProps =
  | { state: "measured"; score: number }
  | { state: "not-assessed" | "illustrative" | "unavailable"; score?: never };

export function EvidenceStatus(props: EvidenceStatusProps) {
  const measuredScore = props.state === "measured" && Number.isFinite(props.score) ? props.score : null;
  const effectiveState = props.state === "measured" && measuredScore === null ? "unavailable" : props.state;
  const label = effectiveState === "measured"
    ? `Measured ${measuredScore}/100`
    : effectiveState === "not-assessed"
      ? "Not assessed"
      : effectiveState === "illustrative"
        ? "Illustrative example"
        : "Evidence unavailable";

  return <span className={`mb-truth-state mb-truth-state--${effectiveState}`}>{label}</span>;
}
