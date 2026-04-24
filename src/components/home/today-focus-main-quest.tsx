"use client";

import type { MainQuestData } from "@/components/home/today-focus-mock-data";

type TodayFocusMainQuestProps = {
  quest: MainQuestData;
  onStartFocus?: () => void;
  onOpenQuest?: () => void;
};

export function TodayFocusMainQuest({ quest, onStartFocus, onOpenQuest }: TodayFocusMainQuestProps) {
  const progressPct = Math.min(100, Math.max(0, quest.progressPct));

  return (
    <section className="px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sq-text-muted)" }}>
          Main Quest
        </p>
        <p className="text-xs font-medium" style={{ color: "var(--sq-text-muted)" }}>
          {quest.dueLabel}
        </p>
      </div>
      <article
        className="rounded-xl border p-4"
        style={{
          borderColor: "var(--sq-border-strong)",
          background: "linear-gradient(to bottom, var(--sq-surface) 0%, var(--sq-surface-alt) 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sq-text-muted)" }}>
              {quest.subtitle}
            </p>
            <h2 className="mt-1 text-base font-semibold" style={{ color: "var(--sq-text)" }}>
              {quest.title}
            </h2>
            <p className="mt-2 text-xs" style={{ color: "var(--sq-text-muted)" }}>
              {quest.subtaskProgressLabel} · {quest.focusTimeLabel}
            </p>
          </div>
          <span
            className="rounded-full border px-2 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--sq-border-strong)", color: "var(--sq-text)" }}
          >
            {quest.rewardXpLabel}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "var(--sq-base-mid)" }}>
          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "var(--sq-button)" }} />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onStartFocus}
            className="flex-1 rounded-full px-3 py-2 text-sm font-medium"
            style={{ background: "var(--sq-button)", color: "var(--sq-button-text)" }}
          >
            Start focus
          </button>
          <button
            type="button"
            onClick={onOpenQuest}
            className="rounded-full border px-3 py-2 text-sm font-medium"
            style={{ borderColor: "var(--sq-border-strong)", color: "var(--sq-text)" }}
          >
            {quest.ctaLabel}
          </button>
        </div>
      </article>
    </section>
  );
}
