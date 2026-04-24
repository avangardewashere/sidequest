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
          borderColor: "var(--sq-border)",
          background: "linear-gradient(to bottom, var(--sq-surface) 0%, var(--sq-surface-alt) 100%)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sq-text-muted)" }}>
            {xp.roleLabel} LV. {xp.level}
          </p>
          <p className="text-xs font-medium" style={{ color: "var(--sq-text-muted)" }}>
            {xp.currentXp}/{xp.nextLevelXp} XP
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--sq-base-mid)" }}>
          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "var(--sq-accent)" }} />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <article
            key={stat.id}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--sq-border)", background: "var(--sq-surface)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--sq-text-muted)" }}>
              {iconByStat[stat.icon]} · {stat.label}
            </p>
            <p className="mt-1 text-lg font-semibold" style={{ color: "var(--sq-text)" }}>
              {stat.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
