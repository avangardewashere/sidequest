"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  completeQuestById,
  createQuest,
  fetchDashboardData,
  loginWithCredentials,
  registerUser,
} from "@/lib/client-api";
import { getCompletionFeedback, getProgressPct } from "@/lib/formatters";
import type { AuthMode, Profile, Quest } from "@/types/dashboard";

type UseDashboardActionsParams = {
  isAuthenticated: boolean;
};

export function useDashboardActions({ isAuthenticated }: UseDashboardActionsParams) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Quest["difficulty"]>("easy");
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
    void loadData();
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

  async function handleCreateQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const created = await createQuest({ title, difficulty });
    if (!created) {
      setFeedback("Could not create quest.");
      return;
    }

    setTitle("");
    setFeedback("New quest added.");
    await loadData();
  }

  async function completeQuest(questId: string) {
    setFeedback("");
    const { ok, data } = await completeQuestById(questId);
    if (!ok) {
      setFeedback(data.error ?? "Could not complete quest.");
      return;
    }

    setFeedback(getCompletionFeedback(data));
    await loadData();
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
    title,
    setTitle,
    difficulty,
    setDifficulty,
    profile,
    dailies,
    activeQuests,
    completedQuests,
    feedback,
    progressPct,
    handleAuthSubmit,
    handleCreateQuest,
    completeQuest,
  };
}
