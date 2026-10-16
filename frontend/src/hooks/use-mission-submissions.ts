"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import type { MissionSubmission } from "@skillmetry/shared/lib/mission-evidence";

export type MissionStorageStatus = "demo" | "loading" | "ready" | "error";

export function useMissionSubmissions() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [records, setRecords] = useState<MissionSubmission[]>([]);
  const [status, setStatus] = useState<MissionStorageStatus>("loading");

  useEffect(() => {
    if (!userId) {
      setOwnerId(null);
      setRecords([]);
      setStatus("demo");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    void fetch("/api/missions/submissions", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const body = await response.json() as { records?: MissionSubmission[] };
        if (!response.ok || !Array.isArray(body.records)) throw new Error("unavailable");
        return body.records;
      }).then(data => {
        if (controller.signal.aborted) return;
        setRecords(data);
        setOwnerId(userId);
        setStatus("ready");
      }).catch(() => {
        if (controller.signal.aborted) return;
        setOwnerId(userId);
        setRecords([]);
        setStatus("error");
      });
    return () => controller.abort();
  }, [userId]);

  function onSaved(record: MissionSubmission) {
    if (ownerId !== userId || !userId) return;
    setRecords(current => [record, ...current.filter(item => item.missionId !== record.missionId)]);
  }

  return {
    user,
    records: userId && ownerId === userId ? records : [],
    status: !userId ? "demo" : ownerId === userId ? status : "loading",
    onSaved
  };
}
