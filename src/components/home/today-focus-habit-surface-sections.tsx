"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HabitChip } from "@/components/ui/habit-chip";
import { StreakFlame } from "@/components/ui/streak-flame";
import { normalizeQuestCadence } from "@/lib/cadence";
import type { TodayHabitSurfacePayload } from "@/types/today-dashboard";

export type TodayFocusHabitSurfaceSectionsProps = {
  habitSurface: TodayHabitSurfacePayload;
  completingId: string | null;
  onCompleteHabit: (questId: string) => void;
};

export function TodayFocusHabitSurfaceSections({
  habitSurface,
  completingId,
  onCompleteHabit,
}: TodayFocusHabitSurfaceSectionsProps) {
  const { habitsDue, atRisk, captured } = habitSurface;
  const showAnything = habitsDue.length > 0 || atRisk.length > 0 || captured.length > 0;
  if (!showAnything) {
    return null;
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      {habitsDue.length > 0 ? (
        <section aria-label="Habits due today">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Habits due today
          </h2>
          <div className="space-y-2">
            {habitsDue.map((row) => {
              const cadence = normalizeQuestCadence(row.quest);
              return (
                <Card key={row.quest._id} variant="surface" className="p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/quests/${row.quest._id}`}
                      className="min-w-0 flex-1 truncate text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {row.quest.title}
                    </Link>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <HabitChip cadence={cadence} streak={row.streak} />
                      <StreakFlame streak={row.streak} />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={Boolean(completingId)}
                      onClick={() => onCompleteHabit(row.quest._id)}
                    >
                      {completingId === row.quest._id ? "…" : "Complete"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {atRisk.length > 0 ? (
        <section aria-label="At-risk streaks">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            At-risk streaks
          </h2>
          <div
            className="rounded-xl border px-3 py-2 text-xs"
            style={{
              borderColor: "var(--color-warning)",
              background: "var(--color-warning-subtle)",
              color: "var(--color-text-primary)",
            }}
          >
            <p className="mb-2 font-medium" style={{ color: "var(--color-warning)" }}>
              Complete today to protect a streak of 3+.
            </p>
            <ul className="space-y-1.5">
              {atRisk.map((row) => (
                <li key={row.quest._id} className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/quests/${row.quest._id}`} className="font-medium underline">
                    {row.quest.title}
                  </Link>
                  <span className="flex items-center gap-1">
                    <StreakFlame streak={row.streak} />
                    <span style={{ color: "var(--color-text-secondary)" }}>{row.streak}d</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {captured.length > 0 ? (
        <section aria-label="Captured this week">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Captured this week
          </h2>
          <ul className="space-y-2">
            {captured.map((q) => (
              <li key={q._id}>
                <Link
                  href={`/quests/${q._id}`}
                  className="block rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
                >
                  {q.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
