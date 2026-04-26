"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TodayFocusFab } from "@/components/home/today-focus-fab";
import { TodayFocusHeader } from "@/components/home/today-focus-header";
import { TodayFocusMainQuest } from "@/components/home/today-focus-main-quest";
import { TodayFocusHeaderXpSkeleton, TodayFocusTaskRowsSkeleton } from "@/components/home/today-focus-loading-skeleton";
import { todayFocusMockData } from "@/components/home/today-focus-mock-data";
import { TodayFocusQuickAddSheet } from "@/components/home/today-focus-quick-add-sheet";
import { TodayFocusTabBar } from "@/components/home/today-focus-tab-bar";
import { TodayFocusTaskSection } from "@/components/home/today-focus-task-section";
import { TodayFocusXpStats } from "@/components/home/today-focus-xp-stats";
import { NextBestQuestCard } from "@/components/home/next-best-quest-card";
import { useTodayDashboard } from "@/hooks/useTodayDashboard";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { usePomodoroCycle } from "@/hooks/usePomodoroCycle";
import { useToast } from "@/components/feedback/toast-provider";
import {
  actionResultToToast,
  completeQuestById,
  fetchTodaySuggestion,
  type NextBestQuestSuggestion,
} from "@/lib/client-api";
import {
  consumeDailyCue,
  consumeLevelUpCelebration,
  localDateKey,
  markCompletionToday,
  readLastCompletionDateKey,
  shouldShowStreakRisk,
} from "@/lib/retention-cues";
import {
  buildTodayHeaderData,
  profileToTodayXpData,
  snapshotToMainQuest,
  snapshotToTaskSections,
  snapshotToTodayStats,
} from "@/lib/today-dashboard-mappers";
import type { TodayDashboardSnapshot } from "@/types/today-dashboard";

const EMPTY_SNAPSHOT: TodayDashboardSnapshot = {
  profile: null,
  activeQuests: [],
  dailies: [],
  dailyKey: null,
  focusMinutesLast7d: 0,
};

const SECTION_EMPTY: Record<string, string> = {
  "in-progress": "No quests forged yet — start your first one ->",
  queued: "No active dailies right now.",
  claimed: "Completed quests stay in your quest history.",
};

