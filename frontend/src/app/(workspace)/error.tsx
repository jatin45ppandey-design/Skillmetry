"use client";

import { ErrorState } from "@/components/workspace-ui";

export default function WorkspaceError({reset}:{error:Error & {digest?:string};reset:()=>void}) {
  return <ErrorState onRetry={reset}/>;
}
