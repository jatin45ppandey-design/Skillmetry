"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { AuthUser, ServerAuthState } from "@/lib/supabase/server";
import { cloudProfileInputSchema, trustedSkillSignalSchema, type TrustedSkillSignal } from "@/lib/profile-schema";
import { useSkillmetry } from "@/store/use-skillmetry";
import type { CareerId } from "@/types/domain";

export type CloudSyncStatus = "demo" | "loading" | "saving" | "synced" | "offline" | "error";

type AuthContextValue = {
  configured: boolean;
  user: AuthUser | null;
  syncStatus: CloudSyncStatus;
  syncMessage: string | null;
  trustedSignals: TrustedSkillSignal[];
  retrySync: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function currentProfilePayload() {
  const state = useSkillmetry.getState();
  return {
    displayName: state.name,
    careerId: state.careerId,
    onboardingCompleted: state.baselineSource === "self-reported",
    preferences: state.preferences,
    claimedSkills: state.skills
  };
}

export function AuthProvider({ initialState, children }:{ initialState: ServerAuthState; children: React.ReactNode }) {
  const [user, setUser] = useState(initialState.user);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() => {
    if (!initialState.configured || !initialState.user) return "demo";
    return initialState.error ? "error" : "loading";
  });
  const [syncMessage, setSyncMessage] = useState<string | null>(initialState.error ? "Authentication is temporarily unavailable." : null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [trustedSignals, setTrustedSignals] = useState<TrustedSkillSignal[]>([]);
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

  const saveProfile = useCallback(async () => {
    const payload = currentProfilePayload();
    if (!userId || payload.onboardingCompleted === false) return true;
    if (!navigator.onLine) {
      setSyncStatus("offline");
      setSyncMessage("You are offline. Changes remain in this browser and will retry when you reconnect.");
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
        setUser(null);
        setTrustedSignals([]);
        useSkillmetry.getState().resetDemo();
        setSyncStatus("demo");
        setSyncMessage("Your session ended. Local demo mode remains available.");
        return false;
      }
      if (!response.ok) throw new Error("save_failed");
      useSkillmetry.getState().setCloudOwner(userId);
      setSyncStatus("synced");
      setSyncMessage("Claimed profile synced securely.");
      return true;
    } catch {
      setSyncStatus(navigator.onLine ? "error" : "offline");
      setSyncMessage(navigator.onLine ? "Cloud sync failed. Your local profile is unchanged." : "You are offline. Changes remain in this browser.");
      return false;
    }
  }, [userId]);

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
          if (!cancelled) {
            setUser(null);
            setTrustedSignals([]);
            useSkillmetry.getState().resetDemo();
            setSyncStatus("demo");
            setSyncMessage("Your session ended. Local demo mode remains available.");
          }
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
            preferences: source.preferences,
            claimedSkills: source.claimedSkills
          });
          if (!parsed.success || !parsed.data.onboardingCompleted) throw new Error("invalid_profile");
          const rawSignals = Array.isArray(source.trustedSignals) ? source.trustedSignals : [];
          setTrustedSignals(rawSignals.flatMap(signal => {
            const result = trustedSkillSignalSchema.safeParse(signal);
            return result.success ? [result.data] : [];
          }));
          useSkillmetry.getState().replaceClaimedProfile({
            name: parsed.data.displayName,
            careerId: parsed.data.careerId as CareerId,
            skills: parsed.data.claimedSkills,
            preferences: parsed.data.preferences,
            cloudOwnerId: authenticatedUserId
          });
        } else {
          setTrustedSignals([]);
          const localState = useSkillmetry.getState();
          if (localState.cloudOwnerId && localState.cloudOwnerId !== authenticatedUserId) {
            localState.resetDemo();
          } else if (localState.baselineSource === "self-reported") {
            await saveProfile();
          }
        }

        if (!cancelled) {
          syncReady.current = true;
          setSyncStatus("synced");
          setSyncMessage(body.profile ? "Claimed profile loaded from your private account." : "Cloud profile ready. Complete onboarding to save your baseline.");
        }
      } catch {
        if (!cancelled) {
          setSyncStatus(navigator.onLine ? "error" : "offline");
          setSyncMessage(navigator.onLine ? "Cloud profile could not be loaded. Local data is unchanged." : "You are offline. Local demo mode remains available.");
        }
      }
    }

    void loadProfile();
    return () => { cancelled = true; };
  }, [hasHydrated, initialState.configured, retryVersion, saveProfile, userId]);

  useEffect(() => {
    if (!initialState.configured || !userId || !hasHydrated) return;
    const unsubscribe = useSkillmetry.subscribe((state, previous) => {
      if (!syncReady.current || state.baselineSource !== "self-reported") return;
      if (state.name === previous.name && state.careerId === previous.careerId && state.skills === previous.skills && state.preferences === previous.preferences) return;
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
          setUser(null);
          setTrustedSignals([]);
          useSkillmetry.getState().resetDemo();
          syncReady.current = false;
          setSyncStatus("demo");
          setSyncMessage("Signed out. Local demo mode is active.");
        } else if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? null });
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }).catch(() => {
      if (!disposed) {
        setSyncStatus("error");
        setSyncMessage("Cloud authentication is misconfigured. Local demo mode remains available.");
      }
    });

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [initialState.configured]);

  useEffect(() => {
    const handleOffline = () => {
      if (userId) {
        setSyncStatus("offline");
        setSyncMessage("You are offline. Changes remain in this browser.");
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
  return <AuthContext.Provider value={{ configured: initialState.configured, user, syncStatus, syncMessage, trustedSignals, retrySync }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
