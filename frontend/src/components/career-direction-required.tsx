import { EmptyState } from "@/components/workspace-ui";

/** Keeps role-specific views honest when a learner intentionally has no career goal. */
export function CareerDirectionRequired({ feature }: { feature: string }) {
  return <EmptyState
    title={`Choose a career direction for ${feature}`}
    description="Your skill and tool goals still work in the adaptive roadmap. This view uses role-specific context, so it activates only after you choose an optional primary career direction."
    actionHref="/settings"
    actionLabel="Choose learning goals"
  />;
}
