"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { demoAssessmentHistory } from "@/data/demo-assessments";
import { latestScores } from "@skillmetry/shared/lib/assessments/grading";
import { useSkillmetry } from "@/store/use-skillmetry";

export function useAssessmentProfile() {
  const { user, assessmentHistory, assessmentStatus, assessmentMessage, refreshAssessments } = useAuth();
  const profileSource = useSkillmetry(state => state.profileSource);
  const illustrative = !user && profileSource === "demo";
  const attempts = useMemo(
    () => illustrative ? [...demoAssessmentHistory] : assessmentHistory,
    [assessmentHistory, illustrative]
  );
  const scores = useMemo(() => latestScores(attempts), [attempts]);

  return {
    attempts,
    scores,
    illustrative,
    status: illustrative ? "demo" as const : assessmentStatus,
    message: illustrative ? "Illustrative sample results. Sign in to take secure assessments." : assessmentMessage,
    refresh: refreshAssessments
  };
}
