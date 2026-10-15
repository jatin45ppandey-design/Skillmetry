"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cloudProfileInputSchema } from "@skillmetry/shared/lib/profile-schema";
import type { AuthUser, ServerAuthState } from "@skillmetry/shared/types/auth";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { AssessmentAttempt, CareerId } from "@skillmetry/shared/types/domain";

export type CloudSyncStatus = "demo" | "loading" | "saving" | "synced" | "offline" | "error";
export type AssessmentLoadStatus = "demo" | "loading" | "ready" | "offline" | "error";

type AuthContextValue = {
  configured: boolean;
  user: AuthUser | null;
  syncStatus: CloudSyncStatus;
  syncMessage: string | null;
  assessmentHistory: AssessmentAttempt[];
  assessmentStatus: AssessmentLoadStatus;
  assessmentMessage: string | null;
  retrySync: () => void;
  refreshAssessments: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function currentProfilePayload() {
  const state = useSkillmetry.getState();
  return {
    displayName: state.name,
    careerId: state.careerId,
    onboardingCompleted: state.onboardingCompleted,
    preferences: state.preferences
  };
}

export function AuthProvider({ initialState, children }:{ initialState: ServerAuthState; children: React.ReactNode }) {
  const [user, setUser] = useState(initialState.user);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() => {
    if (!initialState.configured || !initialState.user) return "demo";
    return initialState.error ? "error" : "loading";
  });
  const [syncMessage, setSyncMessage] = useState<string | null>(initialState.error ? "Authentication is temporarily unavailable." : null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentAttempt[]>([]);
  // Never expose one account's assessment history while a different account loads.
  const [historyOwnerId, setHistoryOwnerId] = useState<string | null>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentLoadStatus>(initialState.user ? "loading" : "demo");
  const [assessmentMessage, setAssessmentMessage] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const userId = user?.id ?? null;
  const hasHydrated = useSkillmetry(state => state.hasHydrated);
  const syncReady = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void useSkillmetry.persist.rehydrate();
  }, []);

  useEffect(() => {
    setUser(initialState.user);
  }, [initialState.user]);

  const endAuthenticatedState = useCallback((message: string) => {
    setUser(null);
    setAssessmentHistory([]);
    setHistoryOwnerId(null);
    setAssessmentStatus("demo");
    setAssessmentMessage(null);
    useSkillmetry.getState().resetDemo();
    syncReady.current = false;
    setSyncStatus("demo");
    setSyncMessage(message);
  }, []);

  const saveProfile = useCallback(async () => {
    const payload = currentProfilePayload();
    if (!userId || !payload.onboardingCompleted) return true;
    if (!navigator.onLine) {
      setSyncStatus("offline");
      setSyncMessage("You are offline. Profile changes remain in this browser and will retry when you reconnect.");
      return false;
    }

    setSyncStatus("saving");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.status === 401) {
        endAuthenticatedState("Your session ended. Illustrative demo mode remains available.");
        return false;
      }
      if (!response.ok) throw new Error("save_failed");
      useSkillmetry.getState().setCloudOwner(userId);
      setSyncStatus("synced");
      setSyncMessage("Learning goals synced securely.");
      return true;
    } catch {
      setSyncStatus(navigator.onLine ? "error" : "offline");
      setSyncMessage(navigator.onLine ? "Cloud sync failed. Your local profile is unchanged." : "You are offline. Profile changes remain in this browser.");
      return false;
    }
  }, [endAuthenticatedState, userId]);

  const refreshAssessments = useCallback(async () => {
    if (!userId) {
      setAssessmentHistory([]);
      setHistoryOwnerId(null);
      setAssessmentStatus("demo");
      setAssessmentMessage(null);
      return;
    }
    if (!navigator.onLine) {
      setAssessmentStatus("offline");
      setAssessmentMessage("Assessment history is unavailable while offline. Previously loaded results remain visible.");
      return;
    }

    setAssessmentStatus("loading");
    setAssessmentMessage("Loading server-graded assessment history.");
    try {
      const response = await fetch("/api/assessments/history", { cache: "no-store" });
      if (response.status === 401) {
        endAuthenticatedState("Your session ended. Illustrative demo mode remains available.");
        return;
      }
      if (!response.ok) throw new Error("history_failed");
      const body = await response.json() as { attempts?: AssessmentAttempt[] };
      setAssessmentHistory(Array.isArray(body.attempts) ? body.attempts : []);
      setHistoryOwnerId(userId);
      setAssessmentStatus("ready");
      setAssessmentMessage(null);
    } catch {
      setAssessmentStatus(navigator.onLine ? "error" : "offline");
      setAssessmentMessage(navigator.onLine ? "Assessment history could not be loaded. Try again." : "Assessment history is unavailable while offline.");
    }
  }, [endAuthenticatedState, userId]);

  useEffect(() => {
    if (!initialState.configured || !userId || !hasHydrated) return;
    const authenticatedUserId = userId;
    let cancelled = false;
    syncReady.current = false;

    async function loadProfile() {
      setSyncStatus("loading");
      setSyncMessage("Loading your private cloud profile.");
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (response.status === 401) {
          if (!cancelled) endAuthenticatedState("Your session ended. Illustrative demo mode remains available.");
          return;
        }
        if (!response.ok) throw new Error("load_failed");
        const body = await response.json() as { profile?: unknown };

        if (body.profile) {
          const source = body.profile as Record<string, unknown>;
          const parsed = cloudProfileInputSchema.safeParse({
            displayName: source.displayName,
            careerId: source.careerId,
            onboardingCompleted: source.onboardingCompleted,
            preferences: source.preferences
          });
          if (!parsed.success || !parsed.data.onboardingCompleted) throw new Error("invalid_profile");
          useSkillmetry.getState().replaceCloudProfile({
            name: parsed.data.displayName,
            careerId: parsed.data.careerId as CareerId,
            preferences: parsed.data.preferences,
            cloudOwnerId: authenticatedUserId
          });
        } else {
          const localState = useSkillmetry.getState();
          if (localState.cloudOwnerId && localState.cloudOwnerId !== authenticatedUserId) {
            localState.resetDemo();
          } else if (localState.profileSource === "student" && localState.onboardingCompleted) {
            await saveProfile();
          }
        }

        if (!cancelled) {
          syncReady.current = true;
          setSyncStatus("synced");
          setSyncMessage(body.profile ? "Profile loaded from your private account." : "Cloud profile ready. Choose learning goals to begin.");
          await refreshAssessments();
        }
      } catch {
        if (!cancelled) {
          setSyncStatus(navigator.onLine ? "error" : "offline");
          setSyncMessage(navigator.onLine ? "Cloud profile could not be loaded. Local data is unchanged." : "You are offline. Illustrative demo mode remains available.");
        }
      }
    }

    void loadProfile();
    return () => { cancelled = true; };
  }, [endAuthenticatedState, hasHydrated, initialState.configured, refreshAssessments, retryVersion, saveProfile, userId]);

  useEffect(() => {
    if (!initialState.configured || !userId || !hasHydrated) return;
    const unsubscribe = useSkillmetry.subscribe((state, previous) => {
      if (!syncReady.current || state.profileSource !== "student" || !state.onboardingCompleted) return;
      if (state.name === previous.name && state.careerId === previous.careerId && state.preferences === previous.preferences && state.onboardingCompleted === previous.onboardingCompleted) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { void saveProfile(); }, 700);
    });
    return () => {
      unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [hasHydrated, initialState.configured, saveProfile, userId]);

  useEffect(() => {
    if (!initialState.configured) return;
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    void import("@/lib/supabase/client").then(({ createClient }) => {
      if (disposed) return;
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          endAuthenticatedState("Signed out. Illustrative demo mode is active.");
        } else if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? null });
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }).catch(() => {
      if (!disposed) {
        setSyncStatus("error");
        setSyncMessage("Cloud authentication is misconfigured. Illustrative demo mode remains available.");
      }
    });

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [endAuthenticatedState, initialState.configured]);

  useEffect(() => {
    const handleOffline = () => {
      if (userId) {
        setSyncStatus("offline");
        setSyncMessage("You are offline. Profile changes remain in this browser.");
        setAssessmentStatus("offline");
        setAssessmentMessage("Previously loaded assessment results remain visible.");
      }
    };
    const handleOnline = () => setRetryVersion(version => version + 1);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [userId]);

  const retrySync = useCallback(() => setRetryVersion(version => version + 1), []);
  return <AuthContext.Provider value={{
    configured: initialState.configured,
    user,
    syncStatus,
    syncMessage,
    assessmentHistory: historyOwnerId === userId ? assessmentHistory : [],
    assessmentStatus: userId && historyOwnerId !== userId ? "loading" : assessmentStatus,
    assessmentMessage: userId && historyOwnerId !== userId ? "Loading this account's assessment history." : assessmentMessage,
    retrySync,
    refreshAssessments
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