export function TodayFocusShell() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { data, isLoading, error, refresh } = useTodayDashboard();
  const { state: focusState, start: startFocus, stop: stopFocus, hydratedWithActive } = useFocusTimer();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddSession, setQuickAddSession] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [optimisticDoneIds, setOptimisticDoneIds] = useState<Set<string>>(() => new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<NextBestQuestSuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(true);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [completionDateKey, setCompletionDateKey] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(
    () => {
      if (typeof window === "undefined" || typeof Notification === "undefined") {
        return "unsupported";
      }
      return Notification.permission;
    },
  );
  const completeInFlightRef = useRef(false);

  const snapshot = data ?? EMPTY_SNAPSHOT;
  const header = useMemo(() => buildTodayHeaderData(), []);
  const xp = useMemo(() => profileToTodayXpData(snapshot.profile), [snapshot.profile]);
  const stats = useMemo(() => snapshotToTodayStats(snapshot, snapshot.profile), [snapshot]);
  const mainQuest = useMemo(() => snapshotToMainQuest(snapshot), [snapshot]);
  const sections = useMemo(() => snapshotToTaskSections(snapshot), [snapshot]);

  const handleMenuClick = () => {};
  const handleSearchClick = () => {};
  const notifyCycle = useCallback(
    (title: string, message: string) => {
      pushToast({ tone: "info", title, message });
      if (notificationPermission === "granted" && typeof Notification !== "undefined") {
        new Notification(title, { body: message });
      }
    },
    [notificationPermission, pushToast],
  );

  const pomodoro = usePomodoroCycle({
    onFocusStart: async () => {
      await startFocus(mainQuest?.id);
      pushToast({
        tone: "info",
        title: "Pomodoro started",
        message: "Focus cycle is now running.",
      });
    },
    onFocusStop: async () => {
      await stopFocus();
      await refresh();
    },
    onFocusComplete: () => {
      notifyCycle("Focus cycle complete", "Break cycle started.");
    },
    onBreakComplete: () => {
      notifyCycle("Break complete", "Ready for your next focus cycle.");
    },
  });

  const handleStartFocus = useCallback(async () => {
    try {
      await pomodoro.start();
    } catch (e) {
      pushToast({
        tone: "danger",
        title: "Could not start Pomodoro",
        message: e instanceof Error ? e.message : "Please try again.",
      });
    }
  }, [pomodoro, pushToast]);
  const handleOpenQuest = useCallback(() => {
    if (mainQuest?.id) {
      router.push(`/quests/${mainQuest.id}/edit`);
    }
  }, [mainQuest?.id, router]);

  const handleTaskClick = useCallback(
    (taskId: string) => {
      router.push(`/quests/${taskId}/edit`);
    },
    [router],
  );

  const handleFabClick = () => {
    setQuickAddSession((n) => n + 1);
    setQuickAddOpen(true);
  };

  const handleCompleteTask = useCallback(
    async (questId: string) => {
      if (completingTaskId || completeInFlightRef.current) {
        return;
      }
      completeInFlightRef.current = true;
      setActionMessage(null);
      setCompletingTaskId(questId);
      setOptimisticDoneIds((prev) => new Set(prev).add(questId));
      try {
        const result = await completeQuestById(questId);
        if (!result.ok) {
          setOptimisticDoneIds((prev) => {
            const next = new Set(prev);
            next.delete(questId);
            return next;
          });
          setActionMessage(result.message ?? "Could not complete quest.");
          const toast = actionResultToToast(result, {
            fallbackErrorTitle: "Quest completion failed",
          });
          pushToast(toast);
          return;
        }
        pushToast({
          tone: "success",
          title: "Quest completed",
          message: "Progress and stats were updated.",
        });
        markCompletionToday();
        setCompletionDateKey(localDateKey());
        setOptimisticDoneIds(new Set());
        await refresh();
      } finally {
        setCompletingTaskId(null);
        completeInFlightRef.current = false;
      }
    },
    [completingTaskId, pushToast, refresh],
  );

  const handleQuickAddCreated = useCallback(() => {
    void refresh();
  }, [refresh]);

  const showError = Boolean(error && !data);
  const showCachedErrorHint = Boolean(error && data);
  const showSkeleton = isLoading && !data && !error;
  const hasCompletionToday = completionDateKey === localDateKey(now);
  const streakAtRisk = shouldShowStreakRisk(now, hasCompletionToday);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      setSuggestionLoading(true);
      setSuggestionError(null);
      const result = await fetchTodaySuggestion();
      if (!active) {
        return;
      }
      if (!result.ok || !result.data) {
        setSuggestionError(result.message ?? "Failed to load next-best quest suggestion.");
        setSuggestionLoading(false);
        return;
      }
      setSuggestion(result.data.suggestion ?? null);
      setSuggestionLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCompletionDateKey(readLastCompletionDateKey());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!snapshot.profile?.level) {
      return;
    }
    if (!consumeLevelUpCelebration(snapshot.profile.level)) {
      return;
    }
    pushToast({
      tone: "success",
      title: `Level up! LV ${snapshot.profile.level}`,
      message: "Your consistency is paying off.",
    });
  }, [pushToast, snapshot.profile?.level]);

  useEffect(() => {
    if (!data || isLoading || error || !snapshot.dailyKey) {
      return;
    }
    if (!consumeDailyCue(now)) {
      return;
    }
    pushToast({
      tone: "info",
      title: "New daily quests are live",
      message: "Review your queue and keep your streak alive.",
    });
  }, [data, error, isLoading, now, pushToast, snapshot.dailyKey]);

  useEffect(() => {
    if (!hydratedWithActive || !focusState.startedAt) {
      return;
    }
    pushToast({
      tone: "info",
      title: "Active focus session restored",
      message: "You have an active focus session — keep going or stop.",
    });
  }, [focusState.startedAt, hydratedWithActive, pushToast]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === "undefined") {
      return;
    }
    const next = await Notification.requestPermission();
    setNotificationPermission(next);
    if (next === "granted") {
      pushToast({
        tone: "success",
        title: "Notifications enabled",
        message: "Pomodoro cycle-end notifications are now active.",
      });
    }
  }, [pushToast]);

  return (
    <div className="relative min-h-screen">
      <main className="mx-auto w-full max-w-md pb-28">
        {showError ? (
          <div className="px-4 pt-5">
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              {error}
            </p>
            <button
              type="button"
              className="mt-2 rounded-full border px-4 py-2 text-sm font-medium"
              style={{ borderColor: "var(--color-border-default)" }}
              onClick={() => void refresh()}
            >
              Retry
            </button>
          </div>
        ) : showSkeleton ? (
          <>
            <TodayFocusHeaderXpSkeleton />
            <TodayFocusTaskRowsSkeleton />
          </>
        ) : (
          <>
            {showCachedErrorHint ? (
              <div className="px-4 pt-2">
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  Showing last known snapshot while network refresh is unavailable.
                </p>
                <button
                  type="button"
                  className="mt-1 rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                  onClick={() => void refresh()}
                >
                  Retry refresh
                </button>
              </div>
            ) : null}
            <TodayFocusHeader data={header} onMenuClick={handleMenuClick} onSearchClick={handleSearchClick} />
            <TodayFocusXpStats xp={xp} stats={stats} />
            {streakAtRisk ? (
              <div className="px-4 pt-2">
                <p
                  className="rounded-lg border px-3 py-2 text-xs font-medium"
                  style={{
                    borderColor: "var(--color-warning)",
                    background: "var(--color-warning-subtle)",
                    color: "var(--color-warning)",
                  }}
                >
                  Streak risk: no completion yet today. Finish one quest before day end.
                </p>
              </div>
            ) : null}

            {actionMessage ? (
              <p className="px-4 pt-2 text-sm" style={{ color: "var(--color-danger)" }}>
                {actionMessage}
              </p>
            ) : null}

            {suggestionLoading ? (
              <section className="px-4 pt-3" aria-label="Next best quest loading">
                <div
                  className="rounded-xl border p-4 text-sm"
                  style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
                >
                  <p style={{ color: "var(--color-text-secondary)" }}>Loading next-best quest...</p>
                </div>
              </section>
            ) : null}

            {!suggestionLoading && suggestionError ? (
              <section className="px-4 pt-3" aria-label="Next best quest error">
                <div
                  className="rounded-xl border p-4 text-sm"
                  style={{
                    borderColor: "var(--color-warning)",
                    background: "var(--color-warning-subtle)",
                    color: "var(--color-warning)",
                  }}
                >
                  <p>{suggestionError}</p>
                </div>
              </section>
            ) : null}

            {!suggestionLoading && !suggestionError && suggestion ? (
              <NextBestQuestCard suggestion={suggestion} />
            ) : null}

            {mainQuest ? (
              <TodayFocusMainQuest quest={mainQuest} onStartFocus={handleStartFocus} onOpenQuest={handleOpenQuest} />
            ) : (
              <section className="px-4 pt-4">
                <p
                  className="rounded-xl border px-4 py-6 text-center text-sm"
                  style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-secondary)" }}
                >
                  No active quest yet. Tap + to forge your first one.
                </p>
              </section>
            )}

            {focusState.status === "running" ? (
              <div className="px-4 pt-3">
                <div
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                  style={{ borderColor: "var(--color-primary)", background: "var(--color-primary-subtle)" }}
                >
                  <span style={{ color: "var(--color-text-primary)" }}>
                    Focus in progress · {Math.floor(focusState.elapsedSec / 60)}m {focusState.elapsedSec % 60}s
                  </span>
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 font-medium"
                    style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                    onClick={() => {
                      void (async () => {
                        try {
                          await stopFocus();
                          await refresh();
                          pushToast({
                            tone: "success",
                            title: "Focus session stopped",
                          });
                        } catch (e) {
                          pushToast({
                            tone: "danger",
                            title: "Could not stop focus session",
                            message: e instanceof Error ? e.message : "Please try again.",
                          });
                        }
                      })();
                    }}
                  >
                    Stop
                  </button>
                </div>
              </div>
            ) : null}

            <section className="px-4 pt-3">
              <div
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Pomodoro
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {pomodoro.phaseLabel}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    Focus (min)
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={pomodoro.state.focusMinutes}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                      onChange={(e) => pomodoro.setFocusMinutes(Number(e.target.value))}
                    />
                  </label>
                  <label className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    Break (min)
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={pomodoro.state.breakMinutes}
                      className="mt-1 w-full rounded border px-2 py-1 text-sm"
                      style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                      onChange={(e) => pomodoro.setBreakMinutes(Number(e.target.value))}
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {Math.floor(pomodoro.state.remainingSec / 60)}m {pomodoro.state.remainingSec % 60}s
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!pomodoro.state.isRunning ? (
                    <button
                      type="button"
                      className="rounded-full px-3 py-2 text-xs font-medium"
                      style={{ background: "var(--color-primary)", color: "var(--color-primary-on-accent)" }}
                      onClick={() => void handleStartFocus()}
                    >
                      Start cycle
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-full border px-3 py-2 text-xs font-medium"
                      style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                      onClick={() => {
                        void pomodoro.stop();
                      }}
                    >
                      Stop cycle
                    </button>
                  )}
                  {notificationPermission === "default" ? (
                    <button
                      type="button"
                      className="rounded-full border px-3 py-2 text-xs font-medium"
                      style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                      onClick={() => void requestNotificationPermission()}
                    >
                      Enable notifications
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            {sections.map((section) => (
              <TodayFocusTaskSection
                key={section.id}
                section={section}
                emptyMessage={SECTION_EMPTY[section.id] ?? "Nothing here yet."}
                onTaskClick={handleTaskClick}
                showCompleteToggle={section.id !== "claimed"}
                completingTaskId={completingTaskId}
                optimisticDoneIds={optimisticDoneIds}
                onCompleteTask={handleCompleteTask}
              />
            ))}
          </>
        )}
      </main>

      <TodayFocusFab onClick={handleFabClick} />
      <TodayFocusTabBar tabs={todayFocusMockData.tabs} />
      <TodayFocusQuickAddSheet
        key={quickAddSession}
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={handleQuickAddCreated}
      />
    </div>
  );
}
