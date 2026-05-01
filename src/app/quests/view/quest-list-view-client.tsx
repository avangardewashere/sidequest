"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HabitChip } from "@/components/ui/habit-chip";
import { StreakFlame } from "@/components/ui/streak-flame";
import { TagChip, type TagChipTone } from "@/components/ui/tag-chip";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { fetchQuestsList } from "@/lib/client-api";
import { CAPTURE_CREATED_EVENT } from "@/lib/app-shell";
import { normalizeQuestCadence } from "@/lib/cadence";
import {
  type QuestCategoryFilter,
  type QuestListTab,
  type QuestSortOption,
  type QuestStatusFilter,
  computeChildCounts,
  filterQuestsForListView,
  isHabitQuest,
} from "@/lib/quest-selectors";
import type { Quest } from "@/types/dashboard";

function formatDueLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return null;
  }
}

const QuestListRow = memo(function QuestListRow({
  quest,
  childCount,
  listTab,
  activeTag,
  onTagClick,
  onComplete,
}: {
  quest: Quest;
  childCount: number;
  listTab: QuestListTab;
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  onComplete: (questId: string) => void;
}) {
  const habit = isHabitQuest(quest);
  const cadence = normalizeQuestCadence(quest);
  const dueLabel = formatDueLabel(quest.dueDate ?? undefined);

  return (
    <Card variant="surface" className="p-0">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base font-semibold ${quest.status === "completed" ? "text-[var(--color-text-tertiary)] line-through" : ""}`}
              style={{ color: quest.status === "completed" ? undefined : "var(--color-text-primary)" }}
            >
              {quest.title}
            </h3>
            {childCount > 0 ? (
              <Badge variant="tier" aria-label={`${childCount} subtasks`}>
                {childCount} sub
              </Badge>
            ) : null}
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {quest.description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="status">{quest.category}</Badge>
            <Badge variant="difficulty">{quest.difficulty}</Badge>
            <Badge variant="cadence">+{quest.xpReward} XP</Badge>
            {quest.status === "completed" ? (
              <Badge variant="status">Completed</Badge>
            ) : (
              <Badge variant="cadence">Active</Badge>
            )}
            {habit && listTab !== "todos" ? (
              <>
                <HabitChip cadence={cadence} streak={0} />
                <StreakFlame streak={0} />
              </>
            ) : null}
            {!habit && dueLabel ? (
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Due {dueLabel}
              </span>
            ) : null}
          </div>
          {(quest.tags?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {quest.tags!.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="border-0 bg-transparent p-0"
                  onClick={() => onTagClick(tag)}
                  aria-pressed={activeTag === tag.toLowerCase()}
                >
                  <TagChip label={tag} tone={activeTag === tag.toLowerCase() ? (0 as TagChipTone) : undefined} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {quest.status === "active" ? (
            <>
              <Link
                href={`/quests/${quest._id}`}
                className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                style={{
                  background: "var(--color-bg-elevated)",
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-border-default)",
                }}
              >
                Edit
              </Link>
              <Button type="button" variant="primary" size="sm" onClick={() => onComplete(quest._id)}>
                Complete
              </Button>
            </>
          ) : (
            <>
              <Link
                href={`/quests/${quest._id}`}
                className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                style={{
                  background: "var(--color-bg-elevated)",
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-border-default)",
                }}
              >
                Edit
              </Link>
              <span className="rounded-md border px-3 py-2 text-xs" style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}>
                Done
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
});

const TAB_LABELS: { id: QuestListTab; label: string }[] = [
  { id: "habits", label: "Habits" },
  { id: "todos", label: "Todos" },
  { id: "all", label: "All" },
];

export default function QuestListViewClient() {
  const { data: session, status } = useSession();
  const sessionUserId = session?.user?.id ?? null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listTab, setListTab] = useState<QuestListTab>("all");
  const [statusFilter, setStatusFilter] = useState<QuestStatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<QuestCategoryFilter>("all");
  const [sortOption, setSortOption] = useState<QuestSortOption>("newest");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const activeTag = useMemo(() => {
    const raw = searchParams.get("tag")?.trim().toLowerCase();
    return raw && raw.length > 0 ? raw : null;
  }, [searchParams]);

  const setTagFilter = useCallback(
    (tag: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag) params.set("tag", tag);
      else params.delete("tag");
      const qs = params.toString();
      router.replace(qs ? `/quests/view?${qs}` : "/quests/view", { scroll: false });
    },
    [router, searchParams],
  );

  const onTagClick = useCallback(
    (tag: string) => {
      const next = tag.trim().toLowerCase();
      if (activeTag === next) setTagFilter(null);
      else setTagFilter(next);
    },
    [activeTag, setTagFilter],
  );

  const reloadQuestList = useCallback(async () => {
    if (!sessionUserId) {
      return;
    }
    setListLoading(true);
    try {
      const list = await fetchQuestsList({
        status: statusFilter,
        category: categoryFilter,
        sort: sortOption,
      });
      setQuests(list);
    } finally {
      setListLoading(false);
    }
  }, [sessionUserId, statusFilter, categoryFilter, sortOption]);

  const { feedback, completeQuest } = useDashboardActions({
    isAuthenticated: Boolean(sessionUserId),
    onAfterQuestMutation: reloadQuestList,
  });

  useEffect(() => {
    let active = true;
    if (!sessionUserId) {
      return;
    }
    setListLoading(true);
    void fetchQuestsList({
      status: statusFilter,
      category: categoryFilter,
      sort: sortOption,
    })
      .then((list) => {
        if (active) setQuests(list);
      })
      .finally(() => {
        if (active) setListLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionUserId, statusFilter, categoryFilter, sortOption]);

  useEffect(() => {
    const onCapture = () => void reloadQuestList();
    window.addEventListener(CAPTURE_CREATED_EVENT, onCapture);
    return () => window.removeEventListener(CAPTURE_CREATED_EVENT, onCapture);
  }, [reloadQuestList]);

  const handleComplete = useCallback(
    (questId: string) => {
      void completeQuest(questId);
    },
    [completeQuest],
  );

  const childCounts = useMemo(() => computeChildCounts(quests), [quests]);

  const visibleQuests = useMemo(
    () =>
      filterQuestsForListView(quests, {
        tab: listTab,
        topLevelOnly: true,
        tag: activeTag,
      }),
    [quests, listTab, activeTag],
  );

  const rows = useMemo(
    () =>
      visibleQuests.map((quest) => (
        <QuestListRow
          key={quest._id}
          quest={quest}
          childCount={childCounts.get(quest._id) ?? 0}
          listTab={listTab}
          activeTag={activeTag}
          onTagClick={onTagClick}
          onComplete={handleComplete}
        />
      )),
    [visibleQuests, childCounts, listTab, activeTag, onTagClick, handleComplete],
  );

  if (status === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
        <p>Loading quests...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-6 text-black">
        <h1 className="text-2xl font-semibold">View Quests</h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Please sign in from the dashboard to view your quests.
        </p>
        <Link
          href="/"
          className="w-fit rounded-md border px-3 py-2 text-sm transition hover:brightness-95"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-on-accent)",
            borderColor: "var(--color-primary-hover)",
          }}
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6 pb-6">
        <div
          className="sticky top-0 z-20 -mx-6 border-b px-6 py-3 backdrop-blur-md"
          style={{
            borderColor: "var(--color-border-subtle)",
            background: "rgba(250, 250, 247, 0.92)",
          }}
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Quest list scope">
              {TAB_LABELS.map((t) => {
                const selected = listTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className="rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                    style={{
                      borderColor: selected ? "var(--color-primary)" : "var(--color-border-default)",
                      background: selected ? "var(--color-primary-subtle)" : "var(--color-bg-surface)",
                      color: "var(--color-text-primary)",
                    }}
                    onClick={() => setListTab(t.id)}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as QuestStatusFilter)}
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)", color: "var(--color-text-primary)" }}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as QuestCategoryFilter)}
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)", color: "var(--color-text-primary)" }}
              >
                <option value="all">All categories</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="health">Health</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as QuestSortOption)}
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)", color: "var(--color-text-primary)" }}
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="highest_xp">Sort: Highest XP</option>
                <option value="category">Sort: Category</option>
              </select>
            </div>
            {activeTag ? (
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: "var(--color-text-secondary)" }}>Filtered by tag:</span>
                <TagChip label={activeTag} />
                <Button type="button" variant="ghost" size="sm" onClick={() => setTagFilter(null)}>
                  Clear tag
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <section className="grid gap-3">
          {listLoading ? (
            <div
              className="rounded-xl border p-4 text-sm"
              style={{
                borderColor: "var(--color-border-subtle)",
                background: "var(--color-bg-surface)",
                color: "var(--color-text-secondary)",
              }}
            >
              Loading quests...
            </div>
          ) : visibleQuests.length ? (
            rows
          ) : (
            <div
              className="rounded-xl border p-4 text-sm"
              style={{
                borderColor: "var(--color-border-subtle)",
                background: "var(--color-bg-surface)",
                color: "var(--color-text-secondary)",
              }}
            >
              No quests match your current filters.
            </div>
          )}
        </section>

        {feedback ? (
          <div
            className="rounded-md border px-4 py-3"
            style={{
              borderColor: "#74d99c",
              background: "#dff8e8",
              color: "#1a6a39",
            }}
          >
            {feedback}
          </div>
        ) : null}
      </main>
    </div>
  );
}
