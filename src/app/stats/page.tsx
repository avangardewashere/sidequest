"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { levelFromTotalXp } from "@/lib/xp";
import { CalendarHeatmap, type HeatmapCell } from "@/components/ui/calendar-heatmap";
import { ChartShell, ThemedChartTooltip } from "@/components/stats/chart-shell";
import { RangeSwitcher } from "@/components/stats/range-switcher";
import { StatCard } from "@/components/stats/stat-card";
import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";
import { WeeklyReviewCard } from "@/components/review/weekly-review-card";
import { HistoricalReviewCard } from "@/components/review/historical-review-card";
import { EventAnalyticsCard } from "@/components/stats/event-analytics-card";
import { useStats } from "@/hooks/useStats";
import {
  fetchEventAnalytics,
  fetchHistoricalReview,
  fetchWeeklyReview,
  type EventAnalytics,
  type HistoricalReview,
  type WeeklyReview,
} from "@/lib/client-api";

function percentDelta(current: number, previous: number): number {
  if (previous === 0 && current === 0) {
    return 0;
  }
  if (previous === 0) {
    return 100;
  }
  return ((current - previous) / previous) * 100;
}

function isWeekend(dateKey: string): boolean {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function shortDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const CATEGORY_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
];

type StatsChartPoint = {
  date: string;
  value: number;
  dateShort: string;
  weekend: boolean;
  key: string;
};

