"use client";

import type { TodayHeaderData } from "@/components/home/today-focus-mock-data";

type TodayFocusHeaderProps = {
  data: TodayHeaderData;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
};

export function TodayFocusHeader({ data, onMenuClick, onSearchClick }: TodayFocusHeaderProps) {
  return (
    <header className="flex items-end justify-between px-4 pt-5 pb-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="h-9 w-9 rounded-full border text-sm"
          style={{ borderColor: "var(--sq-border)", background: "var(--sq-surface)" }}
        >
          Menu
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--sq-text-muted)" }}>
            {data.dayLabel} · {data.dateLabel}
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--sq-text)" }}>
            {data.title}
          </h1>
        </div>
      </div>
      <button
        type="button"
        onClick={onSearchClick}
        aria-label="Search"
        className="h-9 w-9 rounded-full border text-xs"
        style={{ borderColor: "var(--sq-border)", background: "var(--sq-surface)" }}
      >
        Search
      </button>
    </header>
  );
}
