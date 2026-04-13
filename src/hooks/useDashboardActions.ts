"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  completeQuestById,
  fetchDashboardData,
  loginWithCredentials,
  registerUser,
} from "@/lib/client-api";
import { getCompletionFeedback, getProgressPct } from "@/lib/formatters";
import type { AuthMode, Profile, Quest } from "@/types/dashboard";

type UseDashboardActionsParams = {
  isAuthenticated: boolean;
  onAfterQuestMutation?: () => void | Promise<void>;
};

export function useDashboardActions({
  isAuthenticated,
  onAfterQuestMutation,
}: UseDashboardActionsParams) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");

  const [quests, setQuests] = useState<Quest[]>([]);
  const [dailies, setDailies] = useState<Quest[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [feedback, setFeedback] = useState("");

  const activeQuests = useMemo(
    () => quests.filter((quest) => quest.status === "active"),
    [quests],
  );
  const completedQuests = useMemo(
    () => quests.filter((quest) => quest.status === "completed"),
    [quests],
  );
  const progressPct = useMemo(() => getProgressPct(profile), [profile]);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    const dashboardData = await fetchDashboardData();
    setQuests(dashboardData.quests);
    setProfile(dashboardData.profile);
    setDailies(dashboardData.dailies);
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        void loadData();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (mode === "register") {
      const registered = await registerUser({ email, displayName, password });
      if (!registered) {
        setFeedback("Registration failed. Try a different email.");
        return;
      }
    }

    const loggedIn = await loginWithCredentials({ email, password });
    if (loggedIn) {
      setFeedback(mode === "register" ? "Account created. Welcome!" : "Welcome back!");
      setPassword("");
      return;
    }

    setFeedback("Login failed. Check your credentials.");
  }

  async function completeQuest(questId: string) {
    setFeedback("");
    const { ok, data, message } = await completeQuestById(questId);
    if (!ok) {
      setFeedback(message ?? data?.error ?? "Could not complete quest right now.");
      return;
    }

    setFeedback(getCompletionFeedback(data ?? {}));
    await loadData();
    await onAfterQuestMutation?.();
  }

  return {
    email,
    setEmail,
    displayName,
    setDisplayName,
    password,
    setPassword,
    mode,
    setMode,
    profile,
    dailies,
    activeQuests,
    completedQuests,
    feedback,
    progressPct,
    handleAuthSubmit,
    completeQuest,
  };
}
