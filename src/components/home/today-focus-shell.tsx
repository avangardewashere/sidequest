"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TodayFocusFab } from "@/components/home/today-focus-fab";
import { TodayFocusHeader } from "@/components/home/today-focus-header";
import { TodayFocusMainQuest } from "@/components/home/today-focus-main-quest";
import { TodayFocusHeaderXpSkeleton } from "@/components/home/today-focus-loading-skeleton";
import { todayFocusMockData, type TodayTabItem } from "@/components/home/today-focus-mock-data";
import { TodayFocusQuickAddSheet } from "@/components/home/today-focus-quick-add-sheet";
import { TodayFocusTabBar } from "@/components/home/today-focus-tab-bar";
import { TodayFocusTaskSection } from "@/components/home/today-focus-task-section";
import { TodayFocusXpStats } from "@/components/home/today-focus-xp-stats";
import { useTodayDashboard } from "@/hooks/useTodayDashboard";
import { completeQuestById } from "@/lib/client-api";
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
};

const SECTION_EMPTY: Record<string, string> = {
  "in-progress": "No open quests yet — tap + to forge one.",
  queued: "No active dailies right now.",
  claimed: "Completed quests stay in your quest history.",
};

export function TodayFocusShell() {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useTodayDashboard();
  const [activeTab, setActiveTab] = useState<TodayTabItem["id"]>("today");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddSession, setQuickAddSession] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [optimisticDoneIds, setOptimisticDoneIds] = useState<Set<string>>(() => new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const completeInFlightRef = useRef(false);

  const snapshot = data ?? EMPTY_SNAPSHOT;
  const header = useMemo(() => buildTodayHeaderData(), []);
  const xp = useMemo(() => profileToTodayXpData(snapshot.profile), [snapshot.profile]);
  const stats = useMemo(() => snapshotToTodayStats(snapshot, snapshot.profile), [snapshot]);
  const mainQuest = useMemo(() => snapshotToMainQuest(snapshot), [snapshot]);
  const sections = useMemo(() => snapshotToTaskSections(snapshot), [snapshot]);

  const handleMenuClick = () => {};
  const handleSearchClick = () => {};
  const handleStartFocus = () => {};
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

  const handleTabChange = (tabId: TodayTabItem["id"]) => {
    setActiveTab(tabId);
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
          return;
        }
        setOptimisticDoneIds(new Set());
        await refresh();
      } finally {
        setCompletingTaskId(null);
        completeInFlightRef.current = false;
      }
    },
    [completingTaskId, refresh],
  );

  const handleQuickAddCreated = useCallback(() => {
    void refresh();
  }, [refresh]);

  const showError = Boolean(error && !data);
  const showSkeleton = isLoading && !data && !error;

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
          <TodayFocusHeaderXpSkeleton />
        ) : (
          <>
            <TodayFocusHeader data={header} onMenuClick={handleMenuClick} onSearchClick={handleSearchClick} />
            <TodayFocusXpStats xp={xp} stats={stats} />

            {actionMessage ? (
              <p className="px-4 pt-2 text-sm" style={{ color: "var(--color-danger)" }}>
                {actionMessage}
              </p>
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
      <TodayFocusTabBar tabs={todayFocusMockData.tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      <TodayFocusQuickAddSheet
        key={quickAddSession}
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={handleQuickAddCreated}
      />
    </div>
  );
}
