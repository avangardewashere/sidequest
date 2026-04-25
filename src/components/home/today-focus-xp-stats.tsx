"use client";

import type { TodayStatItem, TodayXpData } from "@/components/home/today-focus-mock-data";

type TodayFocusXpStatsProps = {
  xp: TodayXpData;
  stats: TodayStatItem[];
};

const iconByStat: Record<TodayStatItem["icon"], string> = {
  check: "Done",
  flame: "Streak",
  timer: "Focus",
  target: "Goal",
};

export function TodayFocusXpStats({ xp, stats }: TodayFocusXpStatsProps) {
  const progressPct = Math.min(100, Math.max(0, (xp.currentXp / xp.nextLevelXp) * 100));

  return (
    <section className="px-4">
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: "var(--color-border-subtle)",
          background: "var(--color-bg-surface)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            {xp.roleLabel} LV. {xp.level}
          </p>
          <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
            {xp.currentXp}/{xp.nextLevelXp} XP
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--color-primary-subtle)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%`, background: "var(--color-primary)" }}
          />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <article
            key={stat.id}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
              {iconByStat[stat.icon]} · {stat.label}
            </p>
            <p className="mt-1 text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {stat.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