export default function StatsPage() {
  const { data, isLoading, error, range, setRange, refresh } = useStats("7d");
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [weeklyReviewLoading, setWeeklyReviewLoading] = useState(true);
  const [weeklyReviewError, setWeeklyReviewError] = useState<string | null>(null);
  const [historicalReview, setHistoricalReview] = useState<HistoricalReview | null>(null);
  const [historicalReviewLoading, setHistoricalReviewLoading] = useState(true);
  const [historicalReviewError, setHistoricalReviewError] = useState<string | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [eventAnalyticsLoading, setEventAnalyticsLoading] = useState(true);
  const [eventAnalyticsError, setEventAnalyticsError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const completionsSparkline = data?.completionsByDay.map((point) => point.value) ?? [];
  const xpSparkline = data?.xpByDay.map((point) => point.value) ?? [];
  const avgXpSparkline =
    data?.xpByDay.map((point, index) => {
      const denominator = index + 1;
      const runningTotal = data.xpByDay.slice(0, denominator).reduce((sum, item) => sum + item.value, 0);
      const runningCompletions = data.completionsByDay
        .slice(0, denominator)
        .reduce((sum, item) => sum + item.value, 0);
      return runningCompletions === 0 ? 0 : Number((runningTotal / runningCompletions).toFixed(1));
    }) ?? [];
  const avgCompletionsSparkline =
    data?.completionsByDay.map((_, index) => {
      const denominator = index + 1;
      const runningCompletions = data.completionsByDay
        .slice(0, denominator)
        .reduce((sum, item) => sum + item.value, 0);
      return Number((runningCompletions / denominator).toFixed(1));
    }) ?? [];
  const xpLineData = useMemo(() => {
    if (!data) {
      return [] as Array<{ date: string; value: number; cumulativeXp: number; levelUpTo: number | null }>;
    }
    let cumulativeXp = 0;
    let previousLevel = 1;
    return data.xpByDay.map((point) => {
      cumulativeXp += point.value;
      const nextLevel = levelFromTotalXp(cumulativeXp);
      const levelUpTo = nextLevel > previousLevel ? nextLevel : null;
      previousLevel = nextLevel;
      return {
        date: point.date,
        value: point.value,
        cumulativeXp,
        levelUpTo,
      };
    });
  }, [data]);
  const donutData = useMemo(() => {
    const base = data?.byCategory ?? [];
    if (!selectedCategory) {
      return base;
    }
    return base.filter((entry) => entry.category === selectedCategory);
  }, [data, selectedCategory]);
  const hasCompletionHistory = (data?.completionsByDay ?? []).some((point) => point.value > 0);
  const hasXpHistory = (data?.xpByDay ?? []).some((point) => point.value > 0);
  const hasCategoryData = (data?.byCategory?.length ?? 0) > 0;
  const hasAnyHistory = hasCompletionHistory || hasXpHistory || hasCategoryData;
  const completionChartData = useMemo<StatsChartPoint[]>(
    () =>
      (data?.completionsByDay ?? []).map((point, index) => ({
        ...point,
        dateShort: shortDateLabel(point.date),
        weekend: isWeekend(point.date),
        key: `${point.date}-${index}`,
      })),
    [data?.completionsByDay],
  );
  const xpChartData = useMemo(
    () =>
      xpLineData.map((point, index) => ({
        ...point,
        dateShort: shortDateLabel(point.date),
        key: `${point.date}-${index}`,
      })),
    [xpLineData],
  );

  const habitHeatmapCells = useMemo<HeatmapCell[]>(() => {
    const pts = data?.habitCompletionsByDay ?? [];
    const max = Math.max(0, ...pts.map((p) => p.value));
    if (max === 0) {
      return [];
    }
    return pts
      .filter((p) => p.value > 0)
      .map((p) => ({
        date: p.date,
        intensity: Math.min(4, Math.round((4 * p.value) / max)),
      }));
  }, [data?.habitCompletionsByDay]);

  const hasWeeklyXp = useMemo(() => (data?.weeklyXpByWeek ?? []).some((w) => w.xp > 0), [data?.weeklyXpByWeek]);
  const hasHabitTop = useMemo(() => (data?.habitsTopByStreak ?? []).length > 0, [data?.habitsTopByStreak]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      setWeeklyReviewLoading(true);
      setWeeklyReviewError(null);
      const result = await fetchWeeklyReview();
      if (!active) {
        return;
      }
      if (!result.ok || !result.data) {
        setWeeklyReviewError(result.message ?? "Failed to load weekly review.");
        setWeeklyReviewLoading(false);
        return;
      }
      setWeeklyReview(result.data.weeklyReview);
      setWeeklyReviewLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      setHistoricalReviewLoading(true);
      setHistoricalReviewError(null);
      const result = await fetchHistoricalReview(4);
      if (!active) {
        return;
      }
      if (!result.ok || !result.data) {
        setHistoricalReviewError(result.message ?? "Failed to load historical review.");
        setHistoricalReviewLoading(false);
        return;
      }
      setHistoricalReview(result.data.historicalReview);
      setHistoricalReviewLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      setEventAnalyticsLoading(true);
      setEventAnalyticsError(null);
      const result = await fetchEventAnalytics(range);
      if (!active) {
        return;
      }
      if (!result.ok || !result.data) {
        setEventAnalyticsError(result.message ?? "Failed to load event analytics.");
        setEventAnalyticsLoading(false);
        return;
      }
      setEventAnalytics(result.data.analytics);
      setEventAnalyticsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [range]);

  function handleResetStatsClick() {
    const confirmed = window.confirm(
      "Reset stats is not wired yet. This is a preview action only. Continue?",
    );
    if (!confirmed) {
      return;
    }
    setResetNotice("Reset flow preview only. No data was changed.");
    window.setTimeout(() => setResetNotice(null), 3500);
  }

  return (
    <AuthenticatedAppShell>
      <div className="relative min-h-screen">
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Progress Stats
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Personal analytics for completions, XP, streaks, and categories.
          </p>
        </div>
        <RangeSwitcher value={range} onChange={setRange} disabled={isLoading} />
      </div>

      {weeklyReviewLoading ? (
        <section
          className="rounded-xl border p-4 text-sm"
          style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>Loading weekly review...</p>
        </section>
      ) : null}

      {!weeklyReviewLoading && weeklyReviewError ? (
        <section
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: "var(--color-warning)",
            background: "var(--color-warning-subtle)",
            color: "var(--color-warning)",
          }}
        >
          <p>{weeklyReviewError}</p>
        </section>
      ) : null}

      {!weeklyReviewLoading && !weeklyReviewError && weeklyReview ? (
        <WeeklyReviewCard review={weeklyReview} />
      ) : null}

      {historicalReviewLoading ? (
        <section
          className="rounded-xl border p-4 text-sm"
          style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>Loading historical review...</p>
        </section>
      ) : null}

      {!historicalReviewLoading && historicalReviewError ? (
        <section
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: "var(--color-warning)",
            background: "var(--color-warning-subtle)",
            color: "var(--color-warning)",
          }}
        >
          <p>{historicalReviewError}</p>
        </section>
      ) : null}

      {!historicalReviewLoading && !historicalReviewError && historicalReview ? (
        <HistoricalReviewCard review={historicalReview} />
      ) : null}

      {eventAnalyticsLoading ? (
        <section
          className="rounded-xl border p-4 text-sm"
          style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>Loading event analytics...</p>
        </section>
      ) : null}

      {!eventAnalyticsLoading && eventAnalyticsError ? (
        <section
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: "var(--color-warning)",
            background: "var(--color-warning-subtle)",
            color: "var(--color-warning)",
          }}
        >
          <p>{eventAnalyticsError}</p>
        </section>
      ) : null}

      {!eventAnalyticsLoading && !eventAnalyticsError && eventAnalytics ? (
        <EventAnalyticsCard analytics={eventAnalytics} />
      ) : null}

      {error ? (
        <div
          className="rounded-xl border p-4 text-sm"
          style={{ borderColor: "var(--color-warning)", background: "var(--color-warning-subtle)", color: "var(--color-warning)" }}
        >
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 rounded-md border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
            onClick={() => void refresh()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && !hasAnyHistory ? (
        <section
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            No quest history yet — complete one to start your saga.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex rounded-md border px-3 py-2 text-sm font-medium"
            style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
          >
            Go to Home
          </Link>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          loading={isLoading}
          label="Total completions"
          value={String(data?.kpis.totalCompletions ?? 0)}
          delta={
            data
              ? percentDelta(data.kpis.totalCompletions, data.previousPeriod.totalCompletions)
              : undefined
          }
          sparkline={completionsSparkline}
        />
        <StatCard
          loading={isLoading}
          label="Total XP"
          value={String(data?.kpis.totalXp ?? 0)}
          delta={data ? percentDelta(data.kpis.totalXp, data.previousPeriod.totalXp) : undefined}
          sparkline={xpSparkline}
        />
        <StatCard
          loading={isLoading}
          label="Avg XP / completion"
          value={String(data?.kpis.avgXpPerCompletion ?? 0)}
          delta={
            data
              ? percentDelta(data.kpis.avgXpPerCompletion, data.previousPeriod.avgXpPerCompletion)
              : undefined
          }
          sparkline={avgXpSparkline}
        />
        <StatCard
          loading={isLoading}
          label="Avg completions / day"
          value={String(data?.kpis.avgCompletionsPerDay ?? 0)}
          delta={
            data
              ? percentDelta(data.kpis.avgCompletionsPerDay, data.previousPeriod.avgCompletionsPerDay)
              : undefined
          }
          subtitle={
            data ? `Streak ${data.streakHistory.current} (best ${data.streakHistory.longest})` : undefined
          }
          sparkline={avgCompletionsSparkline}
        />
      </section>

      {!isLoading && data ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <ChartShell
            title="Top habits by streak (range)"
            loading={false}
            isEmpty={!hasHabitTop}
            emptyMessage="No habit completions in this range yet."
          >
            <ul className="space-y-2 text-sm">
              {(data.habitsTopByStreak ?? []).map((h) => (
                <li key={h.questId} className="flex items-center justify-between gap-2">
                  <Link href={`/quests/${h.questId}`} className="min-w-0 truncate font-medium underline">
                    {h.title}
                  </Link>
                  <span style={{ color: "var(--color-text-secondary)" }}>{h.streak}d</span>
                </li>
              ))}
            </ul>
          </ChartShell>
          <ChartShell
            title="Habit completions (all habits)"
            loading={false}
            isEmpty={habitHeatmapCells.length === 0}
            emptyMessage="No habit activity in this range."
          >
            <CalendarHeatmap
              cells={habitHeatmapCells}
              numWeeks={Math.min(13, Math.max(1, Math.ceil(data.rangeDays / 7)))}
            />
          </ChartShell>
          <ChartShell
            title="XP by week (UTC Monday)"
            loading={false}
            isEmpty={!hasWeeklyXp}
            emptyMessage="No XP from completions in this range."
          >
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyXpByWeek ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 10 }} />
                  <YAxis width={36} tick={{ fontSize: 10 }} />
                  <Tooltip content={<ThemedChartTooltip />} />
                  <Bar dataKey="xp" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartShell>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartShell
          title="Daily Completions"
          loading={isLoading}
          isEmpty={!hasCompletionHistory}
          emptyMessage="No completion history in this range yet."
          footer={
            !isLoading ? (
              <details>
                <summary
                  className="cursor-pointer text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  View underlying data table
                </summary>
                <div className="mt-2 overflow-auto rounded-md border" style={{ borderColor: "var(--color-border-subtle)" }}>
                  <table className="w-full min-w-[260px] text-left text-xs">
                    <thead style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                      <tr>
                        <th className="px-2 py-1.5">Date</th>
                        <th className="px-2 py-1.5">Completions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completionChartData.map((point) => (
                        <tr key={`completion-row-${point.key}`} style={{ color: "var(--color-text-primary)" }}>
                          <td className="px-2 py-1.5">{point.date}</td>
                          <td className="px-2 py-1.5">{point.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null
          }
        >
          {hasCompletionHistory ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateShort" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ThemedChartTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Completions" radius={[6, 6, 0, 0]}>
                    {completionChartData.map((point) => (
                      <Cell
                        key={`completion-bar-${point.key}`}
                        fill={point.weekend ? "var(--color-text-tertiary)" : "var(--color-primary)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </ChartShell>

        <ChartShell
          title="XP Over Time"
          loading={isLoading}
          isEmpty={!hasXpHistory}
          emptyMessage="No XP history in this range yet."
          footer={
            !isLoading ? (
              <details>
                <summary
                  className="cursor-pointer text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  View underlying data table
                </summary>
                <div className="mt-2 overflow-auto rounded-md border" style={{ borderColor: "var(--color-border-subtle)" }}>
                  <table className="w-full min-w-[260px] text-left text-xs">
                    <thead style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                      <tr>
                        <th className="px-2 py-1.5">Date</th>
                        <th className="px-2 py-1.5">XP</th>
                        <th className="px-2 py-1.5">Level-Up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {xpChartData.map((point) => (
                        <tr key={`xp-row-${point.key}`} style={{ color: "var(--color-text-primary)" }}>
                          <td className="px-2 py-1.5">{point.date}</td>
                          <td className="px-2 py-1.5">{point.value}</td>
                          <td className="px-2 py-1.5">{point.levelUpTo ? `Lv. ${point.levelUpTo}` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null
          }
        >
          {hasXpHistory ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateShort" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ThemedChartTooltip />} />
                  <Legend />
                  <Line
                    dataKey="value"
                    name="XP"
                    type="monotone"
                    stroke="var(--color-secondary)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  {xpChartData
                    .filter((point) => point.levelUpTo)
                    .map((point) => (
                      <ReferenceDot
                        key={`level-up-${point.key}`}
                        x={point.dateShort}
                        y={point.value}
                        r={4}
                        fill="var(--color-secondary-strong)"
                        stroke="var(--color-bg-surface)"
                        strokeWidth={2}
                        ifOverflow="extendDomain"
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </ChartShell>

        <ChartShell
          title="Category Breakdown"
          loading={isLoading}
          isEmpty={!hasCategoryData}
          emptyMessage="No category data in this range yet."
          footer={
            !isLoading ? (
              <details>
                <summary
                  className="cursor-pointer text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  View underlying data table
                </summary>
                <div className="mt-2 overflow-auto rounded-md border" style={{ borderColor: "var(--color-border-subtle)" }}>
                  <table className="w-full min-w-[260px] text-left text-xs">
                    <thead style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                      <tr>
                        <th className="px-2 py-1.5">Category</th>
                        <th className="px-2 py-1.5">Completions</th>
                        <th className="px-2 py-1.5">XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCategory ? donutData : data?.byCategory ?? []).map((entry) => (
                        <tr key={`category-row-${entry.category}`} style={{ color: "var(--color-text-primary)" }}>
                          <td className="px-2 py-1.5 capitalize">{entry.category}</td>
                          <td className="px-2 py-1.5">{entry.count}</td>
                          <td className="px-2 py-1.5">{entry.xpTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null
          }
        >
          {hasCategoryData ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="h-52 w-full sm:w-[52%] sm:min-w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="xpTotal"
                      nameKey="category"
                      innerRadius={42}
                      outerRadius={72}
                      paddingAngle={2}
                      onClick={(entry: unknown) =>
                        setSelectedCategory((prev) =>
                          prev === (entry as { category?: string }).category
                            ? null
                            : ((entry as { category?: string }).category ?? null),
                        )
                      }
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={`category-slice-${entry.category}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ThemedChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {(data?.byCategory ?? []).map((entry, index) => {
                  const active = !selectedCategory || selectedCategory === entry.category;
                  return (
                    <button
                      key={`legend-${entry.category}`}
                      type="button"
                      onClick={() =>
                        setSelectedCategory((prev) => (prev === entry.category ? null : entry.category))
                      }
                      className="rounded-md border px-2 py-1 text-left"
                      style={{
                        borderColor: active
                          ? CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                          : "var(--color-border-subtle)",
                        opacity: active ? 1 : 0.55,
                      }}
                    >
                      <p className="text-xs font-semibold capitalize" style={{ color: "var(--color-text-primary)" }}>
                        {entry.category}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                        {entry.count} quests · {entry.xpTotal} XP
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </ChartShell>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="w-fit rounded-md border px-3 py-2 text-sm font-medium"
          style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
        >
          Back to Home
        </Link>
        <button
          type="button"
          className="w-fit rounded-md border px-3 py-2 text-sm font-medium"
          style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
          onClick={handleResetStatsClick}
        >
          Reset stats
        </button>
        {resetNotice ? (
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {resetNotice}
          </p>
        ) : null}
      </div>
        </main>
      </div>
    </AuthenticatedAppShell>
  );
}
