"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarHeatmap, type HeatmapCell } from "@/components/ui/calendar-heatmap";
import { Card } from "@/components/ui/card";
import { HabitChip } from "@/components/ui/habit-chip";
import { NoteCard } from "@/components/ui/note-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Sheet } from "@/components/ui/sheet";
import { StreakFlame } from "@/components/ui/streak-flame";
import { LinkPicker } from "@/components/ui/link-picker";
import { TagChip } from "@/components/ui/tag-chip";
import { useToast } from "@/components/feedback/toast-provider";
import {
  actionResultToToast,
  completeQuestById,
  createChildQuest,
  createQuestLink,
  createQuestNote,
  deleteQuestLink,
  deleteQuestNote,
  fetchQuestChildren,
  fetchQuestHistory,
  fetchQuestInsights,
  fetchQuestsLinkedFrom,
  getQuestById,
  recoverStreak,
  reorderChildQuests,
  searchQuests,
  undoQuestCompletion,
  updateQuestTags,
} from "@/lib/client-api";
import { normalizeQuestCadence, streakFromLogs, type CompletionHistoryPoint } from "@/lib/cadence";
import { formatCadenceShort } from "@/lib/format-cadence-label";
import { completionToastCopy } from "@/lib/formatters";
import { isHabitQuest } from "@/lib/quest-selectors";
import type { Quest, QuestLinkKind, QuestNote } from "@/types/dashboard";
import type { QuestInsightsHabitPayload, QuestInsightsWeekRow } from "@/types/quest-insights";

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

function normalizeNote(n: QuestNote): QuestNote {
  return {
    id: typeof n.id === "string" ? n.id : String(n.id),
    body: n.body,
    createdAt:
      typeof n.createdAt === "string"
        ? n.createdAt
        : new Date(n.createdAt as unknown as Date).toISOString(),
    kind: n.kind === "reflection" ? "reflection" : "note",
  };
}

function normalizeQuestBrain(q: Quest): Quest {
  return {
    ...q,
    notes: (q.notes ?? []).map((n) => normalizeNote(n)),
    links: (q.links ?? []).map((l) => ({
      id: typeof l.id === "string" ? l.id : String(l.id),
      questId: typeof l.questId === "string" ? l.questId : String(l.questId),
      kind: l.kind,
    })),
  };
}

export default function QuestDetailClient() {
  const params = useParams<{ id: string }>();
  const questId = params.id;
  const { data: session, status } = useSession();
  const sessionUserId = session?.user?.id ?? null;
  const { pushToast } = useToast();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [children, setChildren] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<{ date: string; xp: number; completedAt: string }[]>([]);
  const [parentQuest, setParentQuest] = useState<Quest | null>(null);
  const [siblings, setSiblings] = useState<Quest[]>([]);
  const [linkTitles, setLinkTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [childSheetOpen, setChildSheetOpen] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [newChildDescription, setNewChildDescription] = useState("");
  const [childBusy, setChildBusy] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [tagsBusy, setTagsBusy] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const linkPickerFieldId = useId();
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [linkSearchOptions, setLinkSearchOptions] = useState<{ id: string; title: string }[]>([]);
  const [newLinkKind, setNewLinkKind] = useState<QuestLinkKind>("related");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkedFrom, setLinkedFrom] = useState<{ _id: string; title: string }[]>([]);
  const linkSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hierarchyOpen, setHierarchyOpen] = useState(true);
  const [selectedHabitUndoDate, setSelectedHabitUndoDate] = useState<string | null>(null);
  const [undoBusy, setUndoBusy] = useState(false);
  const [completeBusy, setCompleteBusy] = useState(false);
  const [insights, setInsights] = useState<QuestInsightsHabitPayload | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [recoverBusy, setRecoverBusy] = useState(false);
  const [noteFilter, setNoteFilter] = useState<"all" | "reflection">("all");

  const reload = useCallback(async () => {
    if (!sessionUserId || !questId) {
      return;
    }
    setLoading(true);
    try {
      const q = await getQuestById(questId);
      if (!q) {
        setNotFound(true);
        setQuest(null);
        return;
      }
      setNotFound(false);
      const normalized = normalizeQuestBrain(q);
      setQuest(normalized);
      setTagDraft((normalized.tags ?? []).join(", "));

      const ch = await fetchQuestChildren(questId);
      if (ch.ok && ch.data) {
        setChildren(ch.data.children);
      } else {
        setChildren([]);
      }

      if (isHabitQuest(normalized)) {
        const hist = await fetchQuestHistory(questId, 90);
        if (hist.ok && hist.data) {
          setCompletions(hist.data.completions);
        } else {
          setCompletions([]);
        }
      } else {
        setCompletions([]);
      }

      if (normalized.parentQuestId) {
        const [pq, sibRes] = await Promise.all([
          getQuestById(normalized.parentQuestId),
          fetchQuestChildren(normalized.parentQuestId),
        ]);
        setParentQuest(pq ? normalizeQuestBrain(pq) : null);
        if (sibRes.ok && sibRes.data) {
          setSiblings(sibRes.data.children.map((c) => normalizeQuestBrain(c)));
        } else {
          setSiblings([]);
        }
      } else {
        setParentQuest(null);
        setSiblings([]);
      }

      const links = normalized.links ?? [];
      const titles: Record<string, string> = {};
      await Promise.all(
        links.map(async (l) => {
          const tq = await getQuestById(l.questId);
          titles[l.questId] = tq?.title ?? `Quest ${l.questId.slice(-6)}`;
        }),
      );
      setLinkTitles(titles);

      const lf = await fetchQuestsLinkedFrom(questId);
      if (lf.ok && lf.data) {
        setLinkedFrom(lf.data.quests);
      } else {
        setLinkedFrom([]);
      }
    } finally {
      setLoading(false);
    }
  }, [questId, sessionUserId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!questId || !quest || !isHabitQuest(quest)) {
      setInsights(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      setInsightsLoading(true);
      const res = await fetchQuestInsights(questId, { weeks: 12 });
      if (cancelled) {
        return;
      }
      if (res.ok && res.data?.habit === true) {
        setInsights(res.data);
      } else {
        setInsights(null);
      }
      setInsightsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [questId, quest, completions.length]);

  useEffect(() => {
    if (linkSearchDebounceRef.current) {
      clearTimeout(linkSearchDebounceRef.current);
    }
    const q = linkSearchQuery.trim();
    if (!q || !quest) {
      setLinkSearchOptions([]);
      return;
    }
    linkSearchDebounceRef.current = setTimeout(() => {
      void (async () => {
        const res = await searchQuests({ q, limit: 24 });
        if (!res.ok || !res.data) {
          setLinkSearchOptions([]);
          return;
        }
        const linkedIds = new Set((quest.links ?? []).map((l) => l.questId));
        linkedIds.add(quest._id);
        const opts = res.data.quests
          .filter((h) => !linkedIds.has(h._id))
          .map((h) => ({ id: h._id, title: h.title }));
        setLinkSearchOptions(opts);
      })();
    }, 220);
    return () => {
      if (linkSearchDebounceRef.current) {
        clearTimeout(linkSearchDebounceRef.current);
      }
    };
  }, [linkSearchQuery, quest]);

  const cadence = useMemo(() => (quest ? normalizeQuestCadence(quest) : null), [quest]);
  const habit = quest ? isHabitQuest(quest) : false;
  const dueLabel = quest ? formatDueLabel(quest.dueDate ?? undefined) : null;

  const streak = useMemo(() => {
    if (!quest || !cadence) return 0;
    const points: CompletionHistoryPoint[] = completions.map((c) => ({
      completionDate: c.date,
      xpEarned: c.xp,
    }));
    return streakFromLogs(points, cadence);
  }, [quest, cadence, completions]);

  const heatmapCells: HeatmapCell[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of completions) {
      counts.set(c.date, (counts.get(c.date) ?? 0) + 1);
    }
    const cells: HeatmapCell[] = [];
    for (const [date, n] of counts) {
      cells.push({ date, intensity: Math.min(4, n) });
    }
    return cells;
  }, [completions]);

  const childProgressPct = useMemo(() => {
    if (!children.length) return 0;
    const done = children.filter((c) => c.status === "completed").length;
    return Math.round((done / children.length) * 100);
  }, [children]);

  async function handleSaveTags() {
    if (!quest) return;
    const raw = tagDraft
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setTagsBusy(true);
    try {
      const res = await updateQuestTags(quest._id, raw);
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Tags failed" }));
        return;
      }
      pushToast({ tone: "success", title: "Tags saved", message: "" });
      await reload();
    } finally {
      setTagsBusy(false);
    }
  }

  async function submitNote(kind: "note" | "reflection") {
    if (!quest || !newNoteBody.trim()) return;
    setNoteBusy(true);
    try {
      const res = await createQuestNote(quest._id, newNoteBody.trim(), { kind });
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Note failed" }));
        return;
      }
      setNewNoteBody("");
      await reload();
    } finally {
      setNoteBusy(false);
    }
  }

  const filteredNotes = useMemo(() => {
    const notes = quest?.notes ?? [];
    if (noteFilter === "reflection") {
      return notes.filter((n) => n.kind === "reflection");
    }
    return notes;
  }, [quest?.notes, noteFilter]);

  async function handleDeleteNote(noteId: string) {
    if (!quest) return;
    const res = await deleteQuestNote(quest._id, noteId);
    if (!res.ok) {
      pushToast(actionResultToToast(res, { fallbackErrorTitle: "Delete failed" }));
      return;
    }
    await reload();
  }

  async function handleLinkPickerSelect(id: string | null) {
    if (!quest || !id) {
      return;
    }
    setLinkBusy(true);
    try {
      const res = await createQuestLink(quest._id, {
        questId: id,
        kind: newLinkKind,
      });
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Link failed" }));
        return;
      }
      setLinkSearchQuery("");
      await reload();
    } finally {
      setLinkBusy(false);
    }
  }

  async function handleDeleteLink(linkId: string) {
    if (!quest) return;
    const res = await deleteQuestLink(quest._id, linkId);
    if (!res.ok) {
      pushToast(actionResultToToast(res, { fallbackErrorTitle: "Unlink failed" }));
      return;
    }
    await reload();
  }

  async function handleReorderChild(index: number, direction: -1 | 1) {
    if (!quest || reorderBusy) return;
    const target = index + direction;
    if (target < 0 || target >= children.length) {
      return;
    }
    const next = [...children];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    const orderedChildIds = next.map((c) => c._id);
    setReorderBusy(true);
    try {
      const res = await reorderChildQuests(quest._id, orderedChildIds);
      if (!res.ok || !res.data) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Reorder failed" }));
        return;
      }
      setChildren(res.data.children);
    } finally {
      setReorderBusy(false);
    }
  }

  async function handleCreateChild() {
    if (!quest || !newChildTitle.trim()) return;
    setChildBusy(true);
    try {
      const res = await createChildQuest(quest._id, {
        title: newChildTitle.trim(),
        description: newChildDescription.trim() || "—",
        difficulty: "easy",
        category: quest.category,
        cadence: { kind: "oneoff" },
      });
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Create subtask failed" }));
        return;
      }
      setNewChildTitle("");
      setNewChildDescription("");
      setChildSheetOpen(false);
      await reload();
    } finally {
      setChildBusy(false);
    }
  }

  async function handleRecoverStreak() {
    if (!quest || !quest.streakRecover?.eligible) return;
    setRecoverBusy(true);
    try {
      const res = await recoverStreak(quest._id);
      if (!res.ok || !res.data) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Recover failed" }));
        return;
      }
      pushToast({
        tone: "success",
        title: "Streak recovered",
        message: `Filled UTC day ${res.data.missedDateKey} (no XP).`,
      });
      await reload();
    } finally {
      setRecoverBusy(false);
    }
  }

  async function handleComplete() {
    if (!quest) return;
    let cascadeCompleteChildren = false;
    const activeOneOffChildren = children.filter((c) => c.status === "active" && !isHabitQuest(c));
    if (activeOneOffChildren.length > 0) {
      cascadeCompleteChildren = window.confirm(
        `Also complete ${activeOneOffChildren.length} active one-off subtask(s)? Cancel completes only this quest.`,
      );
    }
    setCompleteBusy(true);
    try {
      const res = await completeQuestById(quest._id, { cascadeCompleteChildren });
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Complete failed" }));
        return;
      }
      const copy = res.data ? completionToastCopy(res.data) : { title: "Completed", message: "" };
      pushToast({ tone: "success", title: copy.title, message: copy.message });
      if (res.data?.milestoneReward && typeof document !== "undefined") {
        document.body.classList.add("sq-milestone-celebration");
        window.setTimeout(() => document.body.classList.remove("sq-milestone-celebration"), 2200);
      }
      await reload();
    } finally {
      setCompleteBusy(false);
    }
  }

  async function handleUndo() {
    if (!quest) return;
    setUndoBusy(true);
    try {
      const res = await undoQuestCompletion(quest._id, habit ? { date: selectedHabitUndoDate ?? undefined } : {});
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Undo failed" }));
        return;
      }
      setSelectedHabitUndoDate(null);
      pushToast({ tone: "success", title: "Completion undone", message: "" });
      await reload();
    } finally {
      setUndoBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="mx-auto flex max-w-3xl flex-1 items-center justify-center p-6">
        <p>Loading…</p>
      </main>
    );
  }

  if (!sessionUserId) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Sign in to view this quest.
        </p>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </main>
    );
  }

  if (notFound || (!loading && !quest)) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold">Quest not found</h1>
        <Link href="/quests/view" className="text-sm underline">
          Back to list
        </Link>
      </main>
    );
  }

  if (loading || !quest) {
    return (
      <main className="mx-auto flex max-w-3xl flex-1 items-center justify-center p-6">
        <p style={{ color: "var(--color-text-secondary)" }}>Loading quest…</p>
      </main>
    );
  }

  const canUndoOneoff = !habit && quest.status === "completed";
  const canUndoHabit = habit && Boolean(selectedHabitUndoDate);

  return (
    <div className="relative min-h-screen" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/quests/view"
            className="text-sm font-medium underline"
            style={{ color: "var(--color-text-secondary)" }}
          >
            All quests
          </Link>
          <span style={{ color: "var(--color-text-tertiary)" }}>/</span>
          <span className="text-sm font-medium">Detail</span>
        </div>

        {quest.parentQuestId && parentQuest ? (
          <Card variant="surface" className="p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left text-sm font-semibold"
              onClick={() => setHierarchyOpen((o) => !o)}
              aria-expanded={hierarchyOpen}
            >
              Parent & siblings
              <span style={{ color: "var(--color-text-tertiary)" }}>{hierarchyOpen ? "−" : "+"}</span>
            </button>
            {hierarchyOpen ? (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                    Parent
                  </p>
                  <Link
                    href={`/quests/${parentQuest._id}`}
                    className="text-sm font-semibold underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {parentQuest.title}
                  </Link>
                </div>
                {siblings.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                      Siblings
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {siblings.map((s) => (
                        <Link
                          key={s._id}
                          href={`/quests/${s._id}`}
                          className="rounded-lg border px-2 py-1 text-xs font-medium"
                          style={{
                            borderColor: s._id === quest._id ? "var(--color-primary)" : "var(--color-border-default)",
                            background: s._id === quest._id ? "var(--color-primary-subtle)" : "var(--color-bg-surface)",
                          }}
                        >
                          {s.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>
        ) : null}

        <Card variant="elevated" className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-2xl font-semibold">{quest.title}</h1>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {quest.description}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="status">{quest.category}</Badge>
                <Badge variant="difficulty">{quest.difficulty}</Badge>
                <Badge variant="cadence">+{quest.xpReward} XP</Badge>
                {quest.status === "completed" ? <Badge variant="status">Completed</Badge> : <Badge variant="cadence">Active</Badge>}
                {habit && cadence ? (
                  <>
                    <HabitChip cadence={cadence} streak={streak} />
                    <StreakFlame streak={streak} />
                  </>
                ) : dueLabel ? (
                  <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Due {dueLabel}
                  </span>
                ) : null}
                {!habit && cadence ? (
                  <Badge variant="cadence">{formatCadenceShort(cadence)}</Badge>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-3">
              {children.length > 0 ? (
                <ProgressRing percent={childProgressPct} label={<span>Subtasks</span>} aria-label="Child quest completion" />
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <Link
                  href={`/quests/${quest._id}/edit`}
                  className="inline-flex min-h-8 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{
                    borderColor: "var(--color-border-default)",
                    background: "var(--color-bg-elevated)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Edit
                </Link>
                {quest.status === "active" ? (
                  <Button type="button" variant="primary" size="sm" disabled={completeBusy} onClick={() => void handleComplete()}>
                    {completeBusy ? "…" : "Complete"}
                  </Button>
                ) : null}
                {canUndoOneoff ? (
                  <Button type="button" variant="secondary" size="sm" disabled={undoBusy} onClick={() => void handleUndo()}>
                    Undo completion
                  </Button>
                ) : null}
                {habit && quest.status === "active" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={undoBusy || !canUndoHabit}
                    onClick={() => void handleUndo()}
                  >
                    {undoBusy ? "…" : "Undo day"}
                  </Button>
                ) : null}
                {habit && quest.status === "active" && quest.streakRecover?.eligible ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={recoverBusy}
                    onClick={() => void handleRecoverStreak()}
                  >
                    {recoverBusy ? "…" : "Recover streak (1 token)"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
          {habit && selectedHabitUndoDate ? (
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Selected UTC day: {selectedHabitUndoDate}
            </p>
          ) : null}
        </Card>

        {habit ? (
          <Card variant="surface" className="p-4">
            <h2 className="mb-2 text-sm font-semibold">Last 90 days</h2>
            <CalendarHeatmap
              cells={heatmapCells}
              numWeeks={13}
              onCellClick={(date) => {
                const has = completions.some((c) => c.date === date);
                if (has) setSelectedHabitUndoDate(date);
                else setSelectedHabitUndoDate(null);
              }}
            />
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Tap a day with completions to select it, then Undo day. List view has no undo (quick complete only).
            </p>
          </Card>
        ) : null}

        {habit ? (
          <Card variant="surface" className="space-y-3 p-4">
            <h2 className="text-sm font-semibold">Insights</h2>
            {insightsLoading ? (
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Loading insights…
              </p>
            ) : insights ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border-subtle)" }}>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                      Current streak
                    </p>
                    <p className="text-lg font-semibold">{insights.currentStreak}</p>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border-subtle)" }}>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                      Longest streak
                    </p>
                    <p className="text-lg font-semibold">{insights.longestStreak}</p>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border-subtle)" }}>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                      Busiest weekday (UTC)
                    </p>
                    <p className="text-lg font-semibold">
                      {insights.bestDayOfWeek ? `${insights.bestDayOfWeek.label} (${insights.bestDayOfWeek.count})` : "—"}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[280px] text-left text-xs">
                    <thead style={{ color: "var(--color-text-tertiary)" }}>
                      <tr>
                        <th className="py-1 pr-2">Week start (UTC)</th>
                        <th className="py-1 pr-2">Completions</th>
                        <th className="py-1 pr-2">XP</th>
                        <th className="py-1">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.weeks.slice(-8).map((w: QuestInsightsWeekRow) => (
                        <tr key={w.weekStart}>
                          <td className="py-1 pr-2 font-medium">{w.weekStart}</td>
                          <td className="py-1 pr-2">{w.completions}</td>
                          <td className="py-1 pr-2">{w.xpTotal}</td>
                          <td className="py-1">{w.completionRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  Weekly rate compares completions to a 7-day baseline (5 for weekday-only cadence). Container parents do
                  not award XP on completion; subtask XP still rolls up normally.
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                No insights available.
              </p>
            )}
          </Card>
        ) : null}

        <Card variant="surface" className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Subtasks</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => setChildSheetOpen(true)}>
              Add subtask
            </Button>
          </div>
          {children.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No subtasks yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {children.map((c, index) => (
                <li key={c._id} className="flex items-center gap-2">
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 min-w-8 px-1 text-xs"
                      disabled={reorderBusy || index === 0}
                      onClick={() => void handleReorderChild(index, -1)}
                      aria-label="Move subtask up"
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 min-w-8 px-1 text-xs"
                      disabled={reorderBusy || index === children.length - 1}
                      onClick={() => void handleReorderChild(index, 1)}
                      aria-label="Move subtask down"
                    >
                      ↓
                    </Button>
                  </div>
                  <Link
                    href={`/quests/${c._id}`}
                    className="flex min-w-0 flex-1 items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
                  >
                    <span className={c.status === "completed" ? "text-[var(--color-text-tertiary)] line-through" : ""}>
                      {c.title}
                    </span>
                    <Badge variant="status">{c.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card variant="surface" className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {(quest.tags ?? []).map((tag) => (
              <Link key={tag} href={`/quests/view?tag=${encodeURIComponent(tag)}`}>
                <TagChip label={tag} />
              </Link>
            ))}
          </div>
          <textarea
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
            placeholder="Comma-separated tags"
          />
          <Button type="button" variant="primary" size="sm" disabled={tagsBusy} onClick={() => void handleSaveTags()}>
            {tagsBusy ? "Saving…" : "Save tags"}
          </Button>
        </Card>

        <Card variant="surface" className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Notes</h2>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={noteFilter === "all" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setNoteFilter("all")}
              >
                All
              </Button>
              <Button
                type="button"
                variant={noteFilter === "reflection" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setNoteFilter("reflection")}
              >
                Reflections
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {filteredNotes.map((n) => (
              <NoteCard
                key={n.id}
                createdAtLabel={new Date(n.createdAt).toLocaleString()}
                tag={n.kind === "reflection" ? "Reflection" : undefined}
                body={n.body}
                onDelete={() => void handleDeleteNote(n.id)}
              />
            ))}
          </div>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              void submitNote("note");
            }}
          >
            <textarea
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
              placeholder="Add a note…"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="secondary" size="sm" disabled={noteBusy}>
                {noteBusy ? "Adding…" : "Add note"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={noteBusy}
                onClick={() => void submitNote("reflection")}
              >
                {noteBusy ? "Adding…" : "Add reflection"}
              </Button>
            </div>
          </form>
        </Card>

        <Card variant="surface" className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Linked from</h2>
          {linkedFrom.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No other quests link here yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {linkedFrom.map((q) => (
                <li key={q._id}>
                  <Link
                    href={`/quests/${q._id}`}
                    className="block rounded-lg border px-3 py-2 text-sm font-medium underline"
                    style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
                  >
                    {q.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card variant="surface" className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Linked quests</h2>
          {(quest.links ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No links yet. Search below to link another quest.
            </p>
          ) : (
            <ul className="space-y-2">
              {(quest.links ?? []).map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border-subtle)" }}
                >
                  <div className="min-w-0">
                    <Link href={`/quests/${l.questId}`} className="font-medium underline">
                      {linkTitles[l.questId] ?? l.questId}
                    </Link>
                    <span className="ml-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {l.kind}
                    </span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void handleDeleteLink(l.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Link kind
              <select
                value={newLinkKind}
                onChange={(e) => setNewLinkKind(e.target.value as QuestLinkKind)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm sm:max-w-xs"
                style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
              >
                <option value="related">related</option>
                <option value="blocks">blocks</option>
                <option value="depends-on">depends-on</option>
              </select>
            </label>
            <LinkPicker
              id={linkPickerFieldId}
              label="Add link"
              query={linkSearchQuery}
              onQueryChange={setLinkSearchQuery}
              options={linkSearchOptions}
              selectedId={null}
              onSelect={(id) => void handleLinkPickerSelect(id)}
              placeholder="Search by title, tag, or note…"
              emptyLabel="No quests match that search."
              helperText="Pick a quest to create the link. Escape clears the field."
            />
            {linkBusy ? (
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Saving link…
              </p>
            ) : null}
          </div>
        </Card>
      </main>

      <Sheet open={childSheetOpen} onOpenChange={setChildSheetOpen} title="New subtask">
        <div className="flex flex-col gap-3 p-1">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Title
            <input
              value={newChildTitle}
              onChange={(e) => setNewChildTitle(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
            />
          </label>
          <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Description
            <textarea
              value={newChildDescription}
              onChange={(e) => setNewChildDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
            />
          </label>
          <Button type="button" variant="primary" disabled={childBusy} onClick={() => void handleCreateChild()}>
            {childBusy ? "Creating…" : "Create subtask"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
